import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
import { BaseComponent } from '../../components/BaseComponent';

export class TestComponentPage extends HeaderPage {
  constructor(){
    super();
    this.counter = 0
  }

  onCreateCompClicked(){


    var c = new TestComponenet();

    var el = this.page.querySelector("#placeholder");

    c._onInit(el);

    c.onInit(el);

    c.update();


  }

  onIncrementClicked(){
    this.counter ++;
  }


  get template(){
    return super.extendTemplate(super.template, `
    <div><button onclick="this.onCreateCompClicked();">Create</button> <button onclick="this.onIncrementClicked();">Increment</button></div>
      <div id="#placeholder">Old content</div>
    `);
  }
}

class TestComponenet extends BaseComponent{
  constructor(){
    super();
    this.counter = 0
  }
  get template(){
    return `<div>I am Alive! {{ this.counter }}</div>`
  }
}