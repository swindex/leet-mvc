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
import { Dialog } from '../pages/DialogPage/DialogPage';
import { TestProjectedContentPage } from './Pages/TestProjectedContentPage';
import { TestHtmlContentPage } from './Pages/TestHtmlContentPage';
import { TestSimpleHtmlContentPage } from './Pages/TestSimpleHtmlConentPage';

(window as any)['Translate'] = Translate;
(window as any)['DOM'] = DOM;

Injector.Nav = new NavController();

var v = Injector.Nav.setRoot(RootPage);

// Uncomment for development of specific pages
//var v = Injector.Nav.setRoot(TestProjectedContentPage);

//var v = Injector.Nav.setRoot(TestSimpleHtmlContentPage);