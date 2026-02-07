// @ts-nocheck
import { DialogPage } from "../DialogPage/DialogPage";
import { SimpleTabs } from "../../components/SimpleTabs/SimpleTabs";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import weekOfYear from "dayjs/plugin/weekOfYear";
import localizedFormat from "dayjs/plugin/localizedFormat";
import './CalendarPage.scss';

// Initialize dayjs plugins
dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);
dayjs.extend(localizedFormat);
import { OptionsDialogPage } from "./../OptionsDialogPage/OptionsDialogPage";
import { Objects } from "./../../core/Objects";
import { DOM } from "../../core/DOM";

export class CalendarPage extends DialogPage {
  constructor(startDate) {
    super();

    this.title = "Calendar";
    this.content = CalendarPage.content;

    this._tabs = new SimpleTabs();

    this.buttons = {
      Cancel: this.onCancelClicked.bind(this),
      Ok: () => { return this.onDateTimeSelected(this._currDate.toDate()); },
    };

    this._showCalendar = true;
    this._showClock = true;

    this.isAM = true;

    this._currDate = dayjs(startDate || new Date());
    this._currMonth = this._currDate.clone();

    /** @type {{dateTime: Date}[]} */
    this.appointments = [];

    this._minutesSelected = false;

    //start with empty weeks.
    this._weeks = [];
    this._weekDayNames = Array.apply(null, Array(7)).map(function (_, i) {
      return dayjs().day(i).format('ddd');
    });

    this._hours = [
      { value: 0, title: 12, title_pm: 12 },
      { value: 1, title: 1, title_pm: 13 },
      { value: 2, title: 2, title_pm: 14 },
      { value: 3, title: 3, title_pm: 15 },
      { value: 4, title: 4, title_pm: 16 },
      { value: 5, title: 5, title_pm: 17 },
      { value: 6, title: 6, title_pm: 18 },
      { value: 7, title: 7, title_pm: 19 },
      { value: 8, title: 8, title_pm: 20 },
      { value: 9, title: 9, title_pm: 21 },
      { value: 10, title: 10, title_pm: 22 },
      { value: 11, title: 11, title_pm: 23 },
    ];

    this._minutes = Array.apply(null, Array(12)).map(function (_, i) {
      return { value: i * 5, title: dayjs().minute(i * 5).format('mm') };
    });

    this._months = Array.apply(null, Array(12)).map(function (_, i) {
      return { value: i + 1, title: dayjs().month(i).format('MMMM') };
    });

    this._years = Array.apply(null, Array(200)).map(function (_, i) {
      var v = dayjs().add(i - 100, "years").format('YYYY');
      return { value: v, title: v };
    });

    this.hasMeridiem = dayjs().format('LT').toLowerCase().indexOf('a') >= 0;

    this._setProps();
  }
  /**
   * @param {boolean} val
   */

  set showCalendar(val) {
    this._showCalendar = val;
    if (!val)
      this._tabs.select("clock");
    else
      this._tabs.select("calendar");

  }
  /**
   * @param {boolean} val
   */
  set showClock(val) {
    this._showClock = val;
    if (!val)
      this._tabs.select("calendar");
    else
      this._tabs.select("clock");
  }

  //initial calendar binding takes time. Do it after the dialog is displayed and other items are drawn.
  onVisible() {
    if (this._weeks.length == 0)
      this._weeks = [0, 1, 2, 3, 4, 5];
  }

