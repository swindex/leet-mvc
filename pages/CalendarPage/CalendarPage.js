import { DialogPage } from "../DialogPage/DialogPage";
import { SimpleTabs } from "../../components/SimpleTabs/SimpleTabs";
import * as moment from "moment";
import './CalendarPage.scss';


export class CalendarPage extends DialogPage{
	constructor(page, startDate){
		super(page);

		this.title = "Calendar";
		this.content = CalendarPage.content;

		this._tabs = new SimpleTabs();

		this.buttons={
			Cancel: this.onCancelClicked.bind(this),
			Ok: ()=>{ return this.onDateTimeSelected(this._currDate.toDate())},
		};

		this.isAM = true;

		this._currDate = moment(startDate || new Date());
		this._currMonth = this._currDate.clone();

		/** @type {{dateTime: Date}[]} */
		this.appointments=[];

		this._minutesSelected = false;

		this._weeks = [0,1,2,3,4,5];
		this._weekDayNames = Array.apply(null, Array(7)).map(function (_, i) {
			return moment(i, 'e').startOf('week').isoWeekday(i + 1).format('ddd');
		});

		this._hours = Array.apply(null, Array(12)).map(function (_, i) {
			return { value: i, title: moment(i, 'h').startOf('day').hour(i).format('h')};
		});

		this._minutes = Array.apply(null, Array(12)).map(function (_, i) {
			return { value: i*5, title: moment(i*5, 'm').startOf('hour').minute(i*5).format('mm')};
		});

		this._setProps();
	}

	_weekDays(weekNumber){
		var _weekDays = [];
		var cMonth= this._currMonth.month();

		for (var i = 1; i<=7 ; i++){
			var day = this._currMonth.clone().startOf('month').isoWeekday(i).add(weekNumber,'week');

			var D = day.format('DD');

			
			var apts = [];
			this.appointments.forEach((el)=>{
				if (moment(el.dateTime).format('YYY-MM-DD')==day.format('YYY-MM-DD')){
					apts.push("apt-"+ moment(el.dateTime).format('HH'));
				}
			});



			if (day.month() !== cMonth)
				_weekDays.push({day: "",dayNum:0, date:null, selected:false,apts:[]});
			else{
				var selected = day.format('YYY-MM-DD') == this._currDate.format('YYY-MM-DD');
				_weekDays.push({day: D, dayNum: Number(D), date: day.toDate(), selected:selected,apts:apts});
			}
		};

		return _weekDays;

	}
	_setProps(){
		var H = Number(this._currDate.format('H'));
		this.isAM = H >= 0 && H <12;

		this.title = this._currDate.format('dddd');
		this._d_monthName = this._currMonth.format('MMMM');
		this._d_date = this._currDate.format('MMM DD, YYYY');
		this._d_time = this._currDate.format('LT');
		this._d_day = this._currDate.format('D');
		this._d_year = this._currDate.format('YY');

		this._d_hour = this._currDate.format('h');
		this._d_minute = this._currDate.format('mm');
	}
	onResize(){
		setTimeout(()=>{
			var clock = this.page.find('#clock');
			var d = Math.min(clock.width(),clock.height());

			clock.height(d);
			clock.width(d);
			
			var hr = clock.find('.hour').width()/2;
			var r = d/2 - hr ;

			//angle offset
			var dA = (2*Math.PI/12) * 3

			clock.find('.hour').each((n,el)=>{
				var x = Math.sin((2*Math.PI/12)*n - dA)*r -hr + d/2 -2
				var y = Math.cos((2*Math.PI/12)*n - dA)*r -hr + d/2 -2
				$(el).css({top: x, left:y});
			})

			clock.find('.minute').each((n,el)=>{
				var x = Math.sin((2*Math.PI/12)*n - dA)*r -hr + d/2 -2
				var y = Math.cos((2*Math.PI/12)*n - dA)*r -hr + d/2 -2
				$(el).css({top: x, left:y});
			})

		},100);
	}
	
