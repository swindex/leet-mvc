// @ts-nocheck
import '../core/polyfill';
import './../scss/app.scss';
import './../scss/forms.scss';
import './../scss/buttons.scss';
import './styles.scss'

import { Translate } from '../core/Translate';
import { Injector } from '../core/Injector';
import { InjectTemplate } from './InjectTemplate';
import { NavController } from '../core/NavController';
import { RootPage } from './Pages/RootPage';
import { DOM } from '../core/DOM';
import { Forms } from '../components/Forms';

(window as any)['Translate'] = Translate;
(window as any)['DOM'] = DOM;

var Inject = Injector.implement(InjectTemplate);
Inject.Nav = new NavController();

var v = Inject.Nav.setRoot(RootPage);