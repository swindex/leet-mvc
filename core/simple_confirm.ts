// This module wraps some simple notifications
import { tryCall } from "./helpers";
import { Dialog, DialogPage } from "../pages/DialogPage/DialogPage";
import { Text } from "./text";
import { Objects } from "./Objects";

/**
 * Show "Confirm" dialog with custom buttons
 */
export const ConfirmButtons = function (
  prompt: string,
  title?: string,
  buttons?: { [button_name: string]: (dialog: DialogPage) => any }
): void {
  const p = Dialog(title || '');
  p.addLabel(null, Text.escapeHTML(prompt, true));
  Objects.forEach(buttons, (button: (dialog: DialogPage) => any, name: string | number) => {
    p.addActionButton(String(name), button);
  });
  p.onBackNavigate = () => false;
};

/**
 * Show simple Confirm Box
 */
export const Confirm = function (
  prompt: string,
  onConfirm?: (dialog: DialogPage) => any,
  title?: string
): void {
  const p = Dialog(title || '');

  p.addLabel(null, Text.escapeHTML(prompt, true));
  p.addActionButton('No', () => { });
  p.addActionButton('Yes', onConfirm);
};

/**
 * Show simple Confirm Box (danger variant - Yes button first)
 */
export const ConfirmDanger = function (
  prompt: string,
  onConfirm?: (dialog: DialogPage) => any,
  title?: string
): void {
  const p = Dialog(title || '');

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
  onConfirm?: (dialog: DialogPage) => void,
  title?: string,
  value?: string,
  validateRule?: boolean | string,
  type?: string
): void {
  type = type || 'text';
  const p = Dialog(title || '');
  p.addLabel(null, Text.escapeHTML(prompt, true));
  p.addInput('input', '', type, value, validateRule);
  p.addActionButton('Cancel', () => { });
  p.addActionButton('OK', () => {
    if (p.content.validator.validate()) {
      tryCall(null, onConfirm, p);
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
  onConfirm?: (dialog: DialogPage) => boolean | void,
  title?: string
): void {
  const p = Dialog(title || '');
  p.addHtml(Text.escapeHTML(prompt, true), { class: "align-block-center" });
  p.addActionButton('OK', onConfirm);
  // back navigation also means confirm!
  if (onConfirm)
    p.onBackNavigate = () => {return onConfirm(p)||false;};
};