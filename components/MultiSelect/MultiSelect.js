import { BaseComponent } from "../../components/BaseComponent";
import { Objects } from "../../core/Objects";
import { OptionsDialogPage } from "../../pages/OptionsDialogPage/OptionsDialogPage";
import { Injector } from "../../core/Injector";
import { isArray } from "util";

export class MultiSelect extends BaseComponent {

	constructor(){
		super();

		this.name = ""
		this.value = [];
		this.items = [];
		this.placeholder = "";

		this.html=`<select-multiple class="select" onclick="this.onClick($event)">
			<div style="margin-right:1em; overflow-x:auto;">
				<span style="white-space:nowrap;">{{ this.getDisplayText() }}</span>
			</div>	
		</select-multiple>`;
	}

	onClick(){
		var p = Injector.Nav.push(OptionsDialogPage);
		p.title = this.placeholder;
		p.multiple = true;

		//p.isSelectedItem = item => item.value === el.value;
		//elementitems belongs to FORMS and changes to its will not reflect on the dialog page
		//So we must make a copy
		p.items = Objects.copy(this.items);
		
		if (isArray(this.value)){
			Objects.forEach(p.items, el => { 
				if (this.value.indexOf(el.value)>=0 ){
					el.selected=true;
				}
			});
		}
		p.onOkClicked = (items)=>{
			var valArray = [];
			Objects.forEach(items, el => {if (el.selected) valArray.push(el.value); } )
			this.value = valArray;
			
			//this.container.value = this.value;
			//this.container[0].dispatchEvent(new Event('change'));
			//var ev = new Event('change');
			//ev.target = this;
			


			this.onChange({target:this});
		}		
	}

	onChange(ev){

	}

	getDisplayText(){
		var d = [];
		if (!isArray(this.value))
			this.value=[];
		Objects.forEach(this.items, el => {if (this.value.indexOf(el.value)>=0) d.push(el.title);});

		if (d.length==0){
			return this.placeholder;
		}

		return d.join(', ');
	}

}