/**
 * Maritime Math & Constraint Solver Service
 * Implements physical constraints for bulk carriers in shallow fairways.
 */

const FLEET = [
    { name: "Capesize", capacity: 150000, laden_draft: 18.0, daily_cost: 25000, block_coefficient: 0.85, speed_knots: 12.0 },
    { name: "Panamax", capacity: 75000, laden_draft: 14.0, daily_cost: 15000, block_coefficient: 0.85, speed_knots: 12.0 },
    { name: "Supramax", capacity: 50000, laden_draft: 11.5, daily_cost: 12000, block_coefficient: 0.85, speed_knots: 12.0 },
    { name: "Handysize", capacity: 35000, laden_draft: 10.0, daily_cost: 9500, block_coefficient: 0.82, speed_knots: 12.0 }
];

/**
 * Calculates Brackish Water Sinkage (Fresh Water Allowance)
 */
function calculateBrackishSinkage(draftLaden, portDensity) {
    // 1.025 is standard seawater density
    return draftLaden * ((1.025 - portDensity) / portDensity);
}

/**
 * Calculates Hydrodynamic Squat Effect for shallow fairways
 */
function calculateHydrodynamicSquat(blockCoeff, speedKnots) {
    return (2 * blockCoeff * Math.pow(speedKnots, 2)) / 100;
}

/**
 * Calculates Dynamic Under Keel Clearance (UKC)
 */
function calculateDynamicUKC(chartedDepth, tidalHeight, draftLaden, deltaDraft, squat) {
    return (chartedDepth + tidalHeight) - (draftLaden + deltaDraft + squat);
}

/**
 * Evaluates the fleet against destination port constraints
 */
function evaluateRequisition(volume_mt, dest_port_draft, commodity) {
    const UKC_MARGIN = 1.0;  // 1.0 meter safety margin
    const PORT_DENSITY = 1.010; // e.g., Haldia brackish water
    const TIDAL_HEIGHT = 1.5; // Dynamic tide at arrival (mocked)

    let validVessels = [];

    for (const vessel of FLEET) {
        const deltaDraft = calculateBrackishSinkage(vessel.laden_draft, PORT_DENSITY);
        const squat = calculateHydrodynamicSquat(vessel.block_coefficient, vessel.speed_knots);
        const ukcDynamic = calculateDynamicUKC(dest_port_draft, TIDAL_HEIGHT, vessel.laden_draft, deltaDraft, squat);

        if (ukcDynamic >= UKC_MARGIN) {
            validVessels.push({
                ...vessel,
                calculated_arrival_draft: vessel.laden_draft + deltaDraft + squat,
                clearance: ukcDynamic
            });
        }
    }

    if (validVessels.length === 0) {
        return {
            feasible: false,
            strategy: "Offshore Transshipment Required (e.g., Lighterage at Sandheads)",
            details: "No standard vessel class clears dynamic UKC limits for this port.",
            calculatedDraft: null
        };
    }

    // Sort by cost efficiency per metric ton
    validVessels.sort((a, b) => (a.daily_cost / a.capacity) - (b.daily_cost / b.capacity));
    
    const bestVessel = validVessels[0];
    const vesselCount = Math.ceil(volume_mt / bestVessel.capacity);

    let strategy = `Direct Fixture: 1x ${bestVessel.name}`;
    if (vesselCount > 1) {
        strategy = `Split Cargo into ${vesselCount}x ${bestVessel.name}s`;
    }

    return {
        feasible: true,
        strategy: strategy,
        vessel_class: bestVessel.name,
        total_vessels: vesselCount,
        calculatedDraft: bestVessel.calculated_arrival_draft.toFixed(2),
        clearance_margin: bestVessel.clearance.toFixed(2),
        portMaxDraft: dest_port_draft
    };
}

module.exports = {
    calculateBrackishSinkage,
    calculateHydrodynamicSquat,
    calculateDynamicUKC,
    evaluateRequisition,
    FLEET
};
