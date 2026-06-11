import asyncio
import json
from datetime import datetime, timezone
from queue import Empty
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import ValidationError

import progress as progress_mod
from graph.index import promptgrade_graph
from models.schemas import AgentProgressEvent, Domain, EvaluationRequest, EvaluationResult

router = APIRouter()

# Legacy async queues kept for the GET /status endpoint
progress_queues: dict[str, asyncio.Queue] = {}


async def publish_event(evaluation_id: str, event: AgentProgressEvent) -> None:
    queue = progress_queues.setdefault(evaluation_id, asyncio.Queue())
    await queue.put(event.model_dump())


def _build_initial_state(prompt: str, domain: str, evaluation_id: str = "", reformat: bool = True, domain_hint: str = "") -> dict[str, Any]:
    return {
        "session_id": "",
        "original_prompt": prompt,
        "domain": domain,
        "current_prompt": prompt,
        "structured_prompt": "",
        "reformat_prompt": reformat,
        "domain_hint": domain_hint,
        "prompt_category": "",
        "previous_score": 0.0,
        "guard_status": "pass",
        "guard_message": "",
        "guard_suggestion": "",
        "guard_reason": "",
        "retries": 0,
        "best_score": 0.0,
        "score": 0.0,
        "dimensions": [],
        "failures": [],
        "recommendations": [],
        "iterations": [],
        "rewritten_prompt": "",
        "improvement_pct": 0.0,
        "diff": {"added": [], "removed": []},
        "final_prompt": "",
        "report_summary": "",
        "evaluation_id": evaluation_id,
    }


def _state_to_result(state: dict[str, Any]) -> dict[str, Any]:
    iterations = state.get("iterations", [])
    original_score = float(iterations[0]["score"]) if iterations else 0.0
    return {
        "evaluationId": state["evaluation_id"],
        "originalPrompt": state["original_prompt"],
        "structuredPrompt": state.get("structured_prompt") or state["original_prompt"],
        "finalPrompt": state["final_prompt"],
        "domain": state["domain"],
        "originalScore": original_score,
        "finalScore": float(state.get("best_score", original_score)),
        "improvementPct": float(state.get("improvement_pct", 0.0)),
        "iterationCount": len(iterations),
        "iterations": iterations,
        "diff": state.get("diff", {"added": [], "removed": []}),
        "createdAt": "",
    }


async def _run_streaming(initial_state: dict[str, Any]):
    """
    Async generator that runs the LangGraph pipeline in a thread and yields
    SSE lines: progress events first, then a final 'result' event.
    """
    evaluation_id = initial_state["evaluation_id"]
    sync_q = progress_mod.ensure(evaluation_id)

    loop = asyncio.get_event_loop()
    future = loop.run_in_executor(None, promptgrade_graph.invoke, initial_state)

    # Drain the sync queue while the pipeline is running
    while not future.done():
        drained = False
        while True:
            try:
                event = sync_q.get_nowait()
                yield f"data: {json.dumps(event)}\n\n"
                drained = True
            except Empty:
                break
        if not drained:
            await asyncio.sleep(0.04)

    # Drain any remaining events after the pipeline finishes
    while True:
        try:
            event = sync_q.get_nowait()
            yield f"data: {json.dumps(event)}\n\n"
        except Empty:
            break

    progress_mod.release(evaluation_id)

    final_state = future.result()

    # ── Guardrail rejection — emit early-exit event, skip full evaluation ────
    if final_state.get("guard_status") == "reject":
        rejection = {
            "type":       "guard_rejected",
            "reason":     final_state.get("guard_reason", "not_a_prompt"),
            "message":    final_state.get("guard_message", "This doesn't look like an AI prompt."),
            "suggestion": final_state.get("guard_suggestion", ""),
        }
        yield f"data: {json.dumps(rejection)}\n\n"
        return

    result_dict = _state_to_result(final_state)
    result_dict["createdAt"] = datetime.now(timezone.utc).isoformat()
    validated = EvaluationResult.model_validate(result_dict)

    payload = validated.model_dump()
    payload["type"] = "result"
    yield f"data: {json.dumps(payload)}\n\n"


def _sse_response(generator):
    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


# ── Streaming evaluate (primary endpoint used by the UI) ─────────────────────

