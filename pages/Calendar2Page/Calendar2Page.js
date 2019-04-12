import * as moment from "moment";
import './Calendar2Page.scss';
import { OptionsDialogPage } from "./../OptionsDialogPage/OptionsDialogPage";
import { Objects } from "./../../core/Objects";
import { SimpleTabs } from "./../../components/SimpleTabs/SimpleTabs";
import { DateTime } from "./../../core/DateTime";
import { CalendarPage } from "./../CalendarPage/CalendarPage";
import { Touch } from "./../../core/Touch";
import { DialogPage } from "./../DialogPage/DialogPage";
import { HeaderPage } from "./../HeaderPage/HeaderPage";
import { Translate } from "./../../core/Translate";

export class Calendar2Page extends HeaderPage{
	constructor(page, startDate){
		super(page);
		this.backButton = true;
		this.content = template;

		this._tabs = new SimpleTabs();
		this._tabs.onTabChanged = (label)=>{
			if (label == 'day') { this.scrollDayToFirstEvent(); }
		}
		this._currDate = moment(startDate || new Date());
		this._currMonth = this._currDate.clone().startOf('month');
		this.events_year != this._currMonth.get('year');

		/** @type {Calendar2Event[]} */
		this.events=[];
		/** @type {Calendar2Event[]} */
		this.unscheduledEvents=[];
 
		/** @type {Calendar2DaySlots} */
		this.dayEventSlots = {}; 

		this.events_year = null;

		this.appraisalEvent = null;

		//start with empty weeks.
		this._weeks = [];
		this._weekDayNames = Array.apply(null, Array(7)).map(function (_, i) {
			return moment(i, 'e').startOf('week').isoWeekday(i + 1).format('ddd');
		});

		this._24hours = [
			{ value: 0,  title: 12, amLabel:"AM", title_24: 0},
			{ value: 1,  title: 1,  amLabel:"AM", title_24: 1},
			{ value: 2,  title: 2,  amLabel:"AM", title_24: 2},
			{ value: 3,  title: 3,  amLabel:"AM", title_24: 3},
			{ value: 4,  title: 4,  amLabel:"AM", title_24: 4},
			{ value: 5,  title: 5,  amLabel:"AM", title_24: 5},
			{ value: 6,  title: 6,  amLabel:"AM", title_24: 6},
			{ value: 7,  title: 7,  amLabel:"AM", title_24: 7},
			{ value: 8,  title: 8,  amLabel:"AM", title_24: 8},
			{ value: 9,  title: 9,  amLabel:"AM", title_24: 9},
			{ value: 10, title: 10, amLabel:"AM", title_24: 10},
			{ value: 11, title: 11, amLabel:"AM", title_24: 11},
			{ value: 12, title: 12, amLabel:"PM", title_24: 12},
			{ value: 13, title: 1,  amLabel:"PM", title_24: 13},
			{ value: 14, title: 2,  amLabel:"PM", title_24: 14},
			{ value: 15, title: 3,  amLabel:"PM", title_24: 15},
			{ value: 16, title: 4,  amLabel:"PM", title_24: 16},
			{ value: 17, title: 5,  amLabel:"PM", title_24: 17},
			{ value: 18, title: 6,  amLabel:"PM", title_24: 18},
			{ value: 19, title: 7,  amLabel:"PM", title_24: 19},
			{ value: 20, title: 8,  amLabel:"PM", title_24: 20},
			{ value: 21, title: 9,  amLabel:"PM", title_24: 21},
			{ value: 22, title: 10, amLabel:"PM", title_24: 22},
			{ value: 23, title: 11, amLabel:"PM", title_24: 23},
		];

		this.ingoingSlideClass = null;
		this.outgoingSlideClass = null;
		this.daySlideTrigger = 0;
		this.monthSlideTrigger = 0;
		
		this._minutes = Array.apply(null, Array(12)).map(function (_, i) {
			return { value: i*5, title: moment(i*5, 'm').startOf('hour').minute(i*5).format('mm')};
		});

		this._months = Array.apply(null, Array(12)).map(function (_, i) {
			return { value: i+1, title: moment(i+1, 'MM').format('MMMM')};
		});

		this._years = Array.apply(null, Array(10)).map(function (_, i) {
			var v = moment().add(i-5,"years").format('YYYY');
			return { value: v, title: v};
		});

		this.hasMeridiem = moment.localeData().longDateFormat('LT').toLowerCase().indexOf('a') >= 0;

		this.calendarInfo = {
			height:null,
			width:null,
			cell:{
				dateHeight:19,
				height:null,
				width:null,
			}
		}

		//set some optional handlers to null
		//if they are left unimplemented, the UI elements that trigger them will not show up
		this.onViewContactDetailsLabelClicked = null;
		this.onAddressLabelClicked = null;
	}

