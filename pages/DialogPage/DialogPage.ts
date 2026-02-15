import { BasePage } from "../BasePage";
import template from './DialogPage.html';
import './DialogPage.scss';
import { isString, tryCall } from "../../core/helpers";
import { Forms } from "../../components/Forms";
import { Injector } from "../../core/Injector";
import { BaseComponent } from "../../components/BaseComponent";
import { FieldData, FieldTemplate, KeyValuePair, SelectOption } from "../../typings/FormTypes";

/**
 * Create an instance of the dialog page
 * @param {string} title 
 * @param {'flexible'|'large'} [popupStyle]
 */
export function Dialog(title: string, popupStyle = "flexible" ): DialogPage{
  var d = Injector.Nav.push(DialogPage);
  d.title = title;
  d.classNames.push(popupStyle)
  return d as DialogPage;
}

export class DialogPage extends BasePage{
  controls: FieldTemplate[]=[];  
  data:KeyValuePair = {};
  errors:KeyValuePair = {};
  buttons:KeyValuePair = {};

  constructor(title?: string){
    super();
    this.title= title;
    this.prompt= null;
    this.dialog_content_max_height = "100%";




    this.close_on_click_outside = true;

    /** @type {Forms} */
    this.content= new Forms(this.controls,this.data,this.errors);
  }

  onResize(windowSize:{width: number;height: number;}){
    super.onResize(windowSize);
    var h = this.page!.offsetHeight - 150;
    this.dialog_content_max_height = h+"px";
  }

  onButtonClicked(button_title: string){
    if (tryCall(this, this.buttons[button_title], this) != false)
      this.destroy();
  }

  onClickedOutside() {
    if (this.close_on_click_outside)
      this.destroy();
  }

  render(){
    if (this.content && typeof this.content.updateTemplate === 'function') {
      this.content.updateTemplate(this.controls);
    }
  }

  showHTML(){
    return typeof this.content === 'string';
  }

  showComponent(){
    return this.content instanceof BaseComponent;
  }

  addField(fieldTemplate:FieldTemplate, value: any) {
    this.controls.push(fieldTemplate);
    this.data[fieldTemplate.name!] = value;
    this.render();
		
    return this;	
  }

  addCheck(name:string, title:string, value:boolean, required:string|boolean, attrs?:FieldData) {
    var valRule = (isString(required) ? required : (required ? "required" : null));
    this.controls.push({name: name, type:'checkbox', title:title, validateRule: valRule, attributes:attrs});
    this.data[name] = value;
    this.render();
    return this;
			
  }

  addSelect(name: string, title: string, value: string, required:string|boolean, items:SelectOption[], attrs?:FieldData) {
    var valRule = (isString(required) ? required : (required ? "required" : null));
    this.controls.push({name: name, type: "select", title: title, validateRule: valRule, items: items, attributes:attrs});
    this.data[name] = value;
    this.render();
		
    return this;	
  }

  addRadio(name:string, title:string, value:string, required:string|boolean, items:SelectOption[], attrs?:FieldData) {
    var valRule = (isString(required) ? required : (required ? "required" : null));
    this.controls.push({name: name, type: "radio", title: title, validateRule: valRule, items: items, attributes:attrs});
    this.data[name] = value;
    this.render();
		
    return this;	
  }
	
  addInput(name: string, title: string, type: string, value: any, required: string|boolean, attrs?: FieldData) {
    var valRule = (isString(required) ? required : (required ? "required" : null));
    this.controls.push({name: name, type: type, title:title, validateRule: valRule, attributes:attrs});
    this.data[name] = value;
    this.render();
		
    return this;	
  }

  addDate(name: string, title: string, value: any, required: string|boolean, attrs?: FieldData) {
    var valRule = (isString(required) ? required : (required ? "required" : null));
    this.controls.push({name: name, type: "date", title:title, validateRule: valRule, attributes:attrs});
    this.data[name] = value;
    this.render();
		
    return this;	
  }

  addDateTime(name: string, title: string, value: any, required: string|boolean, attrs?: FieldData) {
    var valRule = (isString(required) ? required : (required ? "required" : null));
    this.controls.push({name: name, type: "datetime", title:title, validateRule: valRule, attributes:attrs});
    this.data[name] = value;
    this.render();
		
    return this;	
  }

  addTime(name: string, title: string, value: any, required: string|boolean, attrs?: FieldData) {
    var valRule = (isString(required) ? required : (required ? "required" : null));
    this.controls.push({name: name, type: "time", title:title, validateRule: valRule, attributes:attrs});
    this.data[name] = value;
    this.render();
		
    return this;	
  }

  addTextArea(name: string, title: string, value: any, required: string|boolean, attrs?: FieldData) {
    var valRule = (isString(required) ? required : (required ? "required" : null));
    this.controls.push({name: name, type: "textarea", title:title, validateRule: valRule, attributes:attrs});
    this.data[name] = value;
    this.render();
		
    return this;	
  }

  addText (name: string, title: string, value: any, required: string|boolean, attrs?: FieldData) {
    return this.addInput(name, title,"text", value, required, attrs);
  }

  addLabel (title: string, value: any, attrs?: FieldData) {
    this.controls.push({type:'label', title:title, value:value, attributes:attrs});
    this.render();
		
    return this;
  }
  addLink (name: string, title: string, value: any, attrs?: FieldData) {
    this.controls.push({type:'link', name:name, title:title, value:value, attributes:attrs});
    this.render();
		
    return this;
  }

  addPassword (name: string, title: string, value: any, required: string|boolean, attrs?: FieldData) {
    return this.addInput(name, title,"password", value, required, attrs);
  }


  removeField(name: string){
    this.controls = this.controls.filter(el => el.name != name);

    if (this.data[name])
      delete this.data[name];

    this.render();
  }
	
  addHtml (value: any, attrs?: FieldData) {
    this.controls.push({type:'html',value:value, attributes:attrs});
    this.render();
		
    return this;
  }

	
  addSplit (items: any[]) {
    this.controls.push({name:"split", type:'split', title:null, value:null, items: items});
    this.render();
		
    return this;
  }

  /**
	 * Validate the content form
	 */
  validate(){
    if (this.content instanceof Forms)
      return this.content.validator.validate();
  }

  /**
	 * Add Action Button to the dialog
	 * @param {string} title
	 * @param {null|function(DialogPage):any} callback - fired when button is clicked. Return false to stop dialog from closing
	 */
  addActionButton(title: string, callback: ((dialog: DialogPage) => any) | null) {
    callback = callback || null;
    this.buttons[title] = callback;
    return this;
  }

  get template(){
    return this.extendTemplate(super.template, template);
  }
}
DialogPage.className = 'page-DialogPage';
DialogPage.visibleParent = true;