# Optimization Engine

## Decision Variables
- Vessel type
- Port selection

## Constraints
At minimum:
- Vessel draft (`laden_draft`) ≤ port allowable draft (`permissibleDraft`)
- LOA ≤ port limit (`max_loa`)
- Beam ≤ port limit (`max_beam`)
- Cargo capacity ≥ cargo quantity
- Vessel class is compatible with port's `maxVesselClass`
- Handling rate (`handling_rate`) ≥ required rate for the voyage
- Estimated berth/turnaround time (`turnaround_time`) ≤ max turnaround time for the voyage
- Voyage duration (based on `speed_knots` and `distance`) ≤ max voyage duration

## Feasibility Rules
- **PASS**: All requirements are strictly met.
- **FAIL**: At least one requirement fails (e.g., vessel draft > port max draft).
- **UNKNOWN**: Required data (vessel dimensions, port limits, voyage data) is missing. Unknown is never treated as PASS.

## Objective
Recommend the most feasible vessel, ranked by least unused capacity (best fit) to optimize economics.
