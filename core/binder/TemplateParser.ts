import { Objects } from '../Objects';
import type { IRNode } from './types';

const htmlparser = require('htmlparser2');

/**
 * Directive attribute names that create their own scope
 */
const MANAGED_DIRECTIVE_ATTRS = new Set(['[if]','[foreach]', '[transition]']);


/**
 * Parses HTML template strings into an IR (Intermediate Representation) tree.
 * The IR can then be directly executed by the Binder without string-based code generation.
 */
export class TemplateParser {

  /**
   * Parse an HTML template string into an IR tree.
   * If the template has multiple root elements, wraps them in a fragment div.
   */
  parse(template: string): IRNode {
    const handler = new htmlparser.DomHandler(function () { });
    const parser = new htmlparser.Parser(handler, {
      lowerCaseAttributeNames: false,
      decodeEntities: true,
    });
    parser.parseComplete(template);

    const rootElements = Objects.filter(handler.dom, (el: any) => el.type === 'tag') as any[];
    if (!rootElements || rootElements.length !== 1) {
      // Wrap in a fragment div
      return this.astToIR({
        data: 'div',
        type: 'tag',
        name: 'div',
        attribs: { fragment: '' },
        children: rootElements || [],
      });
    }
    return this.astToIR(rootElements[0]);
  }

  /**
   * Convert an htmlparser2 AST node into an IRNode.
   * Handles text nodes (including {{moustache}} interpolation), comments, and elements.
   */
  private astToIR(obj: any): IRNode {
    if (obj.type === 'text') {
      return this.parseTextNode(obj.data);
    }

    if (obj.type === 'comment') {
      // Skip comments — return an empty text node
      return { type: 'text', attributes: {}, children: [], textContent: '' };
    }

    // Element node
    const tag = obj.name;
    const attributes: Record<string, string> = {};
    const directives: Array<{ key: string; expression: string }> = [];

    if (obj.attribs) {
      Objects.forEach(obj.attribs, (value: string, key: string | number) => {
        const k = String(key);
        if (MANAGED_DIRECTIVE_ATTRS.has(k)) {
          directives.push({ key: k, expression: value });
        } else {
          attributes[k] = value;
        }
      });
    }

    // Parse children first
    const children: IRNode[] = [];
    if (obj.children && obj.children.length > 0) {
      for (const child of obj.children) {
        const irChild = this.astToIR(child);
        if (irChild) {
          children.push(irChild);
        }
      }
    }

    // Handle multiple directives - nest them with proper priority
    // Priority order: [if] > [foreach] > [component] > others
    if (directives.length > 1) {
      directives.sort((a, b) => {
        const priority: Record<string, number> = {
          '[if]': 1,
          '[foreach]': 2,
          '[transition]': 3,
        };
        return (priority[a.key] || 99) - (priority[b.key] || 99);
      });

      // Create outer directive with inner directives preserved in attributes
      const outerDirective = directives[0];
      const innerDirectives = directives.slice(1);

      // Put inner directives back into attributes
      const innerAttributes: Record<string, string> = { ...attributes };
      for (const dir of innerDirectives) {
        innerAttributes[dir.key] = dir.expression;
      }

      // Return outer directive node with inner directives in attributes
      return {
        type: 'managed',
        tag,
        attributes: innerAttributes,
        children,
        directive: outerDirective,
      };
    }

    // Single directive or no directive
    const managed_directive = directives.length === 1 ? directives[0] : undefined;

    const irNode: IRNode = {
      type: managed_directive ? 'managed' : 'element',
      tag,
      attributes,
      children,
    };

    if (managed_directive) {
      irNode.directive = managed_directive;
    }

    return irNode;
  }

  /**
   * Parse a text node, splitting {{moustache}} expressions into separate IR text nodes.
   * Returns a single text node if there's no interpolation, or a fragment-wrapper
   * containing multiple text nodes if there is.
   */
  private parseTextNode(data: string): IRNode {
    const escaped = data//this.escapeForText(data);
    const bits = escaped.split(/({{[^{}]*}})/gmi);

    // If there's only one bit and no interpolation, return a simple text node
    if (bits.length === 1 && !bits[0].match(/{{.*}}/)) {
      return {
        type: 'text',
        attributes: {},
        children: [],
        textContent: bits[0],
      };
    }

    // Multiple segments — return them as children of a virtual fragment
    const children: IRNode[] = [];
    for (const bit of bits) {
      const match = bit.match(/^{{([^{}]+)}}$/);
      if (match) {
        // Bound text node
        children.push({
          type: 'text',
          attributes: {},
          children: [],
          bindExpression: match[1],
        });
      } else if (bit) {
        // Plain text node
        children.push({
          type: 'text',
          attributes: {},
          children: [],
          textContent: bit,
        });
      }
    }

    // If exactly one child, return it directly
    if (children.length === 1) {
      return children[0];
    }

    // Multiple text segments — the Binder's createElement will handle them as siblings
    // We represent this as a special "multi-text" wrapper that the executor flattens
    return {
      type: 'element',
      tag: '__textgroup__',
      attributes: {},
      children,
    };
  }

  /**
   * Escape newlines for text content
   */
  private escapeForText(text: string): string {
    return text.replace(/\n/g, '\\n');
  }
}