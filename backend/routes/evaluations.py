from fastapi import APIRouter, HTTPException, Query

from db.queries import get_evaluation_by_id, get_evaluations
from models.schemas import Domain

router = APIRouter()


@router.get("/evaluations")
def list_evaluations(
    domain: Domain | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    return get_evaluations(domain.value if domain else None, limit, offset)


@router.get("/evaluations/{evaluation_id}")
def read_evaluation(evaluation_id: str):
    evaluation = get_evaluation_by_id(evaluation_id)
    if evaluation is None:
        raise HTTPException(status_code=404, detail="Evaluation not found.")
    return evaluation
