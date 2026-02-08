import type { DirectiveHandler } from '../types';
import { ifDirective } from './IfDirective';
import { foreachDirective } from './ForeachDirective';
import { bindDirective } from './BindDirective';
import { transitionDirective } from './TransitionDirective';
import { htmlDirective } from './HtmlDirective';
import { componentDirective } from './ComponentDirective';
import {
  selectedDirective,
  styleDirective,
  attributeDirective,
  displayDirective,
  showDirective,
  classDirective,
  innerhtmlDirective,
} from './SimpleDirectives';

/**
 * Registry mapping directive/attribute names to their handler functions.
 * Used by the Binder to dispatch attribute execution.
 */
/**
 * Deprecated directive handler - throws error to guide users to use [html] instead
 */
const deprecatedDirectiveDirective: DirectiveHandler = () => {
  throw new Error('[directive] has been renamed to [html]. Please update your template to use [html] instead.');
};

export const directiveRegistry: Record<string, DirectiveHandler> = {
  'if': ifDirective,
  'foreach': foreachDirective,
  'bind': bindDirective,
  'transition': transitionDirective,
  'html': htmlDirective,
  'directive': deprecatedDirectiveDirective, // Deprecated - use [html] instead
  'component': componentDirective,
  'selected': selectedDirective,
  'style': styleDirective,
  'attribute': attributeDirective,
  'display': displayDirective,
  'show': showDirective,
  'class': classDirective,
  'innerhtml': innerhtmlDirective,
};
