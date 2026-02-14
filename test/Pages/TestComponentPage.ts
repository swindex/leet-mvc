// @ts-nocheck
import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
import { BaseComponent } from '../../components/BaseComponent';
import { DOM } from "../../core/DOM";
import { Binder } from '../../core/binder/Binder';
import { Watcher } from "../../core/Watcher";


export class TestComponentPage extends HeaderPage {
  counter: number;
  comp: any;

  constructor(){
    super();
    this.counter = 0

    this.comp = null;
  }

  onCreateCompClicked(){

    var el = DOM(this.page).find("#placeholder").first();


    var c = new TestComponenet();

    
    //mount componenet on to dom
    c.binder = new Binder(c).bindElements({}, c.template);
    c._onInit(el);

    el.append(c.binder.vdom.elem);


    Watcher.on(this, (target: any, prop: string, val: any)=>{
      if (prop=="counter"){
        c.counter = val;
      }
    })

    this.comp = c;

  }

  onIncrementClicked(){
    this.counter ++;
  }


  get template(){
    return super.extendTemplate(super.template, `
    <div>
      <button onclick="this.onCreateCompClicked();">Create</button>
      <button onclick="this.onIncrementClicked();">Increment</button>
      </div>
    <div id="placeholder">Old content</div>
    `);
  }
}

class TestComponenet extends BaseComponent{
  counter: number;
  template: string;

  constructor(){
    super();
    this.counter = 0;

    this.template = + `<div><button onclick="this.counter++">I am Alive! {{ this.counter }}</button></div>`

    console.log(/*html*/`<br>`, `
     <div>vvv</div>
    `);

    console.log(/*html*/`
         <br>
    `, `<br>`) + `<br>` + [`<br>`]

    var s = [/*html*/`<br>`]

    var aa = `ssssss`

  }

}