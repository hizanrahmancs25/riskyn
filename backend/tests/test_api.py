from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_health_identifies_demo_mode():
    assert client.get("/api/health").json() == {"status": "ok", "mode": "demo"}


def test_dashboard_totals_match_fixture_rows():
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert data["mode"] == "demo"
    assert data["notice"]
    assert data["summary"]["eal_inr"] == sum(row["eal_inr"] for row in data["processes"])
    assert data["summary"]["asset_count"] == sum(row["assets"] for row in data["processes"])
    assert data["summary"]["process_count"] == len(data["processes"])
    assert data["trend"][-1]["eal_inr"] == data["summary"]["eal_inr"]
    assert "var95_inr" not in data["summary"]


def test_process_details_match_dashboard():
    for row in client.get("/api/dashboard").json()["processes"]:
        response = client.get(f"/api/processes/{row['id']}")
        assert response.status_code == 200
        assert response.json() == {"mode": "demo", "process": row}


def test_unknown_process_and_endpoints_return_json_404():
    for path in ("/api/processes/missing", "/api/missing"):
        response = client.get(path)
        assert response.status_code == 404
        assert "detail" in response.json()
    assert client.post("/api/optimize", json={"budget": 1000}).status_code == 404


def test_refresh_does_not_fabricate_new_history():
    assert client.get("/api/dashboard").json() == client.get("/api/dashboard").json()