  _weekDays(weekNumber) {
    var _weekDays = [];
    var cMonth = this._currMonth.month();
    var cDayF = this._currDate.format('YYY-MM-DD');
    for (var i = 1; i <= 7; i++) {
      var day = this._currMonth.clone().startOf('month').isoWeekday(i).add(weekNumber, 'week');

      var D = day.format('DD');
      var dayF = day.format('YYY-MM-DD');

      var apts = [];
      this.appointments.forEach((el) => {
        var mEl = dayjs(el.dateTime);
        if (mEl.format('YYY-MM-DD') == dayF) {
          apts.push("apt-" + mEl.format('HH'));
        }
      });



      if (day.month() !== cMonth)
        _weekDays.push({ day: "", dayNum: 0, date: null, selected: false, apts: [] });
      else {
        var selected = dayF == cDayF;
        _weekDays.push({ day: D, dayNum: Number(D), date: day.toDate(), selected: selected, apts: apts });
      }
    }

    return _weekDays;

  }
  _setProps() {
    this._currDate.startOf('minute');
    var H = Number(this._currDate.format('H'));
    this.isAM = H >= 0 && H < 12;

    this.title = this._currDate.format('dddd');
    this._d_monthName = this._currMonth.format('MMMM');
    this._d_date = this._currDate.format('MMM DD, YYYY');
    this._d_time = this._currDate.format('LT');
    this._d_day = this._currDate.format('D');
    this._d_year = this._currMonth.format('YYYY');

    this._d_hour = this._currDate.format('h');
    this._d_minute = this._currDate.format('mm');
  }
  onResize() {
    setTimeout(() => {
      var clock = DOM(this.page).find('#clock');
      var circle_wrapper = DOM(this.page).find('.circle_wrapper');

      var d = Math.min(clock.width(), clock.height()) - 50;



      circle_wrapper.height(d);
      circle_wrapper.width(d);

      var hr = clock.find('.hour').width() / 2;
      var r = d / 2 - hr;

      //angle offset
      var dA = (2 * Math.PI / 12) * 3;

      clock.find('.hour').each((el, n) => {
        var x = Math.sin((2 * Math.PI / 12) * n - dA) * r - hr + d / 2 - 2;
        var y = Math.cos((2 * Math.PI / 12) * n - dA) * r - hr + d / 2 - 2;
        DOM(el).css({ top: x, left: y });
      });

      clock.find('.minute').each((el, n) => {
        var x = Math.sin((2 * Math.PI / 12) * n - dA) * r - hr + d / 2 - 2;
        var y = Math.cos((2 * Math.PI / 12) * n - dA) * r - hr + d / 2 - 2;
        DOM(el).css({ top: x, left: y });
      });

    }, 100);
  }

  onNextMonthClicked() {
    this._currMonth.add(1, 'month');
    this._setProps();

  }
  onPrevMonthClicked() {
    this._currMonth.subtract(1, 'month');
    this._setProps();
  }
  /**
   * ***Override***
   * @param {Date} dateTime
   */
  onDateTimeSelected(dateTime) {
    console.log('Override onDateTimeSelected', dateTime);
    return false;
  }
  /**
   * ***Override***
   */
  onCancelClicked() {
    console.log('Override onCancelClicked');
  }
  onSelectHoursClicked() {
    this._minutesSelected = false;
  }
  onSelectMinutesClicked() {
    this._minutesSelected = true;
  }
  setYear(y) {
    this._currMonth.set('year', y);
    this._setProps();
  }
  setMonth(m) {
    this._currMonth.set('month', m - 1);
    this._setProps();
  }
  setHour(h) {
    this._currDate.set('hour', h);
    if (!this.isAM)
      this._currDate.add(12, 'hour');

    this._setProps();
  }

  onSetHourClicked(h) {
    if (this._minutesSelected)
      return;
    window.requestAnimationFrame(() => {
      this._minutesSelected = true;
    });
    this.setHour(h);
  }

  setMinute(m) {
    this._currDate.set('minute', m);
    this._setProps();
  }

  onSetMinuteClicked(m) {
    if (!this._minutesSelected)
      return;
    this.setMinute(m);
  }

