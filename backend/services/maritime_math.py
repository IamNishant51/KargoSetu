def calculate_brackish_sinkage(draft_laden: float, port_density: float) -> float:
    """
    Calculates the Fresh Water Allowance (FWA) / Brackish Water Sinkage.
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
    Calculates the Dynamic Under Keel Clearance (UKC).
    """
    arrival_draft = draft_laden + delta_draft + squat
    return charted_depth + tidal_height - arrival_draft


def evaluate_vessel_safety(charted_depth: float, tidal_height: float, draft_laden: float, port_density: float, block_coeff: float, speed_knots: float, min_ukc_margin: float = 1.0) -> dict:
    """
    Evaluates end-to-end hydrodynamic safety constraints.
    """
    delta_draft = calculate_brackish_sinkage(draft_laden, port_density)
    squat = calculate_hydrodynamic_squat(block_coeff, speed_knots)
    ukc_dynamic = calculate_dynamic_ukc(charted_depth, tidal_height, draft_laden, delta_draft, squat)
    
    return {
        "is_safe": ukc_dynamic >= min_ukc_margin,
        "delta_draft_m": round(delta_draft, 3),
        "squat_m": round(squat, 3),
        "dynamic_ukc_m": round(ukc_dynamic, 3),
        "required_margin_m": min_ukc_margin
    }