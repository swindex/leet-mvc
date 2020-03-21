import { CalendarPage } from "../pages/CalendarPage/CalendarPage";
import { DateTime } from "./DateTime";
import { OptionsDialogPage } from "../pages/OptionsDialogPage/OptionsDialogPage";
import { Injector } from "./Injector";
import { RegisterComponent } from "./Register";
import { MultiSelect } from "./../components/MultiSelect/MultiSelect";
import { Forms } from "../components/Forms";
import { DOM } from "./DOM";

var Inject = Injector;

export function EnableCustomElements(){
	function preventFocus(ev){
		ev.preventDefault();
		/** @type {HTMLElement} */
		var evt  = ev.target;
		evt.blur();
		evt.classList.add('focus-blink');
		setTimeout(()=>{
			window.focus();
			
		},1);
		setTimeout(()=>{
			evt.classList.remove('focus-blink');
		},600);
	}

	//mobile IOS hack to make sure :active works on buttons					
	DOM(document).on('touchstart',function(ev){
		
	});

	//override default behavior of form elements					
	DOM(document).onChild('mousedown focus','input[readonly]', function(ev){
		preventFocus(ev)
	});

	DOM(document).onChild('mousedown focus','input[date]', function(ev){
		preventFocus(ev)
		/** @type {HTMLInputElement} */
		var el = ev.target;
		var date = DateTime.fromHumanDate(el.value.toString());
		var p = Inject.Nav.push(CalendarPage,date);
		p.showClock = false;
		p.onDateTimeSelected = (_date)=>{
			el.value=DateTime.toHumanDate(_date);
			el.dispatchEvent(new Event('change'));
			return true;
		}
	});
	DOM(document).onChild('mousedown focus','input[datetime]', function(ev){
		preventFocus(ev)
		var el = ev.target;
		var date = DateTime.fromHumanDateTime(el.value.toString());
		var p = Inject.Nav.push(CalendarPage,date);
		
		p.onDateTimeSelected = (_date)=>{
			el.value = DateTime.toHumanDateTime(_date);
			el.dispatchEvent(new Event('change'));
			return true;
		}
	});

	DOM(document).onChild('mousedown focus','input[time]', function(ev){
		preventFocus(ev)
		var el = ev.target;
		var date = DateTime.fromHumanTime(el.value.toString());
		var p = Inject.Nav.push(CalendarPage,date); 
		p.title = "Select time"
		//p.showClock = true;
		p.showCalendar = false;
		
		p.onDateTimeSelected = (_date)=>{
			el.value = (DateTime.toHumanTime(_date));
			el.dispatchEvent(new Event('change'));
			return true;
		}
	});

	//create select-multiple custom element
	RegisterComponent(MultiSelect, 'select-multiple');
	Forms.field_definitions["select-multiple"] = function(forms, el, parentPath){
		return forms.renderFieldGroupHTML(el, [
			`<select-multiple name="${el.name}"
				[(value)]= "${forms.refactorAttrName('this.data.' + el._name)}"
				placeholder="${el.placeholder}"
				[items] = "${forms.refactorAttrName('this.fields.' + el._name + '.items')}">
			</select-multiple>`
		]);
	},

	//Override the system select drop-down with custom drop-down
	DOM(document).onChild('mousedown focus','select', function(ev){
		preventFocus(ev)
		/** @type {HTMLSelectElement} */
		var el = ev.target;
		var p = Inject.Nav.push(OptionsDialogPage);
		p.title = el.getAttribute('placeholder');

		p.multiple = el.getAttribute('type')=="multiple";
		if (!p.multiple)
			p.icons = null;

		p.isSelectedItem = item => item.value === el.value;

		DOM(el).find('option').each(function(option){
			var value = option.getAttribute('value');
			var text = option.getAttribute('title');
			if (value !== null || !p.title){
				p.items.push({title: option.innerHTML, value: value, text: text})
			}
		})
		
		p.onItemClicked = (item)=>{
			el.value = item.value;
			el.dispatchEvent(new Event('change'));
		}
	});
}