  setDate(date) {
    var cH = this._currDate.hour();
    var cM = this._currDate.minute();
    var cS = this._currDate.second();

    this._currDate = dayjs(date);
    this._currDate = this._currDate.hour(cH);
    this._currDate = this._currDate.minute(cM);
    this._currDate = this._currDate.second(cS);

    this._currMonth = this._currDate.clone();
    this._setProps();
  }
  /**
   * ***Override***
   * @param {*} dateTime 
   */
  onDateSelected(dateTime) {
    //console.log('Override onDateSelected', dateTime);
  }
  onSetDateClicked(date) {
    if (!date)
      return;
    this.setDate(date);
    this.onDateSelected(date);
    if (this._showClock) {
      setTimeout(() => {
        this._tabs.select("clock");
      }, 10);
    }
  }
  setAM(isAM) {
    if (this.isAM != isAM) {
      if (this.isAM)
        this._currDate.add(12, 'hour');
      else
        this._currDate.subtract(12, 'hour');
    }
    this._setProps();
  }
  onSetAMClicked(isAM) {
    this.setAM(isAM);
  }
  onMonthClicked() {
    var p = this.Nav.push(OptionsDialogPage);
    p.icons = null;
    p.items = Objects.copy(this._months);
    p.buttons = null;
    p.isSelectedItem = (item) => {
      return item.value == this._currMonth.format('M');
    };
    p.onItemClicked = (item) => {
      this.setMonth(item.value);
    };
  }
  onYearClicked() {
    var p = this.Nav.push(OptionsDialogPage);
    p.icons = null;
    p.items = Objects.copy(this._years);
    p.buttons = null;
    p.isSelectedItem = (item) => {
      return item.value == this._currMonth.format('YYYY');
    };
    p.onItemClicked = (item) => {
      this.setYear(item.value);
    };

  }
  _getHourTitle(hours) {
    if (!this.isAM && !this.hasMeridiem) {
      return hours.title_pm;
    }
    if (!this.hasMeridiem && hours.value == 0) {
      return 0;
    }
    return hours.title;
  }
}
CalendarPage.selector = "page-CalendarPage";
CalendarPage.content = `
  <div [directive] = "this._tabs">
    <ul class="tab-buttons" [show]="this._showClock || (this._showCalendar && this._showClock)">
      <li for="calendar" [show]="this._showCalendar && this._showClock">
        <span bind="this._d_date"></span>
        <i class="far fa-calendar-alt"></i>
      </li>
      <li for="clock" [show]="this._showCalendar && this._showClock">
        <span bind="this._d_time"></span>
        <i class="far fa-clock"></i>
      </li>
      <li for="clock" [if]="!this._showCalendar" selected>
        <span bind="this._d_time"></span>
      </li>
    </ul>
    <div class="tabs">
      <div id="calendar" [show]="this._showCalendar">
        <div class="month-buttons">
          <button none class="arrow" onclick="this.onPrevMonthClicked()">
            <i class="fas fa-chevron-left"></i>
          </button>
          <div class="month-year">
            <button none class="month" bind="this._d_monthName" onclick="this.onMonthClicked()"></button>
            <button none class="year" bind="this._d_year" onclick="this.onYearClicked()"></button>
          </div>	
          <button none class="arrow" onclick="this.onNextMonthClicked()">
            <i class="fas fa-chevron-right"></i>
          </button>	
        </div>
        <div class="calendar">
          <table>
            <thead>
              <tr>
                <td [foreach] = "dayN in this._weekDayNames as day">
                  <b bind="day"></b>
                </td>
              </tr>
            </thead>
            <tbody>
              <tr [foreach] = "this._weeks as weekN">
                <td [foreach] = "this._weekDays(weekN) as day" [selected]="day.selected" [class]="day.class"  onclick="this.onSetDateClicked(day.date)">
                  <span>
                    <b bind="day.day" [class]="day.apts.length>0 ? 'has-appt': null"></b>
                    <b [foreach]="day.apts as apt" class="apt" [class]="apt" ></b>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>	
      <div id="clock" [show]="this._showClock">
        <div class="circle_wrapper">
          <div class="circle">
            <div class="hours"  [selected]="!this._minutesSelected" onclick="this.onSelectHoursClicked()">
              <div class="hour" [foreach]="this._hours as hours" onclick="this.onSetHourClicked(hours.value)" [selected]="this._d_hour==hours.title"><span bind="this._getHourTitle(hours)">0</span></div>
            </div>
            <div class="minutes" [selected]="this._minutesSelected" onclick="this.onSelectMinutesClicked()">
              <div class="hour" [foreach]="this._minutes as minutes" onclick="this.onSetMinuteClicked(minutes.value)" [selected]="this._d_minute==minutes.title"><span bind="minutes.title">12</span></div>
            </div>
            <div class="AMPM">
              <div class="AM" onclick="this.onSetAMClicked(true)" [selected]="this.isAM"><span>AM</span></div>
              <div class="PM" onclick="this.onSetAMClicked(false)" [selected]="!this.isAM"><span>PM</span></div>
            </div>
          </div>
        </div>	
      </div>	
    </div>
  </div>
`;
