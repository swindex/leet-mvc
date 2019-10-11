import { CalendarPage } from "../pages/CalendarPage/CalendarPage";
import { DateTime } from "./DateTime";
import { OptionsDialogPage } from "../pages/OptionsDialogPage/OptionsDialogPage";
import { Injector } from "./Injector";
import { RegisterComponent } from "./Register";
import { MultiSelect } from "./../components/MultiSelect/MultiSelect";
import { Forms } from "../components/Forms";

var Inject = Injector;

export function EnableCustomElements(){
	function preventFocus(ev){
		ev.preventDefault();
		var evt  = ev.target;
		evt.blur();
		$(evt).addClass('focus-blink');
		setTimeout(()=>{
			window.focus();
			
		},1);
		setTimeout(()=>{
			$(evt).removeClass('focus-blink');
		},600);
	}

	//mobile IOS hack to make sure :active works on buttons					
	$(document).on('touchstart',function(ev){
		
	});

	//override default behavior of form elements					
	$(document).on('mousedown focus','input[readonly]', function(ev){
		preventFocus(ev)
	});

	$(document).on('mousedown focus','input[date]', function(ev){
		preventFocus(ev)
		var el = ev.target;
		var date = DateTime.fromHumanDate($(el).val().toString());
		var p = Inject.Nav.push(CalendarPage,date);
		p.showClock = false;
		p.onDateTimeSelected = (_date)=>{
			$(el).val(DateTime.toHumanDate(_date));
			el.dispatchEvent(new Event('change'));
			return true;
		}
	});
	$(document).on('mousedown focus','input[datetime]', function(ev){
		preventFocus(ev)
		var el = ev.target;
		var date = DateTime.fromHumanDateTime($(el).val().toString());
		var p = Inject.Nav.push(CalendarPage,date);
		
		p.onDateTimeSelected = (_date)=>{
			$(el).val(DateTime.toHumanDateTime(_date));
			el.dispatchEvent(new Event('change'));
			return true;
		}
	});

	$(document).on('mousedown focus','input[time]', function(ev){
		preventFocus(ev)
		var el = ev.target;
		var date = DateTime.fromHumanTime($(el).val().toString());
		var p = Inject.Nav.push(CalendarPage,date); 
		p.title = "Select time"
		//p.showClock = true;
		p.showCalendar = false;
		
		p.onDateTimeSelected = (_date)=>{
			$(el).val(DateTime.toHumanTime(_date));
			el.dispatchEvent(new Event('change'));
			return true;
		}
	});

	//create select-multiple custom element
	RegisterComponent(MultiSelect, 'select-multiple');
	Forms.field_definitions["select-multiple"] = function(forms, el, parentPath){
		return forms.renderFieldGroupHTML(el, [
			`<select-multiple name="${el.name}" [(value)]= "this.data${forms.refactorAttrName(el._name)}" [onChange]="this.events.change" placeholder="${el.placeholder}" [items] = "this.elementItems${forms.refactorAttrName(el._name)}"></select-multiple>`
		]);
	},

	//Override the system select drop-down with custom drop-down
	$(document).on('mousedown focus','select', function(ev){
		preventFocus(ev)
		/** @type {HTMLSelectElement} */
		var el = ev.target;
		var p = Inject.Nav.push(OptionsDialogPage);
		p.title = el.getAttribute('placeholder');

		p.multiple = el.getAttribute('type')=="multiple";
		if (!p.multiple)
			p.icons = null;

		p.isSelectedItem = item => item.value === el.value;

		$(el).find('option').each(function(index, option){
			var value = option.getAttribute('value');
			var text = option.getAttribute('title');
			if (value !== null || !p.title){
				p.items.push({title: option.innerHTML, value: value, text: text})
			}
		})
		
		p.onItemClicked = (item)=>{
			$(el).val(item.value);
			el.dispatchEvent(new Event('change'));
		}
	});
}