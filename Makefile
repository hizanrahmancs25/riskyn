.PHONY: install dev-api dev-web test build run

install:
	python -m pip install -r backend/requirements-dev.txt
	cd frontend && npm install

dev-api:
	python -m uvicorn backend.main:app --reload --port 8000

dev-web:
	cd frontend && npm run dev

test:
	python -m pytest backend/tests -q
	cd frontend && npm test && npm run build

build:
	docker build -t riskyn .

run:
	docker run --rm -p 127.0.0.1:8000:8000 riskyn
