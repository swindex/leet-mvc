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

		this.template=`<select-multiple class="select" onclick="this.onClick($event)">
			<div style="margin-right:1em; overflow-x:auto;">
				<span style="white-space:nowrap;display: inline-block;">{{ this.getDisplayText() }}</span>
			</div>	
		</select-multiple>`;
	}

	onClick(){
		var p = Injector.Nav.push(OptionsDialogPage);
		p.title = this.placeholder;
		p.multiple = true;

		//convert select field items to 
		p.items = Objects.map(this.items,el => { return {
			value: el.value,
			title: el.title,
			text: el.placeholder,
			selected: this.value.indexOf(el.value) >=0
		}});
		
		p.onOkClicked = (items)=>{
			var valArray = [];
			Objects.forEach(items, el => {if (el.selected) valArray.push(el.value); } )
			this.value = valArray;

			this.onChange({target:this});
		}		
	}

	/**
	 * ***Override***
	 * @param {*} ev 
	 */
	onChange(ev){

	}

	getDisplayText(){
		var d = [];
		if (!isArray(this.value))
			this.value=[];
		Objects.forEach(this.items, el => {if (this.value.indexOf(el.value)>=0) d.push(el.title);});

		if (d.length==0){
			return this.placeholder || this.attributes.placeholder;
		}

		return d.join(', ');
	}

}