	_allDayEvents(){
		var day = this._currDate.clone().startOf('day');
		var day_y = getDayNumber(day);
		var ret = [];
		Objects.forEach(this.dayEventSlots[day_y],(el)=>{
			if (el.allday) {
				ret.push({event:el, class: ""});
			}
		});
		return ret;
	}

	_hourEvents(hourValue){
		var hour = this._currDate.clone().startOf('day').add(hourValue,'hour');
		
		var day = hour.clone().startOf('day');
		var day_e = hour.clone().endOf('day');
		
		var hour_e = hour.clone().endOf('hour');
		var day_y = getDayNumber(day);
		
		var apts = [];

		Objects.forEach(this.dayEventSlots[day_y],(el, slot)=>{
			slot = parseInt(slot);

			var ev_st = el.startDate;
			var ev_end =el.endDate;
		
			var minuteOffset = ev_st.get('minute');
			var minuteLength;
			if (ev_st.isSameOrAfter(day)) {
				minuteLength = ev_end.diff(ev_st, 'minute');
			} else {
				minuteLength = ev_end.diff(day, 'minute');
			}
			if (minuteLength+minuteOffset+hourValue*60 > 24 * 60) {
				minuteLength = 24 * 60 - minuteOffset - hourValue*60;
			}

			var className = []; 
			if (el.internalEventInfo) {
				className.push('internal');
				if (this.appraisalEvent && el.internalEventInfo.id == this.appraisalEvent.internalEventInfo.id && el.internalEventInfo.schema_name == this.appraisalEvent.internalEventInfo.schema_name ){
					className.push('current');
				}	
			}

			var evWidth = el.overlaps + 1;

			var overlapOffset = 100 / (evWidth) * el.overlapShift;
			var overlapLength = 100 / (evWidth);

			
			if (
				(!el.allday && ev_st.isSameOrAfter(hour) && ev_st.isSameOrBefore(hour_e)) || //event fits completely
				(!el.allday && hourValue == 0 && ev_st.isBefore(day) && ev_end.isBefore(day_e)) //event started yesterday and ends today
			) {
				apts.push({
					event:el, 
					minuteOffset: minuteOffset,
					minuteLength:minuteLength, 
					overlapOffset: overlapOffset,
					overlapLength: overlapLength,
					class: className.join(' ')
				});
			}
		});
		return apts;
	}

