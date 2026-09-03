/**
 * Maritime Math & Constraint Solver Service
 * Implements physical constraints for bulk carriers in shallow fairways.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let cachedFleet = null;
let lastFleetFetch = 0;

async function getFleet() {
    const now = Date.now();
    // Cache for 1 hour to prevent DB spam
    if (!cachedFleet || (now - lastFleetFetch) > 3600000) {
        cachedFleet = await prisma.vessel.findMany();
        lastFleetFetch = now;
    }
    return cachedFleet;
}

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
async function evaluateRequisition(volume_mt, dest_port_draft, commodity, lat = 21.02, lon = 88.06, brackishDensity = 1.025, chartedDepth = 15.0) {
    const fleet = await getFleet();
    const UKC_MARGIN = 1.0;  // 1.0 meter safety margin
    const PORT_DENSITY = brackishDensity; // Using DB density instead of hardcoded
    
    // Fetch real-time wave/tide data from Open-Meteo Marine API
    let TIDAL_HEIGHT = 1.5; // fallback
    try {
        // Using wave_height as a proxy for dynamic tidal action at the port entrance
        const res = await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height`);
        if (res.ok) {
            const data = await res.json();
            if (data.hourly && data.hourly.wave_height && data.hourly.wave_height.length > 0) {
                TIDAL_HEIGHT = data.hourly.wave_height[0] || 1.5;
            }
        }
    } catch (e) {
        console.error("Failed to fetch live tide data, using fallback.", e.message);
    }
    let validVessels = [];

    for (const vessel of fleet) {
        // Calculate Brackish Water Sinkage using dynamic port density
        const deltaDraft = calculateBrackishSinkage(vessel.laden_draft, PORT_DENSITY);

        // Calculate Hydrodynamic Squat
        const squat = calculateHydrodynamicSquat(vessel.block_coeff, vessel.speed_knots);

        // Calculate Dynamic Under Keel Clearance using dynamic charted depth
        const ukcDynamic = calculateDynamicUKC(chartedDepth, TIDAL_HEIGHT, vessel.laden_draft, deltaDraft, squat);
        
        if (ukcDynamic >= UKC_MARGIN) {
            validVessels.push({
                ...vessel,
                calculatedDraft: Number((vessel.laden_draft + deltaDraft).toFixed(2)),
                clearance_margin: Number(ukcDynamic.toFixed(2))
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
        calculatedDraft: bestVessel.calculatedDraft,
        clearance_margin: bestVessel.clearance_margin,
        portMaxDraft: dest_port_draft
    };
}

module.exports = {
    calculateBrackishSinkage,
    calculateHydrodynamicSquat,
    calculateDynamicUKC,
    evaluateRequisition
};
