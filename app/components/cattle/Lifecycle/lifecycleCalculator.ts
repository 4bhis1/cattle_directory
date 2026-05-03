/**
 * Cattle Lifecycle Calculator
 * Handles the biological differences between cows and buffaloes
 * Buffaloes: 310 days gestation vs Cows: 283 days
 */

export interface TimelineEvent {
  event: string;
  date: Date;
  endDate?: Date;
  desc: string;
  type: "heat" | "calving" | "milk" | "dry" | "puberty" | "breeding";
  daysFromNow?: number;
  isPast?: boolean;
}

export interface LifecycleResult {
  summary: string;
  gestationLength: number;
  timeline: TimelineEvent[];
  currentStage: string;
  nextMilestone: TimelineEvent | null;
}

export interface CattleData {
  cattleType: "cow" | "buffalo";
  breed: string;
  dateOfBirth: string | Date;
  lastCalvingDate?: string | Date | null;
  numberOfBirths?: number;
  status?: string;
}

// Biological Constants (in days)
const BIOLOGICAL_CONSTANTS = {
  cow: {
    GESTATION_DAYS: 283, // ~9 months
    MATURITY_MONTHS: 15, // First heat around 15 months
    ESTROUS_CYCLE: 21,
  },
  buffalo: {
    GESTATION_DAYS: 310, // ~10 months (almost a month longer!)
    MATURITY_MONTHS: 24, // Buffaloes mature later (24-30 months)
    ESTROUS_CYCLE: 21,
  },
};

const COMMON_CONSTANTS = {
  VOLUNTARY_WAITING_PERIOD: 60, // Days after calving before breeding
  PEAK_MILK_START: 30, // Peak milk starts 30 days after calving
  PEAK_MILK_END: 90, // Peak milk ends around 90 days
  DRY_PERIOD_DAYS: 60, // Rest period before next calving
  HEAT_DETECTION_WINDOW: 7, // Days to watch for heat signs
};

/**
 * Calculate lifecycle milestones for cattle
 */
