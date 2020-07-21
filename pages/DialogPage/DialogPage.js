import { BasePage } from "../BasePage";
// @ts-ignore
import * as template from './DialogPage.html';
import './DialogPage.scss';
import { tryCall } from "../../core/helpers";
import { isString } from "util";
import { Forms } from "../../components/Forms";
import { Injector } from "../../core/Injector";
import { NavController } from "../../core/NavController";
import { Objects } from "../../core/Objects";

/**
 * Create an instance of the dialog page
 * @param {string} title 
 */
export function Dialog(title){
  /** @type {NavController} */
  var nav = Injector.Nav;
  var d = nav.push(DialogPage);
  d.title = title;
  return d;
}

export class DialogPage extends BasePage{
  constructor(title){
    super();
    /** @type {KeyValuePair} */
    this.buttons = {};
    this.title= title;
    this.prompt= null;
    this.dialog_content_max_height = "100%";
    /** @type {FieldTemplate[]} */
    this.controls=[];
    this.data = {};
    this.errors={};

    /** @type {Forms} */
    this.content= new Forms(this.controls,this.data,this.errors);
  }

  onResize(windowSize){
    super.onResize(windowSize);
    var h = this.page.offsetHeight - 150;
    this.dialog_content_max_height = h+"px";
  }

  onButtonClicked(button_title){
    if (tryCall(this, this.buttons[button_title], this) != false)
      this.destroy();
  }

  render(){
    this.content.updateTemplate(this.controls);
  }

  addCheck(name, title, value, required, attrs = null) {
    var valRule = (isString(required) ? required : (required ? "required" : null));
    this.controls.push({name: name, type:'checkbox', title:title, validateRule: valRule, attributes:attrs});
    this.data[name] = value;
    this.render();
    return this;
			
  }

  addSelect(name, title, value, required, items, attrs=null) {
    var valRule = (isString(required) ? required : (required ? "required" : null));
    this.controls.push({name: name, type: "select", title: title, validateRule: valRule, items: items, attributes:attrs});
    this.data[name] = value;
    this.render();
		
    return this;	
  }
	
  addInput(name, title, type, value, required, attrs=null) {
    var valRule = (isString(required) ? required : (required ? "required" : null));
    this.controls.push({name: name, type: type, title:title, validateRule: valRule, attributes:attrs});
    this.data[name] = value;
    this.render();
		
    return this;	
  }

  addDate(name, title, value, required, attrs=null) {
    var valRule = (isString(required) ? required : (required ? "required" : null));
    this.controls.push({name: name, type: "date", title:title, validateRule: valRule, attributes:attrs});
    this.data[name] = value;
    this.render();
		
    return this;	
  }

  addDateTime(name, title, value, required, attrs = null) {
    var valRule = (isString(required) ? required : (required ? "required" : null));
    this.controls.push({name: name, type: "datetime", title:title, validateRule: valRule, attributes:attrs});
    this.data[name] = value;
    this.render();
		
    return this;	
  }

  addTime(name, title, value, required, attrs = null) {
    var valRule = (isString(required) ? required : (required ? "required" : null));
    this.controls.push({name: name, type: "time", title:title, validateRule: valRule, attributes:attrs});
    this.data[name] = value;
    this.render();
		
    return this;	
  }

  addTextArea(name, title, value, required, attrs = null) {
    var valRule = (isString(required) ? required : (required ? "required" : null));
    this.controls.push({name: name, type: "textarea", title:title, validateRule: valRule, attributes:attrs});
    this.data[name] = value;
    this.render();
		
    return this;	
  }

  addText (name, title, value, required, attrs = null) {
    return this.addInput(name, title,"text", value, required, attrs);
  }

  addLabel (title, value, attrs = null) {
    this.controls.push({type:'label', title:title, value:value, attributes:attrs});
    this.render();
		
    return this;
  }
  addLink (name, title, value, attrs = null) {
    this.controls.push({type:'link', name:name, title:title, value:value, attributes:attrs});
    this.render();
		
    return this;
  }

  addPassword (name, title, value, required, attrs = null) {
    return this.addInput(name, title,"password", value, required, attrs);
  }


  removeField(name){
    this.controls = Objects.filter(this.controls, el => el.name != name );

    if (this.data[name])
      delete this.data[name];

    this.render();
  }
	
  addHtml (value, attrs = null) {
    this.controls.push({type:'html',value:value, attributes:attrs});
    this.render();
		
    return this;
  }

	
  addSplit (items) {
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
	 * @param {function(DialogPage)} callback - fired when button is clicked. Return false to stop dialog from closing
	 */
  addActionButton(title, callback) {
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