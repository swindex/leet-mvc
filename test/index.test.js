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

window['Translate'] = Translate;
window['DOM'] = DOM;

var Inject = Injector.implement(InjectTemplate);
Inject.Nav = new NavController();

var v = Inject.Nav.setRoot(RootPage);
