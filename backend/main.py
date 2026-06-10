from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from db.schema import init_db
from db.seed import seed_db
from routes.analytics import router as analytics_router
from routes.evaluate import router as evaluate_router
from routes.evaluations import router as evaluations_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_db()
    yield


app = FastAPI(title="PromptGrade AI", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": str(exc)})


app.include_router(evaluate_router, prefix="/api")
app.include_router(evaluations_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}
