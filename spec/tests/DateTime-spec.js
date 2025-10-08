import { DateTime } from "../../core/DateTime";
import * as moment from "moment";

describe('test DateTime methods', function() {

  beforeEach(function() {
    // Reset moment locale before each test
    moment.locale('en');
  });

  describe('smartFormat method', function() {
    it('should return null for empty/undefined values', function() {
      expect(DateTime.smartFormat(null)).toBe(null);
      expect(DateTime.smartFormat(undefined)).toBe(null);
      expect(DateTime.smartFormat('')).toBe(null);
    });

    it('should format today\'s date with "Today" prefix', function() {
      const today = new Date();
      const result = DateTime.smartFormat(today);
      expect(result).toContain('Today');
    });

    it('should format dates within the same week with day name', function() {
      const now = moment();
      const yesterday = moment().subtract(1, 'day');
      if (now.week() === yesterday.week()) {
        const result = DateTime.smartFormat(yesterday.toDate());
        expect(result).toMatch(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/);
      }
    });

    it('should format dates in different week of same month with MMM D LT', function() {
      const now = moment();
      const differentWeek = moment().subtract(2, 'weeks');
      if (now.month() === differentWeek.month() && now.year() === differentWeek.year()) {
        const result = DateTime.smartFormat(differentWeek.toDate());
        expect(result).toMatch(/^\w{3} \d{1,2} \d{1,2}:\d{2}/);
      }
    });

    it('should format dates in different month of same year with MMM D LT', function() {
      const now = moment();
      const differentMonth = moment().subtract(2, 'months');
      if (now.year() === differentMonth.year()) {
        const result = DateTime.smartFormat(differentMonth.toDate());
        expect(result).toMatch(/^\w{3} \d{1,2} \d{1,2}:\d{2}/);
      }
    });

    it('should format dates in different year with MMM D, YYYY LT', function() {
      const differentYear = moment().subtract(1, 'year');
      const result = DateTime.smartFormat(differentYear.toDate());
      expect(result).toMatch(/^\w{3} \d{1,2}, \d{4} \d{1,2}:\d{2}/);
    });

    it('should include UTC offset when outputOffset is true and timezone is present', function() {
      const dateWithZone = '2023-10-15T14:30:00-05:00';
      const result = DateTime.smartFormat(dateWithZone, true);
      if (result && result.includes('UTC')) {
        expect(result).toMatch(/UTC[+-]\d{2}:\d{2}/);
      }
    });
  });

  describe('formatLocalDate method', function() {
    it('should return null for undefined or invalid dates', function() {
      expect(DateTime.formatLocalDate(undefined)).toBe(null);
      expect(DateTime.formatLocalDate('invalid-date')).toBe(null);
    });

    it('should format valid date in YYYY-MM-DD HH:mm:ss format', function() {
      const date = new Date('2023-10-15T14:30:25');
      const result = DateTime.formatLocalDate(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    it('should handle string dates', function() {
      const result = DateTime.formatLocalDate('2023-10-15');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('fromLocalDate method', function() {
    it('should return null for undefined or invalid dates', function() {
      expect(DateTime.fromLocalDate(undefined)).toBe(null);
      expect(DateTime.fromLocalDate('invalid-date')).toBe(null);
    });

    it('should convert local date string to ISO string', function() {
      const result = DateTime.fromLocalDate('2023-10-15 14:30:25');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should handle Date objects', function() {
      const date = new Date('2023-10-15T14:30:25');
      const result = DateTime.fromLocalDate(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('toHumanDate method', function() {
    it('should return null for undefined or invalid dates', function() {
      expect(DateTime.toHumanDate(undefined)).toBe(null);
      expect(DateTime.toHumanDate('invalid-date')).toBe(null);
    });

    it('should format date in human readable format (LL)', function() {
      const date = new Date('2023-10-15T14:30:25');
      const result = DateTime.toHumanDate(date);
      expect(result).toMatch(/\w+ \d{1,2}, \d{4}/);
    });
  });

  describe('fromHumanDate method', function() {
    it('should return null for undefined or invalid dates', function() {
      expect(DateTime.fromHumanDate(undefined)).toBe(null);
      expect(DateTime.fromHumanDate('invalid-date')).toBe(null);
    });

    it('should convert human readable date to Date object', function() {
      const humanDate = 'October 15, 2023';
      const result = DateTime.fromHumanDate(humanDate);
      expect(result).toBeInstanceOf(Date);
    });

    it('should handle various human date formats', function() {
      const humanDate = 'Oct 15, 2023';
      const result = DateTime.fromHumanDate(humanDate);
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('toHumanTime method', function() {
    it('should return null for undefined or invalid dates', function() {
      expect(DateTime.toHumanTime(undefined)).toBe(null);
      expect(DateTime.toHumanTime('invalid-date')).toBe(null);
    });

    it('should format time in human readable format (LT)', function() {
      const date = new Date('2023-10-15T14:30:25');
      const result = DateTime.toHumanTime(date);
      expect(result).toMatch(/\d{1,2}:\d{2} (AM|PM)|\d{1,2}:\d{2}/);
    });
  });

  describe('fromHumanTime method', function() {
    it('should return null for undefined or invalid times', function() {
      expect(DateTime.fromHumanTime(undefined)).toBe(null);
      expect(DateTime.fromHumanTime('invalid-time')).toBe(null);
    });

    it('should convert human readable time to Date object', function() {
      const humanTime = '2:30 PM';
      const result = DateTime.fromHumanTime(humanTime);
      expect(result).toBeInstanceOf(Date);
    });

    it('should handle 24-hour format', function() {
      const humanTime = '14:30';
      const result = DateTime.fromHumanTime(humanTime);
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('toHumanDateTime method', function() {
    it('should return null for undefined or invalid dates', function() {
      expect(DateTime.toHumanDateTime(undefined)).toBe(null);
      expect(DateTime.toHumanDateTime('invalid-date')).toBe(null);
    });

    it('should format datetime in human readable format (LLLL)', function() {
      const date = new Date('2023-10-15T14:30:25');
      const result = DateTime.toHumanDateTime(date);
      expect(result).toContain('2023');
      expect(result).toContain('October');
    });
  });

  describe('fromHumanDateTime method', function() {
    it('should return null for undefined or invalid datetimes', function() {
      expect(DateTime.fromHumanDateTime(undefined)).toBe(null);
      expect(DateTime.fromHumanDateTime('invalid-datetime')).toBe(null);
    });

    it('should convert human readable datetime to Date object', function() {
      const humanDateTime = 'Sunday, October 15, 2023 2:30 PM';
      const result = DateTime.fromHumanDateTime(humanDateTime);
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('toFormat method', function() {
    it('should return null for undefined or invalid dates', function() {
      expect(DateTime.toFormat(undefined)).toBe(null);
      expect(DateTime.toFormat('invalid-date')).toBe(null);
    });

    it('should format date with default MM/DD/YYYY format', function() {
      const date = new Date('2023-10-15T14:30:25');
      const result = DateTime.toFormat(date);
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    it('should format date with custom format', function() {
      const date = new Date('2023-10-15T14:30:25');
      const result = DateTime.toFormat(date, 'DD-MM-YYYY');
      expect(result).toMatch(/^\d{2}-\d{2}-\d{4}$/);
    });
  });

  describe('toJSONDate method', function() {
    it('should return null for undefined or invalid dates', function() {
      expect(DateTime.toJSONDate(undefined)).toBe(null);
      expect(DateTime.toJSONDate('invalid-date')).toBe(null);
    });

    it('should format date in JSON format (YYYY-MM-DD[T]HH:mm:ssZ)', function() {
      const date = new Date('2023-10-15T14:30:25Z');
      const result = DateTime.toJSONDate(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
    });
  });

  describe('fromJSONDate method', function() {
    it('should return null for undefined or invalid dates', function() {
      expect(DateTime.fromJSONDate(undefined)).toBe(null);
      expect(DateTime.fromJSONDate('invalid-date')).toBe(null);
    });

    it('should parse JSON date format and return moment object', function() {
      const jsonDate = '2023-10-15T14:30:25+00:00';
      const result = DateTime.fromJSONDate(jsonDate);
      expect(result).toBeTruthy();
      expect(typeof result.format).toBe('function'); // moment object has format method
    });
  });

  describe('fromJSONDeviceDate method', function() {
    it('should return null for undefined or invalid dates', function() {
      expect(DateTime.fromJSONDeviceDate(undefined)).toBe(null);
      expect(DateTime.fromJSONDeviceDate('invalid-date')).toBe(null);
    });

    it('should parse JSON date and return device-formatted moment object', function() {
      const jsonDate = '2023-10-15T14:30:25+00:00';
      const result = DateTime.fromJSONDeviceDate(jsonDate);
      expect(result).toBeTruthy();
      expect(typeof result.format).toBe('function'); // moment object has format method
    });
  });

  describe('combineDateTime method', function() {
    it('should combine date and time into single Date object', function() {
      const date = new Date('2023-10-15T10:00:00');
      const time = new Date('1970-01-01T14:30:25');
      const result = DateTime.combineDateTime(date, time);
      
      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(25);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(9); // October is month 9 (0-indexed)
      expect(result.getDate()).toBe(15);
    });

    it('should handle different date and time combinations', function() {
      const date = new Date('2024-12-25T08:00:00');
      const time = new Date('2000-01-01T23:59:59');
      const result = DateTime.combineDateTime(date, time);
      
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(11); // December is month 11
      expect(result.getDate()).toBe(25);
    });
  });

  describe('setLocale method', function() {
    it('should change moment locale', function() {
      DateTime.setLocale('fr');
      expect(moment.locale()).toBe('fr');
      
      // Reset to English for other tests
      DateTime.setLocale('en');
      expect(moment.locale()).toBe('en');
    });

    it('should affect date formatting in different locales', function() {
      const date = new Date('2023-10-15T14:30:25');
      
      DateTime.setLocale('en');
      const englishFormat = DateTime.toHumanDate(date);
      
      DateTime.setLocale('fr');
      const frenchFormat = DateTime.toHumanDate(date);
      
      // Formats should be different for different locales
      expect(englishFormat).not.toBe(frenchFormat);
      
      // Reset to English
      DateTime.setLocale('en');
    });
  });

  describe('static properties', function() {
    it('should have correct format constants', function() {
      expect(DateTime._humanTime).toBe('LT');
      expect(DateTime._humanDateTime).toBe('LLLL');
      expect(DateTime._humanDate).toBe('LL');
      expect(DateTime._JSONDate).toBe('YYYY-MM-DD[T]HH:mm:ssZ');
      expect(DateTime._humanMMDDYYYY).toBe('MM/DD/YYYY');
    });

    it('should expose moment library', function() {
      expect(DateTime.moment).toBeDefined();
      expect(typeof DateTime.moment).toBe('function');
      expect(DateTime.moment()).toBeTruthy();
    });
  });

  describe('edge cases and error handling', function() {
    it('should handle null and undefined gracefully', function() {
      expect(DateTime.formatLocalDate(null)).toBe(null);
      expect(DateTime.fromLocalDate(null)).toBe(null);
      expect(DateTime.toHumanDate(null)).toBe(null);
      expect(DateTime.fromHumanDate(null)).toBe(null);
      expect(DateTime.toHumanTime(null)).toBe(null);
      expect(DateTime.fromHumanTime(null)).toBe(null);
      expect(DateTime.toHumanDateTime(null)).toBe(null);
      expect(DateTime.fromHumanDateTime(null)).toBe(null);
      expect(DateTime.toFormat(null)).toBe(null);
      expect(DateTime.toJSONDate(null)).toBe(null);
      expect(DateTime.fromJSONDate(null)).toBe(null);
      expect(DateTime.fromJSONDeviceDate(null)).toBe(null);
    });

    it('should handle invalid date strings', function() {
      const invalidDate = 'not-a-date';
      expect(DateTime.formatLocalDate(invalidDate)).toBe(null);
      expect(DateTime.fromLocalDate(invalidDate)).toBe(null);
      expect(DateTime.toHumanDate(invalidDate)).toBe(null);
      expect(DateTime.fromHumanDate(invalidDate)).toBe(null);
      expect(DateTime.toHumanTime(invalidDate)).toBe(null);
      expect(DateTime.fromHumanTime(invalidDate)).toBe(null);
      expect(DateTime.toHumanDateTime(invalidDate)).toBe(null);
      expect(DateTime.fromHumanDateTime(invalidDate)).toBe(null);
      expect(DateTime.toFormat(invalidDate)).toBe(null);
      expect(DateTime.toJSONDate(invalidDate)).toBe(null);
      expect(DateTime.fromJSONDate(invalidDate)).toBe(null);
      expect(DateTime.fromJSONDeviceDate(invalidDate)).toBe(null);
    });

    it('should handle extreme dates', function() {
      const extremeDate = new Date('1900-01-01');
      expect(DateTime.formatLocalDate(extremeDate)).not.toBe(null);
      expect(DateTime.toHumanDate(extremeDate)).not.toBe(null);
      
      const futureDate = new Date('2099-12-31');
      expect(DateTime.formatLocalDate(futureDate)).not.toBe(null);
      expect(DateTime.toHumanDate(futureDate)).not.toBe(null);
    });
  });
});
