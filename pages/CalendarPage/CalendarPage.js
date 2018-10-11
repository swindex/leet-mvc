import MaterialDateTimePicker from 'material-datetime-picker/lib/js/index';
import { BasePage } from './../BasePage';
import './CalendarPage.scss'


export class CalendarPage extends BasePage{
	constructor(page, date){
		super(page)
		this.date = date;
	}
	init(){
		const picker = new MaterialDateTimePicker({
			container: this.page[0],
			default: this.date ? this.date : new Date
		});
		picker.on('submit', (val) => {
		  //input.value = val.format("DD/MM/YYYY");
			if (this.onDateTimeSelected(val.toDate())!==false)
				this.destroy();
		});
		picker.on('close', (val) => {
			this.destroy();
		});
		picker.open();
	}
	onDateTimeSelected(value){
		return true;
	}
}
CalendarPage.template='';
CalendarPage.selector = 'page-calendar';
CalendarPage.visibleParent = true;