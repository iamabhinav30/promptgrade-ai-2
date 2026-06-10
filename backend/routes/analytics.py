from fastapi import APIRouter

from db.queries import get_analytics

router = APIRouter()


@router.get("/analytics")
def analytics():
    return get_analytics()
