from fastapi import APIRouter
from app.api.v1.endpoints import expenses, workflows, seed

api_router = APIRouter()
api_router.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
api_router.include_router(workflows.router, prefix="/workflows", tags=["workflows"])
api_router.include_router(seed.router, prefix="/seed", tags=["seed"])
