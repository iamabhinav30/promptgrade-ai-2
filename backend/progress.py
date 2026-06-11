from queue import Empty, Queue  # noqa: F401 – Empty re-exported for callers
from threading import Lock

_queues: dict[str, Queue] = {}
_lock = Lock()


def ensure(evaluation_id: str) -> Queue:
    with _lock:
        if evaluation_id not in _queues:
            _queues[evaluation_id] = Queue()
        return _queues[evaluation_id]


def emit(evaluation_id: str, agent: str, status: str, **extra) -> None:
    if not evaluation_id:
        return
    payload: dict = {"agent": agent, "status": status}
    payload.update(extra)
    ensure(evaluation_id).put_nowait(payload)


def release(evaluation_id: str) -> None:
    with _lock:
        _queues.pop(evaluation_id, None)
