from typing import Dict, List, Any
import math

VESSEL_CLASSES = {
    "Capesize": {"capacity_dwt": 150000, "laden_draft_m": 18.0, "daily_cost_usd": 25000, "block_coeff": 0.85},
    "Panamax":  {"capacity_dwt": 75000,  "laden_draft_m": 14.0, "daily_cost_usd": 15000, "block_coeff": 0.82},
    "Supramax": {"capacity_dwt": 50000,  "laden_draft_m": 11.5, "daily_cost_usd": 12000, "block_coeff": 0.80},
    "Handysize":{"capacity_dwt": 30000,  "laden_draft_m": 10.0, "daily_cost_usd": 9000,  "block_coeff": 0.78}
}

def calculate_brackish_sinkage(draft_laden: float, port_density: float) -> float:
    """
    Calculates Fresh Water Allowance (FWA) / Brackish Water Sinkage.
    Higher sinkage occurs in riverine ports like Haldia (density ~1.005-1.015 g/cm3).
    """
    if port_density >= 1.025:
        return 0.0
    return draft_laden * ((1.025 - port_density) / port_density)


def calculate_hydrodynamic_squat(block_coefficient: float, speed_knots: float) -> float:
    """
    Calculates vessel squat in shallow, confined fairways.
    """
    return (2 * block_coefficient * (speed_knots ** 2)) / 100


def calculate_dynamic_ukc(charted_depth: float, tidal_height: float, draft_laden: float, delta_draft: float, squat: float) -> float:
    """
    Calculates Dynamic Under Keel Clearance (UKC).
    """
    arrival_draft = draft_laden + delta_draft + squat
    return charted_depth + tidal_height - arrival_draft


def evaluate_vessel_safety(
    charted_depth: float, 
    tidal_height: float, 
    draft_laden: float, 
    port_density: float, 
    block_coeff: float = 0.85, 
    speed_knots: float = 12.0, 
    min_ukc_margin: float = 1.0
) -> Dict[str, Any]:
    """
    Evaluates end-to-end hydrodynamic safety constraints.
    """
    delta_draft = calculate_brackish_sinkage(draft_laden, port_density)
    squat = calculate_hydrodynamic_squat(block_coeff, speed_knots)
    ukc_dynamic = calculate_dynamic_ukc(charted_depth, tidal_height, draft_laden, delta_draft, squat)
    arrival_draft = draft_laden + delta_draft + squat
    max_permissible_draft = charted_depth + tidal_height - min_ukc_margin
    
    return {
        "is_safe": ukc_dynamic >= min_ukc_margin,
        "arrival_draft_m": round(arrival_draft, 3),
        "delta_draft_m": round(delta_draft, 3),
        "squat_m": round(squat, 3),
        "dynamic_ukc_m": round(ukc_dynamic, 3),
        "max_permissible_draft_m": round(max_permissible_draft, 3),
        "required_margin_m": min_ukc_margin
    }


def calculate_cargo_split(
    total_volume_mt: float,
    dest_port_depth: float,
    tidal_height: float,
    port_density: float,
    speed_knots: float = 12.0
) -> Dict[str, Any]:
    """
    Evaluates fleet candidates and determines cargo splitting strategy when single-vessel fixtures fail.
    """
    feasible_vessels = []
    
    for class_name, specs in VESSEL_CLASSES.items():
        safety = evaluate_vessel_safety(
            charted_depth=dest_port_depth,
            tidal_height=tidal_height,
            draft_laden=specs["laden_draft_m"],
            port_density=port_density,
            block_coeff=specs["block_coeff"],
            speed_knots=speed_knots
        )
        if safety["is_safe"]:
            feasible_vessels.append((class_name, specs, safety))
            
    if not feasible_vessels:
        return {
            "feasible": False,
            "strategy": "Offshore Lighterage Required (Sandheads Transshipment)",
            "reason": "No bulk carrier class satisfies port depth and UKC safety constraints.",
            "recommended_vessels": []
        }
        
    # Pick the largest feasible vessel for maximum economies of scale
    feasible_vessels.sort(key=lambda x: x[1]["capacity_dwt"], reverse=True)
    best_class, best_specs, best_safety = feasible_vessels[0]
    
    vessel_count = math.ceil(total_volume_mt / best_specs["capacity_dwt"])
    estimated_daily_cost = vessel_count * best_specs["daily_cost_usd"]
    
    return {
        "feasible": True,
        "strategy": f"Direct Fixture ({best_class})" if vessel_count == 1 else f"Split Cargo into {vessel_count}x {best_class}",
        "primary_vessel_class": best_class,
        "vessel_count": vessel_count,
        "total_volume_mt": total_volume_mt,
        "calculated_arrival_draft_m": best_safety["arrival_draft_m"],
        "max_permissible_draft_m": best_safety["max_permissible_draft_m"],
        "clearance_margin_m": best_safety["dynamic_ukc_m"],
        "estimated_daily_cost_usd": estimated_daily_cost,
        "demurrage_risk": "Low" if best_safety["dynamic_ukc_m"] >= 1.5 else "Moderate"
    }