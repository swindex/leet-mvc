import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/fr";
export declare const DateTime: {
    /**
     * Return date in progressive string format. Used for display purposes ONLY
     * @param value a Date object or parseable string
     * @param outputOffset - specify whether (UTC-xx:xx) timezone offset will be output. Defaults to false
     */
    smartFormat(value: string | Date | undefined, outputOffset?: boolean): string | null;
    /**
     * Return date in local string format: YYYY-MM-DD HH:mm:ss. Used for data transfer.
     * @param __date a Date object or parseable string
     */
    formatLocalDate: (__date: string | Date | undefined) => string | null;
    /**
     * Return date in local string format: YYYY-MM-DD HH:mm:ss. Used for data transfer.
     * @param __date a Date object or parseable string
     */
    fromLocalDate: (__date: string | Date | undefined) => string | null;
    /**
     * Return date in human-readable format.
     * @param __date a Date object or parseable string
     */
    toHumanDate: (__date: string | Date | undefined) => string | null;
    /**
     * Convert date from human format to date.
     * @param __date a parseable string
     */
    fromHumanDate: (__date: string | undefined) => Date | null;
    /**
     * Return time in human-readable format.
     * @param __date a Date object or parseable string
     */
    toHumanTime: (__date: string | Date | undefined) => string | null;
    /**
     * Return convert readable format to date
     * @param __date a Date object or parseable string
     */
    fromHumanTime: (__date: string | Date | undefined) => Date | null;
    /**
     * Convert date from human format to date.
     * @param __date a parseable string
     */
    fromHumanDateTime: (__date: string | undefined) => Date | null;
    /**
     * Return date in human-readable format.
     * @param __date a Date object or parseable string
     */
    toHumanDateTime: (__date: string | Date | undefined) => string | null;
    /**
     * Return date in specified format
     * @param __date a Date object or parseable string
     * @param format - defaults to MM/DD/YYYY
     */
    toFormat(__date: string | Date | undefined, format?: string): string | null;
    moment: typeof dayjs;
    toJSONDate: (__date: string | Date | undefined) => string | null;
    fromJSONDate: (__date: string | undefined) => Dayjs | null;
    /**
     * Return Device Date-Time
     */
    fromJSONDeviceDate: (__date: string | undefined) => Dayjs | null;
    /**
     * Combine date and time
     */
    combineDateTime(date: Date, time: Date): Date;
    setLocale(lang: string): void;
    _humanTime: "LT";
    _humanDateTime: "LLLL";
    _humanDate: "LL";
    _JSONDate: "YYYY-MM-DD[T]HH:mm:ssZ";
    _humanMMDDYYYY: "MM/DD/YYYY";
};