@router.post("/evaluate/stream")
async def evaluate_prompt_stream(request_body: EvaluationRequest):
    prompt = request_body.prompt.strip()
    if len(prompt) < 20 or len(prompt) > 8000:
        raise HTTPException(status_code=400, detail="Prompt must be between 20 and 8000 characters.")
    try:
        evaluation_id = str(uuid4())
        initial_state = _build_initial_state(prompt, request_body.domain.value, evaluation_id, reformat=request_body.reformat, domain_hint=request_body.domain_hint)
        progress_mod.ensure(evaluation_id)
        return _sse_response(_run_streaming(initial_state))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


# ── Streaming file upload ─────────────────────────────────────────────────────

@router.post("/evaluate/upload/stream")
async def evaluate_file_stream(
    file: UploadFile = File(...),
    domain: str = Form(...),
    reformat: bool = Form(True),
    domain_hint: str = Form(""),
):
    allowed = {d.value for d in Domain}
    if domain not in allowed:
        raise HTTPException(status_code=400, detail=f"Invalid domain. Allowed: {', '.join(sorted(allowed))}")
    if not file.filename or not file.filename.endswith(".md"):
        raise HTTPException(status_code=400, detail="Only .md files are supported.")

    raw = await file.read()
    try:
        prompt = raw.decode("utf-8").strip()
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be UTF-8 encoded text.")

    if len(prompt) < 20:
        raise HTTPException(status_code=400, detail="File content is too short (minimum 20 characters).")
    if len(prompt) > 8000:
        raise HTTPException(status_code=400, detail="File content is too long (maximum 8000 characters).")

    evaluation_id = str(uuid4())
    initial_state = _build_initial_state(prompt, domain, evaluation_id, reformat=reformat, domain_hint=domain_hint)
    progress_mod.ensure(evaluation_id)
    return _sse_response(_run_streaming(initial_state))


# ── Non-streaming fallback (kept for backwards compatibility) ─────────────────

async def _run_pipeline(prompt: str, domain: str) -> EvaluationResult:
    evaluation_id = str(uuid4())
    initial_state = _build_initial_state(prompt, domain, evaluation_id)
    final_state = await asyncio.to_thread(promptgrade_graph.invoke, initial_state)
    result = _state_to_result(final_state)
    result["createdAt"] = datetime.now(timezone.utc).isoformat()
    validated = EvaluationResult.model_validate(result)
    return validated


@router.post("/evaluate")
async def evaluate_prompt(request_body: EvaluationRequest):
    prompt = request_body.prompt.strip()
    if len(prompt) < 20 or len(prompt) > 8000:
        raise HTTPException(status_code=400, detail="Prompt must be between 20 and 8000 characters.")
    try:
        validated = await _run_pipeline(prompt, request_body.domain.value)
        return JSONResponse(content=validated.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ValidationError as exc:
        raise HTTPException(status_code=500, detail=exc.errors()) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Graph execution failed: {exc}") from exc


@router.post("/evaluate/upload")
async def evaluate_file(
    file: UploadFile = File(...),
    domain: str = Form(...),
):
    allowed = {d.value for d in Domain}
    if domain not in allowed:
        raise HTTPException(status_code=400, detail=f"Invalid domain. Allowed: {', '.join(sorted(allowed))}")
    if not file.filename or not file.filename.endswith(".md"):
        raise HTTPException(status_code=400, detail="Only .md files are supported.")

    raw = await file.read()
    try:
        prompt = raw.decode("utf-8").strip()
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be UTF-8 encoded text.")

    if len(prompt) < 20:
        raise HTTPException(status_code=400, detail="File content is too short (minimum 20 characters).")
    if len(prompt) > 8000:
        raise HTTPException(status_code=400, detail="File content is too long (maximum 8000 characters).")

    try:
        validated = await _run_pipeline(prompt, domain)
        return JSONResponse(content=validated.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ValidationError as exc:
        raise HTTPException(status_code=500, detail=exc.errors()) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Graph execution failed: {exc}") from exc


# ── Legacy SSE status endpoint ────────────────────────────────────────────────

@router.get("/evaluate/{evaluation_id}/status")
async def evaluation_status(evaluation_id: str, request: Request):
    queue = progress_queues.setdefault(evaluation_id, asyncio.Queue())

    async def event_generator():
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=15)
                    yield f"data: {json.dumps(event)}\n\n"
                    if event.get("status") == "done":
                        break
                except asyncio.TimeoutError:
                    yield 'data: {"status": "heartbeat"}\n\n'
        finally:
            progress_queues.pop(evaluation_id, None)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
