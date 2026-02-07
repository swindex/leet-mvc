// @ts-nocheck
import { BaseComponent } from "./../BaseComponent";
import './SimpleTabs.scss';
import { DOM } from "../../core/DOM";
/**
 * Simple tabs directive. 
 */
export class SimpleTabs extends BaseComponent {
  constructor() {
    super();

    /** @type {DocumentFragment} */
    this.tempContainer = null;
    this._currentTabLabel = null;
  }

	/**
	 * ***Override*** Called when tab is changed
	 * @param {string} tabLabel 
	 */
  onTabChanged(tabLabel) {

  }

  _unSelectAll() {
    var self = this;
    DOM(this.container).find('li').each(function (el) {
      var t = DOM(el);
      self._getTab(t).removeAttr('selected');
      t.removeAttr('selected');
    }
    );
  }

  /** @param {HTMLElement} elem */
  _getTabLabel(elem) {
    return DOM(elem).attr('for');
  }

  _getTab(target) {
    var tab_id = this._getTabLabel(target);
    return DOM(this.container).find('#' + tab_id);
  }

  _select(target) {
    var label = this._getTabLabel(target);
    if (this._currentTabLabel !== label) {
      this._currentTabLabel = label;
      this.onTabChanged(label);
    }
    this._currentTabLabel = label;

    DOM(target).attr('selected', '');
    this._getTab(target).attr('selected', '');
  }

  select(forLabel) {
    if (this.container) {
      var t = DOM(this.container).find("[for='" + forLabel + "']");
      if (t.length == 1) {
        this._unSelectAll();
        this._select(t);
      }
    } else {
      this._currentTabLabel = forLabel;
    }
  }

  setTabVisibility(forLabel, isVisible) {
    if (this.container) {
      var t = DOM(this.container).find("[for='" + forLabel + "']");
      if (t.length == 1) {
        if (!isVisible)
          t.hide();
        else
          t.show();
      }
    }
  }

  onInit(container) {
    DOM(container).find('li').addEventListener('click', (ev) => {
      var t = ev.currentTarget;
      if (this._getTab(t).length > 0) {
        this._unSelectAll();
        this._select(t);
      } else {
        DOM(t).attr('selected', '');
        setTimeout(() => {
          DOM(t).removeAttr('selected');
        }, 500);
      }

    });
    var sel = DOM(container).find('li[selected]').get(0);
    this._unSelectAll();
    if (sel)
      this._select(sel);
    else {
      if (this._currentTabLabel) {
        this.select(this._currentTabLabel);
      } else {
        this._select(DOM(container).find('li').first());
      }
    }
  }
}