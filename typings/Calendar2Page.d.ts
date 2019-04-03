interface Calendar2Event{
	id: string|number;
	startDate: moment.Moment,
	endDate: moment.Moment,
	title:string,
	location:string,
	allday:boolean
	message:string;
	internalEventInfo: {
		schema_name: string,
		id: number,
	};
	overlapShift?:number;
	overlaps?:number;
}
interface Calendar2DaySlots{
	[dayOfYear:string]:{
		[slot:string]:Calendar2Event
	}
}