	onNextMonthClicked(){
		this._currMonth.add(1,'month');
		this._setProps();

	}
	onPrevMonthClicked(){
		this._currMonth.subtract(1,'month');
		this._setProps();
	}
	/**
	 * ***Override***
	 * @param {Date} dateTime
	 */
	onDateTimeSelected(dateTime){
		console.log('Override onDateTimeSelected',dateTime);
		return false;
	}
	/**
	 * ***Override***
	 */
	onCancelClicked(){
		console.log('Override onCancelClicked');
	}
	onSelectHoursClicked(){
		this._minutesSelected = false;	
	}
	onSelectMinutesClicked(){
		this._minutesSelected = true;	
	}
	setHour(h){
		this._currDate.set('hour',h);
		if (!this.isAM)
			this._currDate.add(12,'hour');
		
		this._setProps();
	}
	
	onSetHourClicked(h){
		if (this._minutesSelected)
			return;
		window.requestAnimationFrame(()=>{	
			this._minutesSelected = true;
		});
		this.setHour(h);	
	}

	setMinute(m){
		this._currDate.set('minute',m);
		this._setProps();
	}
	
	onSetMinuteClicked(m){
		if (!this._minutesSelected)
			return;
		this.setMinute(m);	
	}

	setDate(date){
		var cH = this._currDate.hour();
		var cM = this._currDate.minute();
		var cS = this._currDate.second();

		this._currDate = moment(date);
		this._currDate.set('hour',cH);
		this._currDate.set('minute',cM);
		this._currDate.set('second',cS);
		
		this._currMonth = this._currDate.clone();
		this._setProps();
	}
	onSetDateClicked(date){
		this.setDate(date);
		setTimeout(()=>{
			this._tabs.select("clock");
		},500);
	}
	setAM(isAM){
		if (this.isAM != isAM){
			if (this.isAM)
				this._currDate.add(12,'hour');
			else
				this._currDate.subtract(12,'hour');
		}
		this._setProps();
	}
	onSetAMClicked(isAM){
		this.setAM(isAM)
	}

}
CalendarPage.selector = "page-CalendarPage";
CalendarPage.content = `
	<div [directive] = "this._tabs">
		<ul class="tab-buttons">
			<li for="calendar">
				<span bind="this._d_date"></span>
				<i class="far fa-calendar-alt"></i>
			</li>
			<li for="clock">
				<span bind="this._d_time"></span>
				<i class="far fa-clock"></i>
			</li>
		</ul>
		<div class="tabs">
			<div id="calendar">
				<div class="month-buttons">
					<div onclick="this.onPrevMonthClicked()">
						<i class="fas fa-chevron-left"></i>
					</div>
					<div>
						<b bind="this._d_monthName"></b>
					</div>	
					<div onclick="this.onNextMonthClicked()">
						<i class="fas fa-chevron-right"></i>
					</div>	
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
			<div id="clock">
				<div class="circle">
					<div class="hours"  [selected]="!this._minutesSelected" onclick="this.onSelectHoursClicked()">
						<div class="hour h-12" [foreach]="this._hours as hours" onclick="this.onSetHourClicked(hours.value)" [selected]="this._d_hour==hours.title" [class]="'h-' + hours.value"><span bind="hours.title">12</span></div>
					</div>
					<div class="minutes" [selected]="this._minutesSelected" onclick="this.onSelectMinutesClicked()">
						<div class="hour h-12" [foreach]="this._minutes as minutes" onclick="this.onSetMinuteClicked(minutes.value)" [selected]="this._d_minute==minutes.title" [class]="'h-' + minutes.value"><span bind="minutes.title">12</span></div>
					</div>
					<div class="AMPM">
						<div class="AM" onclick="this.onSetAMClicked(true)" [selected]="this.isAM"><span>AM</span></div>
						<div class="PM" onclick="this.onSetAMClicked(false)" [selected]="!this.isAM"><span>PM</span></div>
					</div>
				</div>	
			</div>	
		</div>
	</div>
`;