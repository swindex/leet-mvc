import './../core/polyfills.js';
import { Translate } from '../core/Translate.js';
import { Injector } from '../core/Injector.js';
import { InjectTemplate } from './InjectTemplate.js';
import { NavController } from '../core/NavController.js';
import { TestFormsPage } from './Pages/TestFormsPage.js';

//Make jQuery available globally
window["$"] = window["jQuery"] = require("jquery");
window['Translate'] = Translate;

var Inject = Injector.implement(InjectTemplate);
Inject.Nav = new NavController();

var v = Inject.Nav.setRoot(TestFormsPage);
