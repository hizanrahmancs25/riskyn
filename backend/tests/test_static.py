import re

import pytest
from fastapi.testclient import TestClient

from backend.main import app, static_directory

pytestmark = pytest.mark.skipif(
    not static_directory.is_dir(), reason="Build frontend and copy dist to backend/static first"
)
client = TestClient(app)


def test_serves_built_frontend_and_referenced_assets():
    response = client.get("/")
    assert response.status_code == 200
    assert 'id="root"' in response.text
    assets = re.findall(r'(?:src|href)="(/assets/[^"]+)"', response.text)
    assert assets
    for path in assets:
        asset = client.get(path)
        assert asset.status_code == 200
        assert asset.content


def test_api_and_docs_are_not_shadowed_by_static_mount():
    assert client.get("/api/health").json()["mode"] == "demo"
    assert client.get("/docs").status_code == 200
    assert client.get("/openapi.json").status_code == 200
    response = client.get("/api/missing")
    assert response.status_code == 404
    assert response.headers["content-type"].startswith("application/json")
