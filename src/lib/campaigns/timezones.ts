// Timezone data and utilities for campaign scheduling

export interface TimezoneOption {
  value: string;
  label: string;
  region: string;
  abbreviation?: string;
}

// Comprehensive timezone list organized by region
export const TIMEZONES: TimezoneOption[] = [
  // UTC
  { value: "UTC", label: "UTC", region: "UTC", abbreviation: "UTC" },

  // Americas - North
  {
    value: "America/New_York",
    label: "New York",
    region: "Americas",
    abbreviation: "ET",
  },
  {
    value: "America/Chicago",
    label: "Chicago",
    region: "Americas",
    abbreviation: "CT",
  },
  {
    value: "America/Denver",
    label: "Denver",
    region: "Americas",
    abbreviation: "MT",
  },
  {
    value: "America/Los_Angeles",
    label: "Los Angeles",
    region: "Americas",
    abbreviation: "PT",
  },
  {
    value: "America/Phoenix",
    label: "Phoenix",
    region: "Americas",
    abbreviation: "MST",
  },
  {
    value: "America/Anchorage",
    label: "Anchorage",
    region: "Americas",
    abbreviation: "AKT",
  },
  {
    value: "America/Toronto",
    label: "Toronto",
    region: "Americas",
    abbreviation: "ET",
  },
  {
    value: "America/Vancouver",
    label: "Vancouver",
    region: "Americas",
    abbreviation: "PT",
  },
  {
    value: "America/Mexico_City",
    label: "Mexico City",
    region: "Americas",
    abbreviation: "CST",
  },

  // Americas - Central & South
  {
    value: "America/Sao_Paulo",
    label: "São Paulo",
    region: "Americas",
    abbreviation: "BRT",
  },
  {
    value: "America/Buenos_Aires",
    label: "Buenos Aires",
    region: "Americas",
    abbreviation: "ART",
  },
  {
    value: "America/Lima",
    label: "Lima",
    region: "Americas",
    abbreviation: "PET",
  },
  {
    value: "America/Bogota",
    label: "Bogotá",
    region: "Americas",
    abbreviation: "COT",
  },
  {
    value: "America/Santiago",
    label: "Santiago",
    region: "Americas",
    abbreviation: "CLT",
  },

  // Pacific
  {
    value: "Pacific/Honolulu",
    label: "Honolulu",
    region: "Pacific",
    abbreviation: "HST",
  },

  // Europe
  {
    value: "Europe/London",
    label: "London",
    region: "Europe",
    abbreviation: "GMT",
  },
  {
    value: "Europe/Paris",
    label: "Paris",
    region: "Europe",
    abbreviation: "CET",
  },
  {
    value: "Europe/Berlin",
    label: "Berlin",
    region: "Europe",
    abbreviation: "CET",
  },
  {
    value: "Europe/Rome",
    label: "Rome",
    region: "Europe",
    abbreviation: "CET",
  },
  {
    value: "Europe/Madrid",
    label: "Madrid",
    region: "Europe",
    abbreviation: "CET",
  },
  {
    value: "Europe/Amsterdam",
    label: "Amsterdam",
    region: "Europe",
    abbreviation: "CET",
  },
  {
    value: "Europe/Stockholm",
    label: "Stockholm",
    region: "Europe",
    abbreviation: "CET",
  },
  {
    value: "Europe/Vienna",
    label: "Vienna",
    region: "Europe",
    abbreviation: "CET",
  },
  {
    value: "Europe/Zurich",
    label: "Zurich",
    region: "Europe",
    abbreviation: "CET",
  },
  {
    value: "Europe/Athens",
    label: "Athens",
    region: "Europe",
    abbreviation: "EET",
  },
  {
    value: "Europe/Istanbul",
    label: "Istanbul",
    region: "Europe",
    abbreviation: "TRT",
  },
  {
    value: "Europe/Moscow",
    label: "Moscow",
    region: "Europe",
    abbreviation: "MSK",
  },
  {
    value: "Europe/Dublin",
    label: "Dublin",
    region: "Europe",
    abbreviation: "GMT",
  },
  {
    value: "Europe/Lisbon",
    label: "Lisbon",
    region: "Europe",
    abbreviation: "WET",
  },

  // Asia
  {
    value: "Asia/Kolkata",
    label: "Mumbai / New Delhi",
    region: "Asia",
    abbreviation: "IST",
  },
  { value: "Asia/Dubai", label: "Dubai", region: "Asia", abbreviation: "GST" },
  {
    value: "Asia/Singapore",
    label: "Singapore",
    region: "Asia",
    abbreviation: "SGT",
  },
  {
    value: "Asia/Bangkok",
    label: "Bangkok",
    region: "Asia",
    abbreviation: "ICT",
  },
  {
    value: "Asia/Jakarta",
    label: "Jakarta",
    region: "Asia",
    abbreviation: "WIB",
  },
  {
    value: "Asia/Manila",
    label: "Manila",
    region: "Asia",
    abbreviation: "PHT",
  },
  {
    value: "Asia/Hong_Kong",
    label: "Hong Kong",
    region: "Asia",
    abbreviation: "HKT",
  },
  {
    value: "Asia/Shanghai",
    label: "Shanghai",
    region: "Asia",
    abbreviation: "CST",
  },
  { value: "Asia/Seoul", label: "Seoul", region: "Asia", abbreviation: "KST" },
  { value: "Asia/Tokyo", label: "Tokyo", region: "Asia", abbreviation: "JST" },
  {
    value: "Asia/Taipei",
    label: "Taipei",
    region: "Asia",
    abbreviation: "CST",
  },
  {
    value: "Asia/Kuala_Lumpur",
    label: "Kuala Lumpur",
    region: "Asia",
    abbreviation: "MYT",
  },
  { value: "Asia/Dhaka", label: "Dhaka", region: "Asia", abbreviation: "BST" },
  {
    value: "Asia/Karachi",
    label: "Karachi",
    region: "Asia",
    abbreviation: "PKT",
  },
  {
    value: "Asia/Tehran",
    label: "Tehran",
    region: "Asia",
    abbreviation: "IRST",
  },
  {
    value: "Asia/Riyadh",
    label: "Riyadh",
    region: "Asia",
    abbreviation: "AST",
  },
  {
    value: "Asia/Jerusalem",
    label: "Jerusalem",
    region: "Asia",
    abbreviation: "IST",
  },

  // Oceania
  {
    value: "Australia/Sydney",
    label: "Sydney",
    region: "Oceania",
    abbreviation: "AEST",
  },
  {
    value: "Australia/Melbourne",
    label: "Melbourne",
    region: "Oceania",
    abbreviation: "AEST",
  },
  {
    value: "Australia/Brisbane",
    label: "Brisbane",
    region: "Oceania",
    abbreviation: "AEST",
  },
  {
    value: "Australia/Perth",
    label: "Perth",
    region: "Oceania",
    abbreviation: "AWST",
  },
  {
    value: "Pacific/Auckland",
    label: "Auckland",
    region: "Oceania",
    abbreviation: "NZST",
  },

  // Africa
  {
    value: "Africa/Cairo",
    label: "Cairo",
    region: "Africa",
    abbreviation: "EET",
  },
  {
    value: "Africa/Johannesburg",
    label: "Johannesburg",
    region: "Africa",
    abbreviation: "SAST",
  },
  {
    value: "Africa/Lagos",
    label: "Lagos",
    region: "Africa",
    abbreviation: "WAT",
  },
  {
    value: "Africa/Nairobi",
    label: "Nairobi",
    region: "Africa",
    abbreviation: "EAT",
  },
];

