import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localizedFormat from "dayjs/plugin/localizedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import "dayjs/locale/en";
import "dayjs/locale/fr";

import { empty } from "./helpers";
import { Translate } from "./Translate";

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(weekOfYear);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export const DateTime = {
  /**
   * Return date in progressive string format. Used for display purposes ONLY
   * @param value a Date object or parseable string
   * @param outputOffset - specify whether (UTC-xx:xx) timezone offset will be output. Defaults to false
   */
  smartFormat(value: string | Date | undefined, outputOffset: boolean = false): string | null {
    if (empty(value))
      return null;

    const now = dayjs();
    const date = dayjs(value);
    const offset = dayjs(value).utcOffset();
    const hasZone = value && (typeof value === 'string' && value.includes('T') && (value.includes('+') || value.includes('-') || value.includes('Z')));
    const sameZone = !hasZone || (hasZone && now.utcOffset() === date.utcOffset());

    let f = "";

    // Everything is the same - show time only
    if (
      now.year() === date.year() &&
      now.month() === date.month() &&
      now.week() === date.week() &&
      now.day() === date.day()
    )
      f = "[" + Translate("Today") + "] LT";

    // Only Day of week is different - show day of week and time
    if (
      now.year() === date.year() &&
      now.month() === date.month() &&
      now.week() === date.week() &&
      now.day() !== date.day()
    )
      f = "dddd LT";

    // week is different - show month and date and time
    if (
      now.year() === date.year() &&
      now.month() === date.month() &&
      now.week() !== date.week()
    )
      f = "MMM D LT";

    // month is different - show month and date and time
    if (
      now.year() === date.year() &&
      now.month() !== date.month()
    )
      f = "MMM D LT";

    // year is different - show year and month and date and time
    if (now.year() !== date.year())
      f = "MMM D, YYYY LT";

    if (outputOffset && hasZone)
      f += " [(UTC]Z[)]";

    let ret: string | null = null;
    if (hasZone && !sameZone)
      ret = dayjs(value).utcOffset(offset).format(f);
    else
      ret = dayjs(value).format(f);

    return ret;
  },

  /**
   * Return date in local string format: YYYY-MM-DD HH:mm:ss. Used for data transfer.
   * @param __date a Date object or parseable string
   */
  formatLocalDate: function (__date: string | Date | undefined): string | null {
    if (__date === undefined || !dayjs(__date).isValid())
      return null;
    return dayjs(__date).format('YYYY-MM-DD HH:mm:ss');
  },

  /**
   * Return date in local string format: YYYY-MM-DD HH:mm:ss. Used for data transfer.
   * @param __date a Date object or parseable string
   */
  fromLocalDate: function (__date: string | Date | undefined): string | null {
    if (__date === undefined) return null;

    let parsed: Dayjs;
    if (typeof __date === 'string') {
      // Try parsing as local date format first
      parsed = dayjs(__date, 'YYYY-MM-DD HH:mm:ss');
      if (!parsed.isValid()) {
        // Try default parsing
        parsed = dayjs(__date);
      }
    } else {
      // Handle Date object
      parsed = dayjs(__date);
    }

    if (!parsed.isValid()) return null;

    return parsed.toISOString();
  },

  /**
   * Return date in human-readable format.
   * @param __date a Date object or parseable string
   */
  toHumanDate: function (__date: string | Date | undefined): string | null {
    if (__date === undefined || !dayjs(__date).isValid())
      return null;

    return dayjs(__date).format('LL');
  },

  /**
   * Convert date from human format to date.
   * @param __date a parseable string
   */
  fromHumanDate: function (__date: string | undefined): Date | null {
    if (__date === undefined) return null;

    // Try multiple date formats that are commonly used
    const formats = [DateTime._humanDate, 'LL', 'MMM DD, YYYY', 'MMM D, YYYY', 'MMMM DD, YYYY', 'MMMM D, YYYY'];

    for (const format of formats) {
      const parsed = dayjs(__date, format);
      if (parsed.isValid()) {
        return parsed.toDate();
      }
    }

    // Try default parsing as fallback
    const defaultParsed = dayjs(__date);
    if (defaultParsed.isValid()) {
      return defaultParsed.toDate();
    }

    return null;
  },

  /**
   * Return time in human-readable format.
   * @param __date a Date object or parseable string
   */
  toHumanTime: function (__date: string | Date | undefined): string | null {
    if (__date === undefined || !dayjs(__date).isValid())
      return null;

    return dayjs(__date).format(DateTime._humanTime);
  },

  /**
   * Return convert readable format to date
   * @param __date a Date object or parseable string
   */
  fromHumanTime: function (__date: string | Date | undefined): Date | null {
    if (__date === undefined) return null;

    // Try multiple time formats
    const timeFormats = [DateTime._humanTime, 'LT', 'HH:mm', 'H:mm', 'h:mm A', 'h:mm a', 'HH:mm:ss', 'H:mm:ss'];

    for (const format of timeFormats) {
      const parsed = dayjs(__date as string, format);
      if (parsed.isValid()) {
        return parsed.toDate();
      }
    }

    // Try default parsing as fallback
    const defaultParsed = dayjs(__date);
    if (defaultParsed.isValid()) {
      return defaultParsed.toDate();
    }

    return null;
  },

  /**
   * Convert date from human format to date.
   * @param __date a parseable string
   */
  fromHumanDateTime: function (__date: string | undefined): Date | null {
    if (__date === undefined) return null;

    // Try multiple datetime formats
    const dateTimeFormats = [
      DateTime._humanDateTime, 'LLLL',
      'dddd, MMMM D, YYYY h:mm A', 'dddd, MMMM DD, YYYY h:mm A',
      'MMMM D, YYYY h:mm A', 'MMMM DD, YYYY h:mm A',
      'MMM D, YYYY h:mm A', 'MMM DD, YYYY h:mm A',
      'dddd, MMMM D, YYYY HH:mm', 'dddd, MMMM DD, YYYY HH:mm',
      'MMMM D, YYYY HH:mm', 'MMMM DD, YYYY HH:mm',
      'MMM D, YYYY HH:mm', 'MMM DD, YYYY HH:mm'
    ];

    for (const format of dateTimeFormats) {
      const parsed = dayjs(__date, format);
      if (parsed.isValid()) {
        return parsed.toDate();
      }
    }

    // Try default parsing as fallback
    const defaultParsed = dayjs(__date);
    if (defaultParsed.isValid()) {
      return defaultParsed.toDate();
    }

    return null;
  },

  /**
   * Return date in human-readable format.
   * @param __date a Date object or parseable string
   */
  toHumanDateTime: function (__date: string | Date | undefined): string | null {
    if (__date === undefined || !dayjs(__date).isValid())
      return null;
    return dayjs(__date).format(DateTime._humanDateTime);
  },

  /**
   * Return date in specified format
   * @param __date a Date object or parseable string
   * @param format - defaults to MM/DD/YYYY
   */
  toFormat(__date: string | Date | undefined, format?: string): string | null {
    format = format || DateTime._humanMMDDYYYY;
    if (__date === undefined || !dayjs(__date).isValid())
      return null;
    return dayjs(__date).format(format);
  },

  moment: dayjs,

  toJSONDate: function (__date: string | Date | undefined): string | null {
    if (__date === undefined || !dayjs(__date).isValid())
      return null;

    return dayjs(__date).format(DateTime._JSONDate);
  },

  fromJSONDate: function (__date: string | undefined): Dayjs | null {
    if (__date === undefined || !dayjs(__date).isValid())
      return null;
    return dayjs(__date, DateTime._JSONDate);
  },

  /**
   * Return Device Date-Time
   */
  fromJSONDeviceDate: function (__date: string | undefined): Dayjs | null {
    if (__date === undefined || !dayjs(__date).isValid())
      return null;
    const v = dayjs(__date, DateTime._JSONDate).utc().format('LLLL');
    const v2 = dayjs(v, 'LLLL');
    return v2;
  },

  /**
   * Combine date and time
   */
  combineDateTime(date: Date, time: Date): Date {
    const time_m = dayjs(time);
    const cH = time_m.hour();
    const cM = time_m.minute();
    const cS = time_m.second();

    let date_m = dayjs(date);
    date_m = date_m.hour(cH);
    date_m = date_m.minute(cM);
    date_m = date_m.second(cS);

    return date_m.toDate();
  },

  setLocale(lang: string): void {
    dayjs.locale(lang);
  },

  _humanTime: "LT" as const,
  _humanDateTime: "LLLL" as const,
  _humanDate: "LL" as const,
  _JSONDate: 'YYYY-MM-DD[T]HH:mm:ssZ' as const,
  _humanMMDDYYYY: "MM/DD/YYYY" as const,
};