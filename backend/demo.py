"""Fixed presentation fixtures, not security assessments or engine outputs."""

DEMO_SNAPSHOT = {
    "mode": "demo",
    "snapshot_at": "2026-09-01T09:00:00Z",
    "notice": "Illustrative fixtures only. No telemetry, risk engine, optimizer, compliance assessment, or AI provider is connected.",
    "processes": [
        {"id": "payments", "name": "Digital payments", "owner": "Payments operations", "assets": 18, "eal_inr": 4200000, "var95_inr": 12500000},
        {"id": "customer", "name": "Customer platform", "owner": "Customer experience", "assets": 24, "eal_inr": 2800000, "var95_inr": 8900000},
        {"id": "treasury", "name": "Treasury operations", "owner": "Finance", "assets": 12, "eal_inr": 1900000, "var95_inr": 6200000},
        {"id": "workforce", "name": "Workforce services", "owner": "People operations", "assets": 16, "eal_inr": 1100000, "var95_inr": 3800000},
    ],
    "trend": [
        {"date": "2026-04-01", "eal_inr": 13200000},
        {"date": "2026-05-01", "eal_inr": 12400000},
        {"date": "2026-06-01", "eal_inr": 12900000},
        {"date": "2026-07-01", "eal_inr": 11600000},
        {"date": "2026-08-01", "eal_inr": 10800000},
        {"date": "2026-09-01", "eal_inr": 10000000},
    ],
    "investments": [
        {"id": "observability", "name": "Observability expansion", "category": "Platform", "cost_inr": 600000},
        {"id": "recovery", "name": "Recovery tooling", "category": "Operations", "cost_inr": 900000},
        {"id": "inventory", "name": "Asset inventory", "category": "Platform", "cost_inr": 400000},
        {"id": "training", "name": "Team enablement", "category": "People", "cost_inr": 250000},
    ],
    "capabilities": [
        {"name": "Telemetry ingestion", "status": "Not connected"},
        {"name": "Security Gap engine", "status": "Not connected"},
        {"name": "Monte Carlo simulation", "status": "Not connected"},
        {"name": "Investment optimizer", "status": "Not connected"},
        {"name": "Compliance mappings", "status": "Not connected"},
        {"name": "AI question routing", "status": "Not connected"},
    ],
}