/**
 * Get user's current timezone
 * Only runs on client side, returns safe SSR fallback otherwise
 */
export function getUserTimezone(): string {
  if (typeof window === "undefined") {
    return "America/New_York";
  }

  try {
    if (!("Intl" in window) || !Intl.DateTimeFormat) {
      return "America/New_York";
    }

    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();
    const userOffset = -now.getTimezoneOffset() / 60;

    // Handle UTC fallback
    if (userTimezone === "UTC" || userTimezone === "Etc/UTC") {
      if (Math.abs(userOffset - 5.5) < 0.5) {
        return "Asia/Kolkata";
      }
    }

    // Handle timezone aliases
    const timezoneAliases: Record<string, string> = {
      "Asia/Calcutta": "Asia/Kolkata",
    };

    if (timezoneAliases[userTimezone]) {
      const aliasedTz = TIMEZONES.find(
        (tz) => tz.value === timezoneAliases[userTimezone]
      );
      if (aliasedTz) {
        return aliasedTz.value;
      }
    }

    // Exact match
    const found = TIMEZONES.find((tz) => tz.value === userTimezone);
    if (found) {
      return found.value;
    }

    // City name match
    const userTzParts = userTimezone.toLowerCase().split("/");
    const cityName = userTzParts[userTzParts.length - 1];

    const similar = TIMEZONES.find((tz) => {
      const tzParts = tz.value.toLowerCase().split("/");
      const tzCity = tzParts[tzParts.length - 1];
      return (
        tzCity === cityName ||
        tzCity.includes(cityName) ||
        cityName.includes(tzCity)
      );
    });

    if (similar) {
      return similar.value;
    }

    // Offset-based match for India (UTC+5:30)
    if (Math.abs(userOffset - 5.5) < 0.5) {
      const indiaTz = TIMEZONES.find((tz) => tz.value === "Asia/Kolkata");
      if (indiaTz) {
        return indiaTz.value;
      }
    }
  } catch (error) {
    console.warn("Failed to detect user timezone:", error);
  }

  return "America/New_York";
}

/**
 * Get timezone offset string (e.g., "+05:30", "-08:00")
 */
export function getTimezoneOffset(timezone: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find((part) => part.type === "timeZoneName");
    if (offsetPart) {
      return offsetPart.value;
    }

    // Fallback: calculate offset manually
    const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
    const tzDate = new Date(
      now.toLocaleString("en-US", { timeZone: timezone })
    );
    const offset = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
    const sign = offset >= 0 ? "+" : "-";
    const hours = Math.floor(Math.abs(offset));
    const minutes = Math.floor((Math.abs(offset) - hours) * 60);
    return `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  } catch {
    return "";
  }
}

