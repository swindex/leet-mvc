import { empty } from "./helpers";

export const Tabs = {
  activate: function (this_ctrl: HTMLElement | undefined): void {
    const ctrl = this_ctrl;
    if (!ctrl) return;

    let parent: HTMLElement | null = ctrl.parentElement;
    const parent_id = ctrl.getAttribute("parent_id");
    if (parent_id != null) {
      parent = document.getElementById(parent_id);
    }

    if (parent) {
      Tabs.hide_all(parent);
    }
    Tabs.setActive(ctrl);
  },

  activate_by_id: function (id: string): void {
    if (typeof id === 'undefined') return;
    const t = document.getElementById(id);
    if (!t) return;

    let parent: HTMLElement | null = t.parentElement;
    const parent_id = t.getAttribute("parent_id");
    if (parent_id != null) {
      parent = document.getElementById(parent_id);
    }

    if (parent) {
      Tabs.hide_all(parent);
    }

    this.setActive(t);
  },

  hide_all: function (parent: HTMLElement): void {
    const all = parent.getElementsByTagName('div');
    for (let n = 0; n < all.length; n++) {
      this.setInActive(all[n]);
    }
  },

  /**
   * Initialize tabs
   * @param tabButtons - the tab-buttons container
   */
  init: function (tabButtons: HTMLElement): void {
    const parent = tabButtons.parentElement;
    if (!parent) return;

    const all = tabButtons.getElementsByTagName('div');
    let first: HTMLElement | null = null;
    let activeFound = false;

    for (let n = 0; n < all.length; n++) {
      const ctrl = all[n];

      if (first === null)
        first = ctrl;

      if (!empty(parent.querySelector('#' + ctrl.getAttribute('for')))) {
        ctrl.addEventListener('click', function (this: HTMLElement) {
          Tabs.activate(this);
        }, false);
      }

      if (!this.isActive(ctrl))
        this.setInActive(ctrl);
      else {
        this.setActive(ctrl);
        activeFound = true;
      }
    }

    if (first !== null && !activeFound)
      this.activate(first);
  },

  isActive: function (el: HTMLElement): boolean {
    return el.classList.contains('active') && el.getAttribute('active') !== null;
  },

  setActive: function (el: HTMLElement): void {
    const parentEl = el.parentElement?.parentElement;
    if (!parentEl) return;

    el.classList.add('active');
    el.setAttribute('active', '');

    const forAttr = el.getAttribute('for');
    const tab = forAttr ? parentEl.querySelector('#' + forAttr) : null;
    if (empty(tab))
      return;

    (tab as HTMLElement).classList.add('active');
  },

  setInActive: function (el: HTMLElement): void {
    const parentEl = el.parentElement?.parentElement;
    if (!parentEl) return;

    el.classList.remove('active');
    el.removeAttribute('active');

    const forAttr = el.getAttribute('for');
    const tab = forAttr ? parentEl.querySelector('#' + forAttr) : null;
    if (empty(tab))
      return;

    (tab as HTMLElement).classList.remove('active');
  }
};