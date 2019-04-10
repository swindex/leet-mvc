import { MapElement } from "./core/MapElement";
import { BasePage } from "./pages/BasePage";
import { Objects } from "./core/Objects";
import { NavController } from "./core/NavController";
import { ConfirmButtons, Alert, Confirm, ConfirmDanger } from "./core/simple_confirm";
import { Dialog, DialogPage } from "./pages/DialogPage/DialogPage";
import { Translate, ReplaceValues } from "./core/Translate";
import { Injector } from "./core/Injector";
import { SimpleTabs } from "./components/SimpleTabs/SimpleTabs";
import { MenuPage } from "./pages/MenuPage/MenuPage";
import { LoginPage } from "./pages/LoginPage/LoginPage";
import { CalendarPage } from "./pages/CalendarPage/CalendarPage";
import { Calendar2Page } from "./pages/Calendar2Page/Calendar2Page";
import { DirectionsPage } from "./pages/DirectionsPage/DirectionsPage";
import { ActionSheetPage } from "./pages/ActionSheetPage/ActionSheetPage";
import { DeBouncer } from "./core/DeBouncer"; 
import { DateTime } from "./core/DateTime";
import { DataShape } from "./core/DataShape";
import { CallbackQueue } from "./core/CallbackQueue";
import { State } from "./core/State";
import { Analytics } from "./core/analytics_matomo";
import { Touch } from "./core/Touch.js";

import { OptionsDialogPage } from "./pages/OptionsDialogPage/OptionsDialogPage";
import { Extend, GUID, Override, tryCall } from "./core/helpers";

import { Toast, ToastPage } from "./pages/Toast/Toast"; 
import './core/polyfills';

//Make jQuery available globally
// @ts-ignore
window.$ = window.jQuery = require("jquery");

window['Translate'] = Translate;
