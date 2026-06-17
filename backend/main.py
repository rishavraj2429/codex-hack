"""
GAIA Backend — FastAPI Application
Governance Assistant for Intelligent Climate Action
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import auth, heatmap, kpis, simulate, chat

app = FastAPI(
    title="GAIA API",
    description="Governance Assistant for Intelligent Climate Action — Backend API",
    version="1.0.0",
)

# CORS for frontend dev server
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "https://codex-hack-ugrh.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth.router)
app.include_router(heatmap.router)
app.include_router(kpis.router)
app.include_router(simulate.router)
app.include_router(chat.router)


@app.get("/")
async def root():
    return {
        "name": "GAIA API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
