export interface OperatingHourRecord {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface OperatingStatusResult {
  isOpenNow: boolean;
  todayHoursText: string;
  statusBadgeText: string;
  statusColor: "green" | "amber" | "neutral";
  nextOpeningText?: string;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

/**
 * Format 24-hour time "HH:MM" into "11:00 AM" or "10:00 PM".
 */
export function formatTime12h(timeStr: string): string {
  if (!timeStr || !timeStr.includes(":")) return timeStr;
  const [hStr, mStr] = timeStr.split(":");
  const hours = parseInt(hStr, 10);
  const minutes = parseInt(mStr, 10);
  if (isNaN(hours) || isNaN(minutes)) return timeStr;

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Calculates live operating status from operating hours records.
 * Uses optional targetDate parameter for deterministic testing.
 */
export function calculateOperatingStatus(
  operatingHours: OperatingHourRecord[],
  targetDate: Date = new Date()
): OperatingStatusResult {
  if (!operatingHours || operatingHours.length === 0) {
    return {
      isOpenNow: true,
      todayHoursText: "Hours not configured",
      statusBadgeText: "Open",
      statusColor: "green",
    };
  }

  const currentDay = targetDate.getDay();
  const currentHours = targetDate.getHours();
  const currentMinutes = targetDate.getMinutes();
  const currentTimeNumber = currentHours * 60 + currentMinutes;

  const todayRecord = operatingHours.find((h) => h.dayOfWeek === currentDay);

  if (!todayRecord || todayRecord.isClosed) {
    // Find next day open
    const nextOpen = findNextOpenDay(operatingHours, currentDay);
    return {
      isOpenNow: false,
      todayHoursText: "Closed Today",
      statusBadgeText: "Closed",
      statusColor: "neutral",
      nextOpeningText: nextOpen,
    };
  }

  const [openH, openM] = todayRecord.openTime.split(":").map((v) => parseInt(v, 10));
  const [closeH, closeM] = todayRecord.closeTime.split(":").map((v) => parseInt(v, 10));

  const openTimeNumber = openH * 60 + openM;
  const closeTimeNumber = closeH * 60 + closeM;

  const formattedOpen = formatTime12h(todayRecord.openTime);
  const formattedClose = formatTime12h(todayRecord.closeTime);
  const todayHoursText = `${formattedOpen} – ${formattedClose}`;

  if (currentTimeNumber >= openTimeNumber && currentTimeNumber < closeTimeNumber) {
    // Closing soon? (within 30 minutes)
    const isClosingSoon = closeTimeNumber - currentTimeNumber <= 30;
    return {
      isOpenNow: true,
      todayHoursText,
      statusBadgeText: isClosingSoon ? `Closes soon (${formattedClose})` : `Open Now • Closes ${formattedClose}`,
      statusColor: isClosingSoon ? "amber" : "green",
    };
  }

  if (currentTimeNumber < openTimeNumber) {
    return {
      isOpenNow: false,
      todayHoursText,
      statusBadgeText: `Closed • Opens at ${formattedOpen}`,
      statusColor: "neutral",
      nextOpeningText: `Opens today at ${formattedOpen}`,
    };
  }

  // After closeTime
  const nextOpen = findNextOpenDay(operatingHours, currentDay);
  return {
    isOpenNow: false,
    todayHoursText,
    statusBadgeText: `Closed • ${nextOpen}`,
    statusColor: "neutral",
    nextOpeningText: nextOpen,
  };
}

function findNextOpenDay(records: OperatingHourRecord[], currentDay: number): string {
  for (let offset = 1; offset <= 7; offset++) {
    const checkDay = (currentDay + offset) % 7;
    const rec = records.find((h) => h.dayOfWeek === checkDay);
    if (rec && !rec.isClosed) {
      const dayLabel = offset === 1 ? "tomorrow" : DAY_NAMES[checkDay];
      return `Opens ${dayLabel} at ${formatTime12h(rec.openTime)}`;
    }
  }
  return "Closed";
}

