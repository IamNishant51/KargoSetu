# MODULE 7: API SPECIFICATION & INTEGRATION CONTRACTS

## 7.1 `POST /api/v1/requisitions/evaluate`
**Description:** Validates physical constraints and determines vessel splits.
**Request Payload:**
```json
{
  "volume_mt": 150000,
  "dest_port": "INHAL",
  "origin_port": "AUGLA",
  "commodity": "Coking Coal"
}
```
**Response Payload:**
```json
{
  "feasible": true,
  "strategy": "Split Cargo into 3x Supramax",
  "total_vessels": 3,
  "vessel_class": "Supramax",
  "calculatedDraft": 11.5,
  "portMaxDraft": 12.0,
  "clearance_margin": 0.5,
  "demurrage_risk": "Low"
}
```

## 7.2 `GET /api/v1/forecast/rates`
**Description:** Fetches historical rates and P10/P50/P90 future predictions.
**Request Query Params:** `?horizon=90&route=AU-IN`
**Response Payload:**
```json
{
  "horizon_days": 90,
  "forecasts": [
    {
      "date": "2026-09-15",
      "p10": 18.50,
      "p50": 21.00,
      "p90": 25.20
    }
  ],
  "optimal_booking_window": {
    "start": "2026-09-10",
    "end": "2026-09-18",
    "confidence": 0.88
  }
}
```

## 7.3 `POST /api/v1/charter/optimize`
**Description:** Orchestrates the Constraint Solver + ML Engine for end-to-end booking recommendations.
*(Inherits payload from `/evaluate` and appends `target_price_usd` and `laycan_window`).*

## 7.4 `GET /api/v1/ports/{port_code}/dynamic-draft`
**Description:** Returns dynamic arrival draft tolerances based on harmonic tidal data.
**Request Query Params:** `?eta_timestamp=1725100000`
**Response Payload:**
```json
{
  "port": "INHAL",
  "timestamp": "2026-09-02T10:00:00Z",
  "base_draft_m": 7.5,
  "tide_height_m": 1.2,
  "ukc_m": 0.8,
  "dynamic_max_draft_m": 7.9,
  "safe_berthing": true
}
```