	_weekDays(weekNumber){
		var _weekDays = [];
		var cMonth= this._currMonth.month();
		var cDayF = this._currDate.format('YYY-MM-DD');

		var week = this._currMonth.clone().startOf('month').add(weekNumber,'week');

		var maxEventsPerDay = Math.floor((this.calendarInfo.cell.height - this.calendarInfo.cell.dateHeight) / 15)

		for (var i = 1; i<=7 ; i++) {
			var day = week.clone().isoWeekday(i);
			var day_e = day.clone().endOf('day');
			var week_e = day.clone().endOf('isoWeek');
			var day_y = getDayNumber(day);
			var D = day.format('DD');
			var dayF = day.format('YYY-MM-DD');
			
			var apts = [];
			var extraEventsCounter = 0;

			Objects.forEach(this.dayEventSlots[day_y],(el, slot)=>{
				slot = parseInt(slot);
				if (slot+1 > maxEventsPerDay) {
					extraEventsCounter ++;
					return;
				}

				var ev_st = el.startDate;
				var ev_end = el.endDate;
				

				var className = []; 
				className.push('slot-'+slot);
				if (el.internalEventInfo) {
					className.push('internal');
					if (this.appraisalEvent && el.internalEventInfo.id == this.appraisalEvent.internalEventInfo.id && el.internalEventInfo.schema_name == this.appraisalEvent.internalEventInfo.schema_name) {
						className.push('current');
					}	
				}

				//event fits completely
				if (ev_st >= day && ev_st <= day_e && ev_end >= day && ev_end <= day_e) {
					apts.push({dateTime:el.startDate,title: el.title, class: className.join(' ')});
				} else {
					//event covers several days
					if (day.isBetween(ev_st,ev_end) || day_e.isBetween(ev_st,ev_end)) {
						//first day of a long event
						if (day.get('dayOfYear') == ev_st.get('dayOfYear')) {
							let daysWLong = Math.min( week_e.diff(day,'days')+1, ev_end.diff(day,'days'));
							className.push("expand-"+daysWLong);
							apts.push({dateTime:el.startDate,title: el.title, class: className.join(' ') });
						} else {
							//week or month break
							if (day.get('isoWeekday')==1 || day.get('date')==1){
								let daysWLong = Math.min( week_e.diff(day,'days')+1, ev_end.diff(day,'days')+1);
								className.push("expand-"+daysWLong);
								apts.push({dateTime:el.startDate,title: el.title, class: className.join(' ')});
							}
						}
					}
				}
			});

			if (day.month() !== cMonth) {
				_weekDays.push({day: "",dayNum:0, date:null, selected:false,events:[]});
			} else {
				var selected = dayF == cDayF;
				_weekDays.push({day: D, dayNum: Number(D), date: day.toDate(), selected:selected,events:apts, extraEvents:extraEventsCounter});
			}
		};

		return _weekDays;

	}
	_getCalendarEvents(){
		this.events_year = this._currMonth.get('year');
		var dayEventSlots = { 0: null };

		var calEvents=[];
		Objects.forEach(this.events,(el)=>{
			calEvents.push(parseNativeCalendarEvent(el));
		})

		window.plugins.calendar.findEvent('','','',this._currMonth.clone().startOf('year').toDate(),this._currMonth.clone().endOf('year').toDate(), (list)=>{
			//console.log( JSON.stringify(list));
			Objects.forEach(list,(el)=>{
				calEvents.push(parseNativeCalendarEvent(el));
			})

			calEvents.sort(eventSortCallback);
			//populate events list into day EventSlots
			Objects.forEach(calEvents,(evt)=>{
				populateDayEventSlots(evt, dayEventSlots);	
			});
			this.dayEventSlots = dayEventSlots;
				
		}, (err)=>{
			calEvents.sort(eventSortCallback);
			//populate events list into day EventSlots
			Objects.forEach(calEvents,(evt)=>{
				populateDayEventSlots(evt, dayEventSlots);	
			});
			this.dayEventSlots = dayEventSlots;
		})
	}

	_setProps(){
		this._currDate.startOf( 'minute' ); 

		//this.title = this._currDate.format('dddd');
		this._d_monthName = this._currMonth.format('MMMM');
		this._d_time = this._currDate.format('LT');
		this._d_day = this._currDate.format('D');
		this._d_year = this._currMonth.format('YYYY');

		if (this.events_year != this._currMonth.get('year')) {
			this._getCalendarEvents();
		}
	}

	_measure(){
		var calendar = this.page.find('div.calendar');
		var tbody = calendar.find('tbody');
		
		this.calendarInfo.height = tbody.height();
		this.calendarInfo.width = tbody.width();

		this.calendarInfo.cell.height = this.calendarInfo.height / 6;
		this.calendarInfo.cell.width = this.calendarInfo.width / 7;
	}

	onLoaded(){
		if (this._weeks.length==0) {
			this._weeks = [0,1,2,3,4,5];
		}
		this._setProps();
	}

	onEnter(){
		this._measure();
		this._getCalendarEvents();
	}

	onResize(){
		this._measure();
	}
	
	_onNextMonthClicked(){
		this.ingoingSlideClass = "slidefromright";
		this.outgoingSlideClass = "slidetoleft";
		this.monthSlideTrigger ++;

		this._currMonth.add(1,'month');
		this._setProps();
	}

	_onPrevMonthClicked(){
		this.ingoingSlideClass = "slidefromleft";
		this.outgoingSlideClass = "slidetoright";
		this.monthSlideTrigger ++;

		this._currMonth.subtract(1,'month');
		this._setProps();
	}

	setYear(y){
		this._currMonth.set('year',y);		
		this._setProps();
	}

	setMonth(m){
		this._currMonth.set('month',m-1);		
		this._setProps();
	}

	_onPrevDayClicked(){
		this.ingoingSlideClass = "slidefromleft";
		this.outgoingSlideClass = "slidetoright";
		this.daySlideTrigger++;
		this._currDate.subtract(1,'day');
		this._currMonth = this._currDate.clone().startOf('month');
		this._setProps();
	}

	_onNextDayClicked(){
		this.ingoingSlideClass = "slidefromright";
		this.outgoingSlideClass = "slidetoleft";
		this.daySlideTrigger++
		this._currDate.add(1,'day');
		this._currMonth = this._currDate.clone().startOf('month');
		this._setProps();
	}

