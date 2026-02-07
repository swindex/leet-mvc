// @ts-nocheck
import { Forms } from "../../components/Forms";
import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";

export class TestArrayPage extends HeaderPage {
	arr: any[];
	objarr: any[];
	findex: number;
	formarr: Forms[];
	objobj: Record<string, any>;

	constructor(){
		super();

		this.arr=[];

		this.objarr=[];

		this.findex= 0;

		this.formarr = [];

		this.objobj = {};
		
	}


	get template(){
		return this.extendTemplate(super.template, template);
	}

	onAddClicked(){
		this.arr.push(this.index++);
	}

	onDeleteItemClicked(index: number){
		this.arr.splice(index,1);
	}

	onAddFormClicked(){
		this.arr.push(this.findex);
		this.objarr.push({a: this.findex });
		this.objobj[this.findex] = {a: this.findex };
		this.formarr.push(new Forms([{
			type: "text", title:"Some field " + this.findex, name:"someName_"+this.findex++
		}]));
	}
	onDeleteFormItemClicked(index: number){
		this.arr.splice(index,1);
		this.objarr.splice(index,1);
		delete this.objobj[index];
		var f = this.formarr.splice(index,1)[0];
		//f.destroy();
	}

}

var template = `
<div class="fill scroll">
	<!-- <div>
		<button onclick = "this.onAddClicked()" class="btn btn-primary">Add Item</button>
	</div>

	<div [foreach] = "index in this.arr as item">
		{{index}} {{item}} <button onclick="this.onDeleteItemClicked(index)" class="btn btn-danger">X</button>
	</div> -->

	<div>
		<button onclick = "this.onAddFormClicked()" class="btn btn-primary">Add Form Item</button>
	</div>

	<div [foreach] = "index in this.formarr as item">
		<div [component]="item"></div>
		 <button onclick="this.onDeleteFormItemClicked(index)" class="btn btn-danger">X</button>
	</div>

	<div [foreach] = "index in this.objarr as item">
		{{item.a}} 
	</div>

	<div [foreach] = "index in this.objobj as item">
		{{item.a}} 
	</div>

	<div [foreach] = "index in this.arr as item">
		{{index}} {{item}}
	</div>

</div>

`