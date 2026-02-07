import { EAttrResult } from '../types';
import type { VDom, DirectiveContext } from '../types';

/**
 * [transition] directive — animated enter/leave transitions when a trigger value changes.
 */
export function transitionDirective(on: VDom, inject: any, ctx: DirectiveContext): EAttrResult | void {
  const key = 'transition';
  const getter = on.getters[key];

  let options: any;
  try {
    options = getter(inject);
  } catch (ex) {
    options = {};
  }

  options = Object.assign({
    trigger: null,
    duration: 0,
    enter: 'enter',
    enter_active: 'enter_active',
    enter_to: 'enter_to',
    leave: 'leave',
    leave_active: 'leave_active',
    leave_to: 'leave_to',
  }, options);

  if (on.values[key] !== options.trigger) {
    on.values[key] = options.trigger;

    if (on.items.length === 0) {
      // No children yet — create them
      ctx.vDomCreateItems(on, inject);
    } else {
      if (options.duration) {
        ctx.vDomCreateItems(on, inject);

        const newItem = on.items[1].elem as HTMLElement;
        const oldItem = on.items[0].elem as HTMLElement;

        newItem.classList.add(options.enter_active);
        oldItem.classList.add(options.leave_active);

        newItem.classList.add(options.enter);
        oldItem.classList.add(options.leave);

        setTimeout(function () {
          newItem.classList.remove(options.enter);
          oldItem.classList.remove(options.leave);

          newItem.classList.add(options.enter_to);
          oldItem.classList.add(options.leave_to);

          // Discard vDom nodes of the element that will be removed
          on.items[0].items = [];

          setTimeout(function () {
            newItem.classList.remove(options.enter_active);
            oldItem.classList.remove(options.leave_active);
            newItem.classList.remove(options.enter_to);
            oldItem.classList.remove(options.leave_to);

            ctx.removeElement(on.items[0].elem!);
            on.items.shift();
          }, options.duration);
        }, 16);

        return EAttrResult.SkipChildren;
      }
      ctx.checkVDomNode(on.items[0], {});
    }
  } else {
    ctx.checkVDomNode(on.items[0], {});
  }
}