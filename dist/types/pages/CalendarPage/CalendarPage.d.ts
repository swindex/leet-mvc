import { DialogPage } from "../DialogPage/DialogPage";
import './CalendarPage.scss';
export declare class CalendarPage extends DialogPage {
    constructor(startDate: any);
    /**
     * @param {boolean} val
     */
    set showCalendar(val: any);
    /**
     * @param {boolean} val
     */
    set showClock(val: any);
    onVisible(): void;
    _weekDays(weekNumber: any): any[];
    _setProps(): void;
    onResize(): void;
    onNextMonthClicked(): void;
    onPrevMonthClicked(): void;
    /**
     * ***Override***
     * @param {Date} dateTime
     */
    onDateTimeSelected(dateTime: any): boolean;
    /**
     * ***Override***
     */
    onCancelClicked(): void;
    onSelectHoursClicked(): void;
    onSelectMinutesClicked(): void;
    setYear(y: any): void;
    setMonth(m: any): void;
    setHour(h: any): void;
    onSetHourClicked(h: any): void;
    setMinute(m: any): void;
    onSetMinuteClicked(m: any): void;
    setDate(date: any): void;
    /**
     * ***Override***
     * @param {*} dateTime
     */
    onDateSelected(dateTime: any): void;
    onSetDateClicked(date: any): void;
    setAM(isAM: any): void;
    onSetAMClicked(isAM: any): void;
    onMonthClicked(): void;
    onYearClicked(): void;
    _getHourTitle(hours: any): any;
}