	_onMonthDayClicked(){
		var p = this.Nav.push(CalendarPage, this._currDate);
		p.showClock = false;
		p.onDateSelected = (date)=>{
			this.setDate(date);
			p.destroy();
		}
		p.buttons.Ok = undefined;
	}
	
	setDate(date){
		var cH = this._currDate.hour();
		var cM = this._currDate.minute();
		//var cS = this._currDate.second();

		this._currDate = moment(date);
		this._currDate.set('hour',cH);
		this._currDate.set('minute',cM);
		this._currDate.startOf('minute');
		
		this._currMonth = this._currDate.clone().startOf('month');
		this._setProps();
	}

	_onCalendarDateClicked(date){
		if (!date) {
			return;
		}
		this.setDate(date);

		this._tabs.select('day');
		this.scrollDayToFirstEvent();
	}

	scrollDayToFirstEvent(){
		//do it in next frame after page is updated
		setTimeout(()=>{
			var list = this.page.find('.day-events');
			if (list.length) {
				var firstEvent = list.find('.event').get(0);
				if (firstEvent) {
					firstEvent.scrollIntoView();
				}
			}
		},0);
	}

	showDayEvents(date){
		var m_date = moment(date);
		var d = getDayNumber(m_date);

		if (!this.dayEventSlots[d]) {
			return;
		}

		var p = this.Nav.push(OptionsDialogPage);
		p.title = m_date.format('ll');
		p.icons = null;

		Objects.forEach(this.dayEventSlots[d],(el)=>{
			p.items.push({ title:el.title, text: DateTime.smartFormat(el.startDate) + ' - ' + DateTime.smartFormat(el.endDate) , event:el});
		});

		p.onItemClicked = (item)=>{
			p.destroy();
			this.viewEvent(item.event);
		}

		p.buttons = {
			'Add':()=>this.createBlankEvent(),
			'Close':null
		}
	}

	toHumanTime(t){
		return DateTime.toHumanTime(t);
	}
	/**
	 * 
	 * @param {Calendar2Event} event 
	 */
	viewEvent(event){
		var p = this.Nav.push(DialogPage);

		p.title = "Event Details"
		p.addLabel('Title',event.title);
		if (this.onAddressLabelClicked)
		p.addLink('Location', event.location, { click: ()=>{
			this.onAddressLabelClicked(event);			
		}});
		
		p.addLabel('From', DateTime.toHumanDateTime(event.startDate));
		p.addLabel('To', DateTime.toHumanDateTime(event.endDate));
		p.addLabel('Notes',event.message);
				
		if (!this.appraisalEvent && event.internalEventInfo) {
			p.buttons = {
				'View Order': ()=> {this.onViewOrderButtonClicked(event)},
				'Close':null
			}
		} else {
			p.buttons = {
				'Edit': this.appraisalEvent ?  undefined : ()=>this.editEvent(event),
				'Close':null
			}
		}
	}

	/**
	 * ***Override***
	 * @param {Calendar2Event} event 
	 */
	onViewOrderButtonClicked(event){

	}

	onEditEventClicked(event){
		if (this.appraisalEvent) {
			return;
		}
		this.editEvent(event);
	}

