# Globe Performance Baseline (Wave 1)

Method: fixed machine, Chrome fresh profile, 1440x900, devicePixelRatio 1,
corridor overview preset, demo vessels (10), hazards live-or-unavailable.
Record: time-to-first-vessel-render, FPS during 5s scripted orbit + 5s rest,
JS heap after settle, datasource count after 10 min soak (must stay 1 per
layer: vessels entities, 1 hazards datasource, 1 corridor datasource).

## Budgets (hard limits, enforced in code)

| Budget | Value | Enforced in |
|---|---|---|
| Rendered vessels | 500 max | backend cap + `VesselLayer shown` slice |
| 3D models | close zoom only (< 300 km camera height), billboards above | `VesselLayer MODEL_HEIGHT_M` |
| Labels | selected vessel + detection toggle only; quakes mag >= 5.2; ports always (4) | layer components |
| HUD refresh | max 4 Hz, skipped when camera static | `Hud` compare-before-set |
| Polls | vessels 30 s, hazards 60 s, corridor 300 s; paused in background tabs | hooks `refetchIntervalInBackground: false` |
| Per-frame allocation | zero (mutated Cartesian3 per entity, singleton Cesium module) | `VesselLayer` tick |
| Sprites | rasterized once per key per page | `cachedSprite` in `api.ts` |

## Measurements

| Scene | Orbit FPS | Rest FPS | Heap | Notes |
|---|---|---|---|---|
| Corridor overview, demo | TBD | TBD | TBD | re-measure after Wave 0 |
| Port preset (Haldia), models on | TBD | TBD | TBD | models < 300 km |
| Detection on, 500 vessels | TBD | TBD | TBD | worst case; compare vs source-repo 34 FPS @100% |

## Regression rules

- Any change dropping orbit FPS > 10% vs baseline is rejected.
- Datasource count must not grow across a 10 min soak (Wave 0 leak class).
- Landing bundle must not include `cesium` (lazy chunk only); `ship.glb`
  loads on demand from `/models/ship.glb`, never in the landing bundle.
- Rerun `npm run qa:globe` and the backend contract tests before merge.
