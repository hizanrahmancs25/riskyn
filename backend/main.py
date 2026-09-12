from copy import deepcopy
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles

from backend.demo import DEMO_SNAPSHOT

app = FastAPI(
    title="Riskyn application shell",
    description="Presentation-only demo API. Monetary values are fixed illustrative fixtures, not calculated risk estimates.",
    version="0.1.0",
)


@app.get("/api/health")
def health():
    return {"status": "ok", "mode": "demo"}


@app.get("/api/dashboard")
def dashboard():
    snapshot = deepcopy(DEMO_SNAPSHOT)
    processes = snapshot["processes"]
    snapshot["summary"] = {
        "eal_inr": sum(process["eal_inr"] for process in processes),
        "process_count": len(processes),
        "asset_count": sum(process["assets"] for process in processes),
    }
    return snapshot


@app.get("/api/processes/{process_id}")
def process_detail(process_id: str):
    for process in DEMO_SNAPSHOT["processes"]:
        if process["id"] == process_id:
            return {"mode": "demo", "process": deepcopy(process)}
    raise HTTPException(status_code=404, detail="Business process not found")


@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
def unknown_api(path: str):
    raise HTTPException(status_code=404, detail="API endpoint not available in the application shell")


# Docker serves the Vite build from the same origin. During local development,
# Vite proxies /api to this application instead.
static_directory = Path(__file__).resolve().parent / "static"
if static_directory.is_dir():
    app.mount("/", StaticFiles(directory=static_directory, html=True), name="frontend")