	/**
	 * 
	 * @param {Calendar2Event} event 
	 */
	editEvent(event){
		var p = this.Nav.push(DialogPage);

		var appraisalEvent = null
		if (this.appraisalEvent) {
			appraisalEvent = Objects.copy(this.appraisalEvent);
		}

		var unscheduledEvent = (evt)=>{
			//p.controls.push({name: "contactButton", type: "button", title:null, value:"Contact"});
			if (this.onViewContactDetailsLabelClicked)
			p.addLink('Contact', "View contact details",{ click: ()=>{
				this.onViewContactDetailsLabelClicked(evt);			
			}});
			p.addInput('location','Location','text', evt.location,null, {readonly:true});
			p.addInput('startDate','From','date-time', event.startDate ? moment(event.startDate).toDate() : null, true);
			p.addInput('endDate','To','date-time',  event.endDate ? moment(event.endDate).toDate() : null, 'required');
			p.addTextArea('message','Notes', evt.message);
		}
		var genericEvent = () => {
			p.addInput('title','Title','text', event.title, true);
			p.addInput('location','Location','text', event.location);
				
			p.addInput('startDate','From','date-time', event.startDate ? moment(event.startDate).toDate() : null, true);
			p.addInput('endDate','To','date-time',  event.endDate ? moment(event.endDate).toDate() : null, 'required');
			
			p.addTextArea('message','Notes', event.message);
			
		}

		if (!appraisalEvent) {
			if (!event.id) {
				p.title = "New Event Details"
				var items = [
					{title: "Select Order", value: 0},
				]

				Objects.forEach(this.unscheduledEvents,(evt, i)=>{
					if (evt) {
						items.push({ title: evt.title, placeholder: evt.location, value: parseInt(i)+1});
					}
				});

				if (items.length > 1) {
					p.addSelect('eventType','Appointment for', null, false, items, {change: (ev)=>{
						p.removeField('title');
						p.removeField('location');
						p.removeField('startDate');
						p.removeField('endDate');
						p.removeField('message');
						
						if (p.data.eventType !== "0") {
							p.title = Translate("Set Appointment");
							var evt = this.unscheduledEvents[p.data.eventType-1]
							unscheduledEvent(evt);
							this.onCreateAppraisalEventSelected(evt);
							appraisalEvent = evt;
							p.data.location = evt.location;

							if (!appraisalEvent.startDate) {
								appraisalEvent.startDate = moment();
								appraisalEvent.endDate = moment();
							}
						} else {
							genericEvent();
							appraisalEvent = null;
						}
					}});
				} else {
					p.addLabel('Appointment for', 'No Orders pending appointment');
				}
			}
			genericEvent();
		} else {
			p.title = Translate("Set Appointment")  + " #" + appraisalEvent.internalEventInfo.id ;
			p.data.title = appraisalEvent.title
			p.data.message = appraisalEvent.message
			p.data.location = appraisalEvent.location
			p.data.internalEventInfo = appraisalEvent.internalEventInfo
			unscheduledEvent(event);
		}
		var addEvent;
		p.buttons = {
			'Cancel':null,
			'Save':()=>{
				if (p.data.endDate < p.data.startDate) {
					p.errors.endDate = "To date must be later than From";
					return false;
				}

				if (p.validate()) {
					/** @type {Calendar2Event} */
					addEvent = {
						id: null,
						title: p.data.title,
						startDate: moment(p.data.startDate).toDate(),
						endDate: moment(p.data.endDate).toDate(),
						allday: false,
						message: p.data.message,
						location: p.data.location,
						internalEventInfo: null
					}

					if (appraisalEvent) {
						//transfer the constant appraisalEvent properties
						addEvent.title = appraisalEvent.title;
						//addEvent.message = appraisalEvent.message;
						addEvent.internalEventInfo = appraisalEvent.internalEventInfo;

						this.onAppraisalEventSaveClicked( addEvent, (orderDetails)=>{
							
							var resolve = ()=>{
								deleteEventFromUnscheduled(appraisalEvent.title, undefined, this.unscheduledEvents);
								window.plugins.calendar.createEvent(
									addEvent.title, addEvent.location,addEvent.message, addEvent.startDate, addEvent.endDate,
									()=>{
										onEventAdded.bind(this)();
										if (this.onAppraisalEventAdded(orderDetails) !== false) {
											this.destroy();
										}
									},
									onEventAddError.bind(this)
								);
							};

							window.plugins.calendar.deleteEvent(appraisalEvent.title, null, null , DateTime.moment(appraisalEvent.startDate).clone().subtract(6, 'months').toDate(), DateTime.moment(appraisalEvent.startDate).clone().add(6, 'months').toDate(),
								resolve.bind(this),resolve.bind(this)
							);
						})
					} else if (event.id) {
						var resolve = ()=>{
							window.plugins.calendar.createEvent(
								addEvent.title, addEvent.location, addEvent.message, addEvent.startDate, addEvent.endDate,
								onEventAdded.bind(this),
								onEventAddError.bind(this)
							);
						};
						window.plugins.calendar.deleteEventById(event.id, null, resolve.bind(this), resolve.bind(this) );
					} else {
						window.plugins.calendar.createEvent(
							addEvent.title, addEvent.location, addEvent.message, addEvent.startDate, addEvent.endDate,
							onEventAdded.bind(this),
							onEventAddError.bind(this)
						)
					}	
					return true;
				}	
				return false;
			}
		} 

		function onEventAdded(){
			this._getCalendarEvents();
			/*window.plugins.calendar.findEvent(addEvent.title,addEvent.location, addEvent.message, addEvent.startDate, addEvent.endDate,(list)=>{
				if (list && list.length>0){
					Objects.overwrite(event, parseNativeCalendarEvent(list[0]));
					if (appraisalEvent){
						event.internalEventInfo = appraisalEvent.internalEventInfo;
					}
					this._getCalendarEvents();
				}
				
			},(err)=>{
				console.log(err);
			})*/
		}
		function onEventAddError(data){
			this._getCalendarEvents();
			if (this.appraisalEvent) {
				this.onAppraisalEventError(event)
			}
		}
	} 

