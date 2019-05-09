interface Calendar2Calendar{
	id: string,
	isPrimary?: boolean,
	isReadonly?: boolean,
	type?: string,
	name: string,
}

interface Calendar2Event{
	id: string|number;
	startDate: moment.Moment,
	endDate: moment.Moment,
	title:string,
	location:string,
	allday:boolean,
	calendarId:string,
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