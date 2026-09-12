"""Shared metocean helpers for the FastAPI proxies.

Single home for the current-hour index used against Open-Meteo hourly
arrays, so every router picks the live hour instead of midnight.
"""

from __future__ import annotations

import datetime as dt


def utcnow_iso() -> str:
    return dt.datetime.now(dt.UTC).isoformat().replace("+00:00", "Z")


def current_hour_index(times: list) -> int:
    """Index of the current UTC hour in an Open-Meteo hourly time array.

    Falls back to the nearest past hour, then to index 0 (never the
    midnight element by accident).
    """
    if not times:
        return 0
    now_hour = dt.datetime.now(dt.UTC).replace(minute=0, second=0, microsecond=0)
    best = 0
    for i, t in enumerate(times):
        try:
            parsed = dt.datetime.fromisoformat(str(t))
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=dt.UTC)
            if parsed <= now_hour:
                best = i
            else:
                break
        except (TypeError, ValueError):
            continue
    return best
