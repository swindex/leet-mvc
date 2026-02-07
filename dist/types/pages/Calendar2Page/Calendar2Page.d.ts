import "dayjs/locale/en";
import './Calendar2Page.scss';
import { HeaderPage } from "./../HeaderPage/HeaderPage";
export declare class Calendar2Page extends HeaderPage {
    constructor(startDate: any);
    _allDayEvents(): any[];
    _hourEvents(hourValue: any): any[];
    _weekDays(weekNumber: any): any[];
    _getCalendarEvents(): void;
    _setProps(): void;
    _measure(): void;
    onLoaded(): void;
    onEnter(): void;
    onResize(): void;
    _onNextMonthClicked(): void;
    _onPrevMonthClicked(): void;
    setYear(y: any): void;
    setMonth(m: any): void;
    _onPrevDayClicked(): void;
    _onNextDayClicked(): void;
    _onMonthDayClicked(): void;
    setDate(date: any): void;
    _onCalendarDateClicked(date: any): void;
    scrollDayToFirstEvent(): void;
    showDayEvents(date: any): void;
    toHumanTime(t: any): string;
    /**
       *
       * @param {Calendar2Event} event
       */
    viewEvent(event: any): void;
    /**
       *
       * @param {Calendar2Event} event
       */
    removeEvent(event: any): void;
    getCalendarName(calendarId: any): any;
    /**
       * ***Override***
       * @param {Calendar2Event} event
       */
    onViewOrderButtonClicked(event: any): void;
    onEditEventClicked(event: any): void;
    /**
       *
       * @param {Calendar2Event} event
       */
    editEvent(event: any): void;
    /**
       *
       * @param {moment.Moment} [startDate]
       */
    createBlankEvent(startDate: any): void;
    /**
       * Create Appraisal Event Flow
       * @param {Calendar2Event} event
       */
    createAppraisalEvent(event: any): void;
    /**
       * Create Appraisal Event Flow
       * @param {Calendar2Event} appraisalEvent
       */
    removeAppraisalEvent(appraisalEvent: any): void;
    /**
       * ***Override***
       * Notify Appraisal Event is selected when creating event
       * @param {Calendar2Event} event
       */
    onCreateAppraisalEventSelected(event: any): void;
    /**
       * ***Override***
       * Notify Appraisal Event is ready to be added to calendar
       * @param {Calendar2Event} event
       */
    onAppraisalEventSaveClicked(event: any, callback: any): void;
    /**
       * ***Override***
       * Notify Appraisal Event Added
       * @param {Calendar2Event} event
       * @return {boolean|void}
       */
    onAppraisalEventAdded(event: any): boolean;
    /**
      * ***Override***
      * Callback on Address label clicked
      * @param {Calendar2Event} event
      */
    onAddressLabelClicked(event: any): void;
    /**
      * ***Override***
      * Callback on Contact Details label clicked
      * @param {Calendar2Event} event
      */
    onViewContactDetailsLabelClicked(event: any): void;
    /**
       * ***Override***
       * Notify Appraisal Event Did not Add successfully
       * @param {Calendar2Event} event
       */
    onAppraisalEventError(event: any): void;
    _onCalendarMonthClicked(): void;
    _onCalendarYearClicked(): void;
    _onMonthSwipeStart(ev: any): void;
    _onDaySwipeStart(ev: any): void;
    _onDayEventsHourClicked(hour: any): void;
}