	/**
	 * 
	 * @param {moment.Moment} [startDate]
	 */
	createBlankEvent(startDate){
		this._currDate.startOf( 'minute' ); 

		/** @type {Calendar2Event} */
		var blank ={
			id:null,
			title:"",
			location:"",
			startDate: startDate ? startDate : this._currDate.clone(),
			endDate: startDate ? startDate.clone().add(1, 'hour') : this._currDate.clone().add(1, 'h'),
			allday:null,
			message:"",
			internalEventInfo:null
		}

		if (this.appraisalEvent) {
			blank = Objects.copy(this.appraisalEvent);
			blank.startDate= startDate ? startDate : this._currDate.clone();
			blank.endDate=startDate ? startDate.clone().add(1, 'hour') : this._currDate.clone().add(1, 'h');
		}

		this.editEvent(blank);
	}

	/**
	 * Create Appraisal Event Flow
	 * @param {Calendar2Event} event 
	 */
	createAppraisalEvent(event){
		this.setDate(event.startDate);
		this.title = Translate("Set Appointment") + " #" + event.internalEventInfo.id ;
		this.appraisalEvent = event;
	}

	/**
	 * Create Appraisal Event Flow
	 * @param {Calendar2Event} appraisalEvent
	 */
	removeAppraisalEvent(appraisalEvent){
		var resolve = ()=>{
			//deleteEventFromDaySlots(appraisalEvent.title, null, this.dayEventSlots);
			this._getCalendarEvents();
		}
		window.plugins.calendar.deleteEvent(appraisalEvent.title, null, null , appraisalEvent.startDate.clone().subtract(6, 'months').toDate(), appraisalEvent.startDate.clone().add(6, 'months').toDate(),
			resolve.bind(this),resolve.bind(this)
		);
	}

	/**
	 * ***Override***
	 * Notify Appraisal Event is selected when creating event
	 * @param {Calendar2Event} event 
	 */
	onCreateAppraisalEventSelected(event){

	}


	/**
	 * ***Override***
	 * Notify Appraisal Event is ready to be added to calendar
	 * @param {Calendar2Event} event 
	 */
	onAppraisalEventSaveClicked(event, callback){

	}

	/**
	 * ***Override***
	 * Notify Appraisal Event Added
	 * @param {Calendar2Event} event 
	 * @return {boolean|void}
	 */
	onAppraisalEventAdded(event){
		return false;
	}

	/**
	* ***Override***
	* Callback on Address label clicked
	* @param {Calendar2Event} event  
   	*/ 
	onAddressLabelClicked(event){

	}

	/**
	* ***Override***
	* Callback on Contact Details label clicked
	* @param {Calendar2Event} event 
   	*/
	onViewContactDetailsLabelClicked(event){

	}

	/**
	 * ***Override***
	 * Notify Appraisal Event Did not Add successfully
	 * @param {Calendar2Event} event 
	 */

	onAppraisalEventError(event){

	}

	_onCalendarMonthClicked(){
		var p = this.Nav.push(OptionsDialogPage);
		p.icons=null;
		p.items= Objects.copy(this._months);
		p.buttons=null;
		p.isSelectedItem = (item)=>{
			return item.value == this._currMonth.format('M'); 
		}
		p.onItemClicked=(item)=>{
			this.setMonth(item.value);
		}
	}
	_onCalendarYearClicked(){
		var p = this.Nav.push(OptionsDialogPage);
		p.icons=null;
		p.items= Objects.copy(this._years);
		p.buttons=null;
		p.isSelectedItem = (item)=>{
			return item.value == this._currMonth.format('YYYY'); 
		}
		p.onItemClicked=(item)=>{
			this.setYear(item.value);
		}

	}

	_onMonthSwipeStart(ev){
		console.log("touchStart!");
		this.swipe = Touch(ev);
		this.swipe.onSwipe = (direction)=>{
			if (direction == Touch.LEFT) {
				this._onNextMonthClicked();
			}
			if (direction == Touch.RIGHT) {
				this._onPrevMonthClicked();
			}
		}
	}

	_onDaySwipeStart(ev){
		console.log("touchStart!");
		Touch(ev).onSwipe = (direction)=>{
			if (direction == Touch.LEFT) {
				this._onNextDayClicked();
			}
			if (direction == Touch.RIGHT) {
				this._onPrevDayClicked();
			}
		}
	}