export function calculateCattleLifecycle(data: CattleData): LifecycleResult {
  const {
    cattleType,
    breed,
    dateOfBirth,
    lastCalvingDate,
    numberOfBirths = 0,
  } = data;

  const birthDate = new Date(dateOfBirth);
  const lastCalving = lastCalvingDate ? new Date(lastCalvingDate) : null;
  const now = new Date();

  // Get biological constants for this animal type
  const constants = BIOLOGICAL_CONSTANTS[cattleType];
  const timeline: TimelineEvent[] = [];

  let statusSummary = "";
  let currentStage = "";

  if (!lastCalving || numberOfBirths === 0) {
    // SCENARIO A: HEIFER (Never given birth)
    statusSummary = `Heifer (${cattleType === "cow" ? "Cow" : "Buffalo"} - ${breed})`;
    currentStage = "Heifer - Pre-Breeding";

    // Calculate Maturity/Puberty Date
    const maturityDate = new Date(birthDate);
    maturityDate.setMonth(birthDate.getMonth() + constants.MATURITY_MONTHS);

    const daysToMaturity = Math.ceil(
      (maturityDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    timeline.push({
      event: "Expected First Heat (Puberty)",
      date: maturityDate,
      desc: `Watch for signs: mounting behavior, mucus discharge, restlessness, bellowing. Weight should be ~60% of adult weight.`,
      type: "puberty",
      daysFromNow: daysToMaturity,
      isPast: daysToMaturity < 0,
    });

    // Heat Detection Window
    if (daysToMaturity > 0 && daysToMaturity <= 30) {
      const heatWindowStart = new Date(maturityDate);
      heatWindowStart.setDate(
        maturityDate.getDate() - COMMON_CONSTANTS.HEAT_DETECTION_WINDOW,
      );

      timeline.push({
        event: "Start Heat Watch Period",
        date: heatWindowStart,
        endDate: new Date(maturityDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        desc: "Begin daily observation for heat signs. Check twice daily.",
        type: "heat",
        daysFromNow: Math.ceil(
          (heatWindowStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        ),
        isPast: false,
      });
    }

    // Projected First Calving (if bred at maturity)
    const projectedCalving = new Date(maturityDate);
    projectedCalving.setDate(
      projectedCalving.getDate() + constants.GESTATION_DAYS,
    );

    timeline.push({
      event: "Projected First Calving",
      date: projectedCalving,
      desc: `If successfully bred at puberty. Gestation period: ${constants.GESTATION_DAYS} days. Prepare calving kit and monitor closely.`,
      type: "calving",
      daysFromNow: Math.ceil(
        (projectedCalving.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ),
      isPast: false,
    });
  } else {
    // SCENARIO B: LACTATING/MILKING ANIMAL (Has given birth)
    statusSummary = `Lactating ${cattleType === "cow" ? "Cow" : "Buffalo"} (${breed}) - Birth #${numberOfBirths}`;

    const daysSinceCalving = Math.ceil(
      (now.getTime() - lastCalving.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Determine current stage
    if (daysSinceCalving < COMMON_CONSTANTS.VOLUNTARY_WAITING_PERIOD) {
      currentStage = "Early Lactation - Recovery Period";
    } else if (daysSinceCalving < 120) {
      currentStage = "Peak Lactation - Breeding Window";
    } else if (daysSinceCalving < 240) {
      currentStage = "Mid Lactation";
    } else {
      currentStage = "Late Lactation - Prepare for Dry Period";
    }

    // A. Peak Milk Production Window
    const peakMilkStart = new Date(lastCalving);
    peakMilkStart.setDate(
      lastCalving.getDate() + COMMON_CONSTANTS.PEAK_MILK_START,
    );

    const peakMilkEnd = new Date(lastCalving);
    peakMilkEnd.setDate(lastCalving.getDate() + COMMON_CONSTANTS.PEAK_MILK_END);

    timeline.push({
      event: "Peak Milk Production Window",
      date: peakMilkStart,
      endDate: peakMilkEnd,
      desc: "Highest production period. Maximize feed quality (TMR/concentrate). Monitor body condition score.",
      type: "milk",
      daysFromNow: Math.ceil(
        (peakMilkStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ),
      isPast: now > peakMilkEnd,
    });

    // B. Target Breeding Date (after Voluntary Waiting Period)
    const breedingReadyDate = new Date(lastCalving);
    breedingReadyDate.setDate(
      lastCalving.getDate() + COMMON_CONSTANTS.VOLUNTARY_WAITING_PERIOD,
    );

    const daysToBreeding = Math.ceil(
      (breedingReadyDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    timeline.push({
      event: "Target Breeding Date (AI Window Opens)",
      date: breedingReadyDate,
      desc: `Ideal time for Artificial Insemination to maintain 12-13 month calving interval. Watch for heat signs from this date onwards.`,
      type: "breeding",
      daysFromNow: daysToBreeding,
      isPast: daysToBreeding < 0,
    });

    // Heat Detection Window (if approaching breeding date)
    if (daysToBreeding > -30 && daysToBreeding <= 30) {
      const heatWatchStart = new Date(breedingReadyDate);
      heatWatchStart.setDate(breedingReadyDate.getDate() - 7);

      timeline.push({
        event: "Heat Detection Window",
        date: heatWatchStart,
        endDate: new Date(
          breedingReadyDate.getTime() + 30 * 24 * 60 * 60 * 1000,
        ),
        desc: `Active heat monitoring period. Check for standing heat, mucus discharge. Heat repeats every ${constants.ESTROUS_CYCLE} days if not bred.`,
        type: "heat",
        daysFromNow: Math.ceil(
          (heatWatchStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        ),
        isPast: false,
      });
    }

    // C. Projected Next Calving (if bred at target date)
    const nextCalving = new Date(breedingReadyDate);
    nextCalving.setDate(nextCalving.getDate() + constants.GESTATION_DAYS);

    // D. Dry Off Date (must stop milking before calving)
    const dryOffDate = new Date(nextCalving);
    dryOffDate.setDate(
      nextCalving.getDate() - COMMON_CONSTANTS.DRY_PERIOD_DAYS,
    );

    const daysToDryOff = Math.ceil(
      (dryOffDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    timeline.push({
      event: "Dry Off Date",
      date: dryOffDate,
      desc: `STOP MILKING. Mammary gland needs ${COMMON_CONSTANTS.DRY_PERIOD_DAYS} days regeneration. Use dry cow therapy. Reduce concentrate feed.`,
      type: "dry",
      daysFromNow: daysToDryOff,
      isPast: daysToDryOff < 0,
    });

    timeline.push({
      event: "Next Projected Calving",
      date: nextCalving,
      desc: `Prepare calving area. Monitor closely 2 weeks before. Have calving kit ready. Birth #${numberOfBirths + 1}.`,
      type: "calving",
      daysFromNow: Math.ceil(
        (nextCalving.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ),
      isPast: false,
    });

    // Post-calving preparation
    const postCalvingCare = new Date(nextCalving);
    postCalvingCare.setDate(nextCalving.getDate() + 1);

    timeline.push({
      event: "Post-Calving Care Period",
      date: postCalvingCare,
      endDate: new Date(nextCalving.getTime() + 7 * 24 * 60 * 60 * 1000),
      desc: "Monitor for retained placenta, milk fever, mastitis. Ensure colostrum feeding to calf within 6 hours.",
      type: "calving",
      daysFromNow: Math.ceil(
        (postCalvingCare.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ),
      isPast: false,
    });
  }

  // Sort timeline by date
  timeline.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Find next milestone (first future event)
  const nextMilestone =
    timeline.find((event) => !event.isPast && (event.daysFromNow ?? 0) >= 0) ||
    null;

  return {
    summary: statusSummary,
    gestationLength: constants.GESTATION_DAYS,
    timeline,
    currentStage,
    nextMilestone,
  };
}

/**
 * Get human-readable time until event
 */
export function getTimeUntilEvent(days: number): string {
  if (days < 0) {
    return `${Math.abs(days)} days ago`;
  }
  if (days === 0) {
    return "Today";
  }
  if (days === 1) {
    return "Tomorrow";
  }
  if (days < 7) {
    return `In ${days} days`;
  }
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `In ${weeks} week${weeks > 1 ? "s" : ""}`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `In ${months} month${months > 1 ? "s" : ""}`;
  }
  const years = Math.floor(days / 365);
  return `In ${years} year${years > 1 ? "s" : ""}`;
}
