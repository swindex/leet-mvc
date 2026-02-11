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

    if (!on.items || on.items.length === 0) {
      // No children yet — create them
      ctx.vDomCreateItems(on, inject);
    } else {
      if (options.duration) {
        ctx.vDomCreateItems(on, inject);

        // Check that we have both items before proceeding
        if (on.items && on.items.length >= 2 && on.items[1] && on.items[1].elem && on.items[0] && on.items[0].elem) {
          const newItem = on.items[1].elem as HTMLElement;
          const oldItem = on.items[0].elem as HTMLElement;

          newItem.classList.add(options.enter_active);
          oldItem.classList.add(options.leave_active);

          newItem.classList.add(options.enter);
          oldItem.classList.add(options.leave);

          setTimeout(function () {
            // Verify items still exist before manipulating
            if (!on.items || on.items.length < 2) return;
            
            newItem.classList.remove(options.enter);
            oldItem.classList.remove(options.leave);

            newItem.classList.add(options.enter_to);
            oldItem.classList.add(options.leave_to);

            // Discard vDom nodes of the element that will be removed
            if (on.items[0]) {
              on.items[0].items = [];
            }

            setTimeout(function () {
              // Verify items still exist before final cleanup
              if (!on.items || on.items.length === 0) return;
              
              newItem.classList.remove(options.enter_active);
              oldItem.classList.remove(options.leave_active);
              newItem.classList.remove(options.enter_to);
              oldItem.classList.remove(options.leave_to);

              if (on.items[0] && on.items[0].elem) {
                ctx.removeElement(on.items[0].elem);
                on.items.shift();
              }
            }, options.duration);
          }, 16);

          return EAttrResult.SkipChildren;
        }
      }
      if (on.items && on.items.length > 0 && on.items[0]) {
        ctx.checkVDomNode(on.items[0], {});
      }
    }
  } else {
    if (on.items && on.items.length > 0 && on.items[0]) {
      ctx.checkVDomNode(on.items[0], {});
    }
  }
}