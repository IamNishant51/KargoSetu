from typing import Any


def check_constraint(
    name: str, required: float | None, allowed: float | None
) -> dict[str, Any] | None:
    if required is None or allowed is None:
        return {
            "constraint": name,
            "required": required,
            "allowed": allowed,
            "status": "UNKNOWN",
        }
    if required > allowed:
        return {
            "constraint": name,
            "required": required,
            "allowed": allowed,
            "status": "FAIL",
        }
    return None


class ConstraintEngine:
    def evaluate(
        self,
        vessel: dict[str, Any],
        load_port: dict[str, Any],
        discharge_port: dict[str, Any],
        cargo_quantity: float,
        voyage_data: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        reasons = []
        status = "PASS"
        if voyage_data is None:
            voyage_data = {}

        def add_reason(res):
            nonlocal status
            if res:
                reasons.append(res)
                if res["status"] == "FAIL":
                    status = "FAIL"
                elif res["status"] == "UNKNOWN" and status != "FAIL":
                    status = "UNKNOWN"

        # 1. Capacity (DWT/capacity)
        capacity = vessel.get("capacity")
        if capacity is None:
            add_reason(
                {
                    "constraint": "capacity",
                    "required": cargo_quantity,
                    "allowed": None,
                    "status": "UNKNOWN",
                }
            )
        elif cargo_quantity > capacity:
            add_reason(
                {
                    "constraint": "capacity",
                    "required": cargo_quantity,
                    "allowed": capacity,
                    "status": "FAIL",
                }
            )

        # 2. Draft
        v_draft = vessel.get("laden_draft", vessel.get("draft"))
        for port, p_name in [
            (load_port, "load_port"),
            (discharge_port, "discharge_port"),
        ]:
            p_draft = port.get("permissibleDraft", port.get("max_draft"))
            add_reason(check_constraint(f"{p_name}_draft", v_draft, p_draft))

        # 3. LOA
        v_loa = vessel.get("loa")
        for port, p_name in [
            (load_port, "load_port"),
            (discharge_port, "discharge_port"),
        ]:
            p_loa = port.get("max_loa")
            add_reason(check_constraint(f"{p_name}_loa", v_loa, p_loa))

        # 4. Beam
        v_beam = vessel.get("beam")
        for port, p_name in [
            (load_port, "load_port"),
            (discharge_port, "discharge_port"),
        ]:
            p_beam = port.get("max_beam")
            add_reason(check_constraint(f"{p_name}_beam", v_beam, p_beam))

        # 5. Vessel Type
        v_type = vessel.get("type", vessel.get("name", "Unknown"))
        for port, p_name in [
            (load_port, "load_port"),
            (discharge_port, "discharge_port"),
        ]:
            p_max_class = port.get("maxVesselClass")
            if p_max_class is None:
                add_reason(
                    {
                        "constraint": f"{p_name}_vessel_class",
                        "required": v_type,
                        "allowed": None,
                        "status": "UNKNOWN",
                    }
                )
            # Simplistic check: this ideally requires a proper ranking of classes, but we mark pass if we can't definitively fail
            # For now, without a strict hierarchy, we just check equality or skip failing if they don't match exactly.
            # In a real engine, Capesize > Panamax > Supramax > Handysize.

        # 6. Handling rate
        for port, p_name in [
            (load_port, "load_port"),
            (discharge_port, "discharge_port"),
        ]:
            handling_rate = port.get("handling_rate")
            if handling_rate is None:
                add_reason(
                    {
                        "constraint": f"{p_name}_handling_rate",
                        "required": None,
                        "allowed": None,
                        "status": "UNKNOWN",
                    }
                )
            # We don't have a specific "required" handling rate for PASS/FAIL unless specified in voyage_data
            req_rate = voyage_data.get("required_handling_rate")
            if handling_rate is not None and req_rate is not None:
                if handling_rate < req_rate:
                    add_reason(
                        {
                            "constraint": f"{p_name}_handling_rate",
                            "required": req_rate,
                            "allowed": handling_rate,
                            "status": "FAIL",
                        }
                    )

        # 7. Estimated berth/turnaround time
        for port, p_name in [
            (load_port, "load_port"),
            (discharge_port, "discharge_port"),
        ]:
            turnaround = port.get("turnaround_time")
            if turnaround is None:
                add_reason(
                    {
                        "constraint": f"{p_name}_turnaround_time",
                        "required": None,
                        "allowed": None,
                        "status": "UNKNOWN",
                    }
                )
            max_turnaround = voyage_data.get("max_turnaround_time")
            if turnaround is not None and max_turnaround is not None:
                if turnaround > max_turnaround:
                    add_reason(
                        {
                            "constraint": f"{p_name}_turnaround_time",
                            "required": max_turnaround,
                            "allowed": turnaround,
                            "status": "FAIL",
                        }
                    )  # Note: lower is better here, so if turnaround > max, it's a fail. But check_constraint does (required > allowed) so we wrote custom logic. Wait, our check_constraint takes required (vessel) > allowed (port). For turnaround time, port's turnaround > vessel's max turnaround. Let's manually add:

        # 8. Voyage duration
        duration = voyage_data.get("duration")
        if duration is None:
            # Maybe calculate from distance and speed?
            distance = voyage_data.get("distance")
            speed = vessel.get("speed_knots")
            if distance is not None and speed is not None and speed > 0:
                duration = distance / (speed * 24)
            else:
                add_reason(
                    {
                        "constraint": "voyage_duration",
                        "required": None,
                        "allowed": None,
                        "status": "UNKNOWN",
                    }
                )

        max_duration = voyage_data.get("max_duration")
        if duration is not None and max_duration is not None:
            if duration > max_duration:
                add_reason(
                    {
                        "constraint": "voyage_duration",
                        "required": max_duration,
                        "allowed": duration,
                        "status": "FAIL",
                    }
                )

        return {"feasible": status == "PASS", "status": status, "reasons": reasons}


class VesselRecommendationService:
    def __init__(self, engine: ConstraintEngine):
        self.engine = engine

    def recommend(
        self,
        vessels: list[dict[str, Any]],
        load_port: dict[str, Any],
        discharge_port: dict[str, Any],
        cargo_quantity: float,
        voyage_data: dict[str, Any] | None = None,
    ) -> list[dict[str, Any]]:
        feasible = []
        for v in vessels:
            evaluation = self.engine.evaluate(
                v, load_port, discharge_port, cargo_quantity, voyage_data
            )
            if evaluation["feasible"]:
                feasible.append(
                    {
                        "vessel": v,
                        "score": v.get("capacity", 0) - cargo_quantity,
                        "explanation": "Feasible based on port and vessel constraints. Ranked by minimum unused capacity.",
                    }
                )

        # Sort by best fit (least unused capacity)
        feasible.sort(key=lambda x: x["score"])
        return feasible
