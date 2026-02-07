/**
 * Binder Facade — allows switching between legacy and new implementations.
 *
 * Set USE_LEGACY to true to use the original closure-based Binder,
 * or false to use the new class-based Binder with extracted modules.
 */
const USE_LEGACY = false;

// --- New implementation ---
import { Binder as BinderNew, removeVDOMElement as removeVDOMElementNew } from './binder/BinderNew';

// --- Legacy implementation ---
import { Binder as BinderLegacy, removeVDOMElement as removeVDOMElementLegacy } from './BinderLegacy';

export const Binder: any = USE_LEGACY ? BinderLegacy : BinderNew;
export const removeVDOMElement: (en: any) => void = USE_LEGACY ? removeVDOMElementLegacy : removeVDOMElementNew;