import '../core/polyfill.js';
import './../scss/app.scss';
import './../scss/forms.scss';
import './../scss/buttons.scss';

import { Translate } from '../core/Translate.js';
import { Injector } from '../core/Injector.js';
import { InjectTemplate } from './InjectTemplate.js';
import { NavController } from '../core/NavController.js';
import { RootPage } from './Pages/RootPage.js';
import { DOM } from '../core/DOM.js';
import { Forms } from '../components/Forms';

window['Translate'] = Translate;
window['DOM'] = DOM;

var Inject = Injector.implement(InjectTemplate);
Inject.Nav = new NavController();

var v = Inject.Nav.setRoot(RootPage);

// Forms.field_definitions["select"] = function(forms, el, parentPath){
//   return forms.renderFieldGroupHTML(el, [
//     `<select-tree name="${el.name}"
//       [el] = "${forms.refactorAttrName('this.fields.' + el._name)}"
//       (onChange)="this.events.change.apply(null,arguments)"
//       [(value)]= "${forms.refactorAttrName('this.data.' + el._name)}"
//       placeholder="${el.placeholder}"
//       [items] = "${forms.refactorAttrName('this.fields.' + el._name + '.items')}">
//     </select-tree>`
//   ]);
// }
