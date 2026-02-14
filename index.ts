import { BasePage } from "./pages/BasePage";
import { Objects } from "./core/Objects";
import { NavController } from "./core/NavController";
import { ConfirmButtons, Alert, Confirm, ConfirmDanger } from "./core/simple_confirm";
import { Dialog, DialogPage } from "./pages/DialogPage/DialogPage";
import { ReplaceValues, Translate } from "./core/Translate";
import { Injector } from "./core/Injector";
import { SimpleTabs } from "./components/SimpleTabs/SimpleTabs";
import { MenuPage } from "./pages/MenuPage/MenuPage";
import { CalendarPage } from "./pages/CalendarPage/CalendarPage";
import { Calendar2Page } from "./pages/Calendar2Page/Calendar2Page";
import { ActionSheetPage } from "./pages/ActionSheetPage/ActionSheetPage";
import { DeBouncer } from "./core/DeBouncer";
import { DateTime } from "./core/DateTime";
import { DataShape } from "./core/DataShape";
import { CallbackQueue } from "./core/CallbackQueue";
import { State } from "./core/State";
import { Analytics } from "./core/analytics_matomo";
import { Touch } from "./core/Touch";

import { OptionsDialogPage } from "./pages/OptionsDialogPage/OptionsDialogPage";
import { Extend, GUID, tryCall, argumentsToArray } from "./core/helpers";

import { Toast, ToastPage } from "./pages/Toast/Toast";
import { EnableCustomElements } from "./core/EnableCustomElements";
import { Forms } from "./components/Forms";
import { ItemList } from "./components/ItemList";
import { RegisterComponent } from './core/Register';
import { NumericKeyboard } from './pages/NumericKeyboard/NumericKeyboard';
import { Override } from './core/Override';

declare global {
  interface Window {
    Translate: typeof Translate;
  }
}

window['Translate'] = Translate;

import './scss/app.scss';
import './scss/grid.scss';

export {
  BasePage,
  Objects,
  NavController,
  ConfirmButtons,
  Alert,
  Confirm,
  ConfirmDanger,
  Dialog,
  DialogPage,
  ReplaceValues,
  Translate,
  Injector,
  SimpleTabs,
  MenuPage,
  CalendarPage,
  Calendar2Page,
  ActionSheetPage,
  DeBouncer,
  DateTime,
  DataShape,
  CallbackQueue,
  State,
  Analytics,
  Touch,
  OptionsDialogPage,
  Extend,
  GUID,
  tryCall,
  argumentsToArray,
  Toast,
  ToastPage,
  EnableCustomElements,
  Forms,
  ItemList,
  RegisterComponent,
  NumericKeyboard,
  Override
};