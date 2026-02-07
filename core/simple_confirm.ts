// This module wraps some simple notifications
import { tryCall } from "./helpers";
import { Dialog } from "../pages/DialogPage/DialogPage";
import { Text } from "./text";
import { Objects } from "./Objects";

/**
 * Show "Confirm" dialog with custom buttons
 */
export const ConfirmButtons = function (
  prompt: string,
  title?: string,
  buttons?: { [button_name: string]: () => any }
): void {
  const p: any = Dialog(title || '');
  p.addLabel(null, Text.escapeHTML(prompt, true));
  Objects.forEach(buttons, (button: () => any, name: string | number) => {
    p.addActionButton(String(name), button);
  });
  p.onBackNavigate = () => false;
};

/**
 * Show simple Confirm Box
 */
export const Confirm = function (
  prompt: string,
  onConfirm?: () => void,
  title?: string
): void {
  const p: any = Dialog(title || '');

  p.addLabel(null, Text.escapeHTML(prompt, true));
  p.addActionButton('No', () => { });
  p.addActionButton('Yes', onConfirm);
};

/**
 * Show simple Confirm Box (danger variant - Yes button first)
 */
export const ConfirmDanger = function (
  prompt: string,
  onConfirm?: () => void,
  title?: string
): void {
  const p: any = Dialog(title || '');

  p.addLabel(null, Text.escapeHTML(prompt, true));
  p.addActionButton('Yes', onConfirm);
  p.addActionButton('No', () => { });
};

/**
 * Show simple Prompt Box
 * @param prompt - The prompt message
 * @param onConfirm - Callback with the input value
 * @param title - dialog title
 * @param value - dialog initial value
 * @param validateRule - validate rule like 'required|min:10|max:50|number'
 * @param type - input type. Default - "text"
 */
export const Prompt = function (
  prompt: string,
  onConfirm?: (value: string | number) => void,
  title?: string,
  value?: string,
  validateRule?: true | string,
  type?: string
): void {
  type = type || 'text';
  const p: any = Dialog(title || '');
  p.addLabel(null, Text.escapeHTML(prompt, true));
  p.addInput('input', '', type, value, validateRule);
  p.addActionButton('Cancel', () => { });
  p.addActionButton('Ok', () => {
    if (p.content.validator.validate()) {
      tryCall(null, onConfirm, p.data.input);
    } else {
      return false;
    }
  });
};

/**
 * Show simple Alert box
 */
export const Alert = function (
  prompt: string,
  onConfirm?: () => boolean | void,
  title?: string
): void {
  const p: any = Dialog(title || '');
  p.addHtml(Text.escapeHTML(prompt, true), { class: "align-block-center" });
  p.addActionButton('Ok', onConfirm);
  // back navigation also means confirm!
  p.onBackNavigate = onConfirm;
};