	_onDayEventsHourClicked(hour){
		this._currDate.set( 'hour', hour ); 
		this._currDate.set( 'minute', 0 ); 
		this._currDate.startOf( 'minute' ); 
		this._setProps();
		this.createBlankEvent(this._currDate);
	}
}

/**
 * 
 * @param {*} el 
 * @returns {Calendar2Event}
 */
function parseNativeCalendarEvent(el){
	var evt = {
		id: el.id,
		startDate: null,
		endDate: null,
		title: el.title,
		location: el.location,
		allday:false,
		message: el.message,
		internalEventInfo: el.internalEventInfo
	}

	if (!el.allday) {
		evt.startDate = DateTime.moment(el.startDate);
		evt.endDate = DateTime.moment(el.endDate);
	} else {
		var diff = DateTime.moment(el.startDate).diff( DateTime.moment.utc(el.startDate),'hours');
		evt.startDate = DateTime.moment(el.startDate).add(diff, 'hour');
		evt.endDate = DateTime.moment(el.endDate).add(diff, 'hour');
	}

	if (DateTime.moment(el.endDate).diff( DateTime.moment(el.startDate),'hours')>=24) {
		evt.allday = true;
	}
	return evt;
}

/**
 * 
 * @param {moment.Moment} mom_date 
 */
function getDayNumber(mom_date){
	return mom_date.diff( moment("1900-1-1","YYYY-MM-D"), 'day');
}

function eventSortCallback(a, b){
	return a.startDate - b.startDate !== 0 ? a.startDate - b.startDate : a.endDate - b.endDate;
}
/**
 * 
 * @param {Calendar2Event} el 
 * @param {Calendar2DaySlots} yBusySlots 
 */
function populateDayEventSlots(el, yBusySlots){
	var ev_st = moment(el.startDate);
	var ev_end = moment(el.endDate).subtract(1,'second');
	
	var ev_d_st = getDayNumber(ev_st);
	var ev_d_end = getDayNumber(ev_end);

	if (el.title=='Test allday 3') {
		console.log(el);
	}

	//find next available slot for THIS day
	var slot = 0;
	var overlapShift = 0;
	var totalOverlaps = 0;
	var overlaps = 0;
	var minOverlapShift = 0;
	
	var touched = [];
	Objects.forEach(yBusySlots[ev_d_st], function(eli,i) {
		//if event being added is already added as internal
		if (eli && eli.internalEventInfo && eli.title == el.title && eli.startDate.isSame(el.startDate)) {
			return false;
		}

		if (el.startDate >= eli.startDate && el.startDate < eli.endDate && !eli.allday) {
			overlaps++;
		}
	});
	var maxOverlaps = 0;
	Objects.forEach(yBusySlots[ev_d_st], function(eli,i) {
		//if event being added is already added as internal
		if (eli && eli.internalEventInfo && eli.title == el.title && eli.startDate.isSame(el.startDate)) {
			el.internalEventInfo = eli.internalEventInfo;
			slot = i;
			return false;
		}
		
		if (eli && i >= slot) {
			slot = parseInt(i)+1;
		}

		if (el.startDate >= eli.startDate && el.startDate < eli.endDate && !eli.allday) {
			if (minOverlapShift < eli.overlapShift){
				minOverlapShift = eli.overlapShift;
			}
			if (maxOverlaps < eli.overlaps) {
				maxOverlaps = eli.overlaps;
			}
			if (overlaps > eli.overlapShift) { 
				touched.push(eli);
				overlapShift ++;
				totalOverlaps ++;
			} else {
				overlapShift = Math.min(0, minOverlapShift-1);
				totalOverlaps = eli.overlaps;
			}
		}
	});
	totalOverlaps = Math.max(totalOverlaps, maxOverlaps);
	Objects.forEach(touched, function(eli){
		//set all touched events overlaps count to the total overlap
		eli.overlaps = totalOverlaps;
	});
	
	el.overlaps = totalOverlaps;
	el.overlapShift = overlapShift;

	if (!yBusySlots[ev_d_st]) {
		yBusySlots[ev_d_st] = {};
	}
	el.title =el.title || '(Event)';	
	//same day event
	if (ev_d_st == ev_d_end) {
		yBusySlots[ev_d_st][slot] = el;
	} else {
		//event covers several days
		for (var day_i = ev_d_st; day_i <= ev_d_end; day_i++) {
			//mark the same slot busy for the rest of the event days
			if (!yBusySlots[day_i]) {
				yBusySlots[day_i] = {};
			}

			yBusySlots[day_i][slot] = el;
		}
	}
}

