import asyncio
import json
from typing import Any

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import ValidationError

from graph.index import promptgrade_graph
from models.schemas import AgentProgressEvent, EvaluationRequest, EvaluationResult

router = APIRouter()
progress_queues: dict[str, asyncio.Queue] = {}


async def publish_event(evaluation_id: str, event: AgentProgressEvent) -> None:
    queue = progress_queues.setdefault(evaluation_id, asyncio.Queue())
    await queue.put(event.model_dump())


def _state_to_result(state: dict[str, Any]) -> dict[str, Any]:
    iterations = state.get("iterations", [])
    original_score = float(iterations[0]["score"]) if iterations else 0.0
    return {
        "evaluationId": state["evaluation_id"],
        "originalPrompt": state["original_prompt"],
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


@router.post("/evaluate")
async def evaluate_prompt(request_body: EvaluationRequest):
    prompt = request_body.prompt.strip()
    if len(prompt) < 20 or len(prompt) > 2000:
        raise HTTPException(status_code=400, detail="Prompt must be between 20 and 2000 characters.")

    initial_state = {
        "session_id": "",
        "original_prompt": prompt,
        "domain": request_body.domain.value,
        "current_prompt": prompt,
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
        "evaluation_id": "",
    }

    try:
        final_state = await asyncio.to_thread(promptgrade_graph.invoke, initial_state)
        result = _state_to_result(final_state)
        # report_node writes createdAt to DB; use the DB-returned datetime if available in the latest state is not stored.
        result["createdAt"] = __import__("datetime").datetime.datetime.utcnow().isoformat() + "Z"
        validated = EvaluationResult.model_validate(result)
        await publish_event(validated.evaluationId, AgentProgressEvent(agent="report", status="complete", improvementPct=validated.improvementPct))
        await progress_queues.setdefault(validated.evaluationId, asyncio.Queue()).put({"status": "done"})
        return JSONResponse(content=validated.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ValidationError as exc:
        raise HTTPException(status_code=500, detail=exc.errors()) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Graph execution failed: {exc}") from exc


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
                    yield "data: {\"status\": \"heartbeat\"}\n\n"
        finally:
            progress_queues.pop(evaluation_id, None)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
