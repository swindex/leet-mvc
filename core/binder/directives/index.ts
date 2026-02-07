import type { DirectiveHandler } from '../types';
import { ifDirective } from './IfDirective';
import { foreachDirective } from './ForeachDirective';
import { bindDirective } from './BindDirective';
import { transitionDirective } from './TransitionDirective';
import { directiveDirective } from './DirectiveDirective';
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
export const directiveRegistry: Record<string, DirectiveHandler> = {
  'if': ifDirective,
  'foreach': foreachDirective,
  'bind': bindDirective,
  'transition': transitionDirective,
  'directive': directiveDirective,
  'component': componentDirective,
  'selected': selectedDirective,
  'style': styleDirective,
  'attribute': attributeDirective,
  'display': displayDirective,
  'show': showDirective,
  'class': classDirective,
  'innerhtml': innerhtmlDirective,
};