/**
 * @param {string} title
 * @param {string} message
 * 
 * @param {Calendar2Event[]} events 
 */
function deleteEventFromUnscheduled(title, message, events){
	Objects.forEach(events, function(event,i){
		if (event && event.title == title && (empty(message) || message == event.message)) {
			delete events[i];
		}
	})
}

Calendar2Page.selector = "page-Calendar2Page";
var template = `
	<div [directive] = "this._tabs" class="tabs-container">
		<ul class="tab-buttons">
			<li for="month">{{ Translate('Month') }}</li>
			<li for="day">{{ Translate('Day') }}</li>
		</ul>
		<div class="tabs">
			<div id="month">
				<div class="month-buttons">
					<button onclick="this._onPrevMonthClicked()">
						<i class="fas fa-chevron-left"></i>
					</button>
					<div>
						<button bind="this._d_monthName" onclick="this._onCalendarMonthClicked()"></button>
						<button bind="this._d_year" onclick="this._onCalendarYearClicked()"></button>
					</div>	
					<button onclick="this._onNextMonthClicked()">
						<i class="fas fa-chevron-right"></i>
					</button>	
				</div>
				<div class="calendar">
					<table  ontouchstart="this._onMonthSwipeStart($event)" [transition]="{trigger: this.monthSlideTrigger,duration:300, enter: this.ingoingSlideClass, leave_to: this.outgoingSlideClass }" >
						<thead>
							<tr>
								<td [foreach] = "dayN in this._weekDayNames as day">
									<b bind="day"></b>
								</td>
							</tr>
						</thead>
						<tbody>
							<tr [if] = "this._weeks.length == 0">
								<!-- Display empty row so it is possible to measure the height of the tbody before weeks have been rendered -->
							</tr>
							<tr [foreach] = "this._weeks as weekN">
								<td [foreach] = "this._weekDays(weekN) as day" [selected]="day.selected" [class]="day.class"  onclick="this._onCalendarDateClicked(day.date)">
									<div class="date"><b [if] = "day.extraEvents">+{{ day.extraEvents }}</b>{{ day.day }}</div>
									<div class="slots">
										<div [foreach]="day.events as apt" class="apt" [class]="apt.class">{{apt.title}}</div>
									</div>
									<div class="frame"></div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>	
			<div id="day">
				<div class="month-buttons">
					<button onclick="this._onPrevDayClicked()">
						<i class="fas fa-chevron-left"></i>
					</button>
					<div>
						<button bind="this._d_monthName" onclick="this._onCalendarMonthClicked()"></button>
						<button bind="this._d_day" onclick="this._onMonthDayClicked()"></button>
					</div>	
					<button onclick="this._onNextDayClicked()">
						<i class="fas fa-chevron-right"></i>
					</button>	
				</div>
				<div class="allday-events" [foreach] = "this._allDayEvents() as apt">
					<div class="event" [class]="apt.class" onclick="this.viewEvent(apt.event)">{{apt.event.title}}</div>
				</div>
				<div class = "day-slides-wrapper fill">	
					<div class="day-events scroll" ontouchstart="this._onDaySwipeStart($event)" [transition]="{trigger: this.daySlideTrigger,duration:300, enter:this.ingoingSlideClass, leave_to: this.outgoingSlideClass }" >
						<table>
							<tbody>
								<tr [foreach] = "this._24hours as hour" onclick="this._onDayEventsHourClicked(hour.value)">
									<td width="50px" class="hourColumn"><span>{{ hour.title }}</span> <span class="amLabel">{{ hour.amLabel }}</span></td>
									<td class="eventColumn">
										<div class="slots">
											<div [foreach]="this._hourEvents(hour.value) as apt" onclick="this.viewEvent(apt.event); $event.stopPropagation()" class="event" [class]="apt.class" [style]="{top:apt.minuteOffset+'px',height:apt.minuteLength+'px',left:apt.overlapOffset+'%',width:apt.overlapLength+'%'}">
												{{apt.event.title}}<br>
												{{ this.toHumanTime(apt.event.startDate) }} - {{ this.toHumanTime(apt.event.endDate) }}<br>
												{{apt.event.location}}<br>
											</div>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>	
		</div>
		<div ion-fab bottom right round>
			<button default onclick="this.createBlankEvent();"><i class="fas fa-plus"></i></button>
		</div>
	</div>
`;