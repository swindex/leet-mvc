// @ts-nocheck
import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
import { NavController } from "../../core/NavController";
import { DOM } from "../../core/DOM";
import { BasePage } from "../../pages/BasePage";
import { Objects } from "../../core/Objects";
import { GUID } from "../../core/helpers";

export class RouterTestPage extends HeaderPage {
  router: RouterNavigator;

  constructor() {
    super();

    this.router = new RouterNavigator({
      routes: [
        { name: "", page: (params: any) => new Page1("index") },
        { name: "p1", page: (params: any) => new Page1(params) },
        { name: "p2", page: (params: any) => new Page2("P2") },
        { name: "p3", page: (params: any) => new Page3("P3") },
        { name: "p4", page: (params: any) => new Page4("P4") }
      ]
    });

  }

  onInit() {
    this.router.setContainer(DOM(this.page).find("#outlet").first());
    this.router.matchLocation(true);
  }

  onPage1Click() {
    this.router.push("p1", "Param1");
  }
  onPage2Click() {
    this.router.push("p2");
  }
  onPage3Click() {
    this.router.push("p3");
  }
  onPage4Click() {
    this.router.push(new Page4("P4"));
  }
  onPageRootClick() {
    this.router.setRoot("p1", "page 1 root");
  }

  get template() {
    return super.extendTemplate(super.template, `
    <div>
      <button onclick="this.onPage1Click()">Push Page 1</button>
      <button onclick="this.onPage2Click()">Push Page 2 (with par)</button>
      <button onclick="this.onPage3Click()">Push Page 3</button>
      <button onclick="this.onPage4Click()">Push Page 4</button>
      <button onclick="this.onPageRootClick()">SetRoot Page 1</button>
    </div>
    <div id="outlet">
    </div>
    `);
  }
}

interface RouteConfig {
  name?: string;
  page: (params?: any) => any;
}

interface RouterOptions {
  routes: RouteConfig[];
}

interface RouterState {
  name: string;
  args: any[];
  index: number;
  guid: string;
}

class RouterNavigator extends NavController {
  options: RouterOptions;
  index: number;
  lastStateIndex: number;
  initialLength: number;
  currentState: RouterState | null;

  constructor(options: RouterOptions) {
    super();
    window.addEventListener("popstate", this.onPopState);
    this.index = 0;
    this.options = options;
    this.lastStateIndex = 0;
    this.initialLength = window.history.length;
    this.currentState = null;
  }

  matchLocation(setRoot: boolean = false) {
    var href = window.location.href;
    var parts = href.split(/#(.+)/);
    var host = parts[0];
    var routName = parts[1] || "";

    var route = Objects.find(this.options.routes, (r: RouteConfig) => r.name === routName);
    if (route) {
      var name = route.name;
      if (setRoot)
        this.setRoot(name);
      else
        this.push(name);
    }

  }

  destroy() {
    window.removeEventListener("popstate", this.onPopState);
    super.destroy();
  }

  onPopState(event: PopStateEvent) {

    if (event.state == null) {
      return;
    }

    var stateIndex = event.state ? event.state.index : 0;
    var stateName = event.state ? event.state.name : null;
    console.log(stateIndex, this.index);

    if (event.state == null) {
      this.matchLocation(true);
      return;
    }
    if (stateIndex < this.lastStateIndex) {
      this.index--;
      //back nav
      var guid = this.currentState ? this.currentState.guid : null;
      //find and destroy a page with the same guid
      if (guid) {
        var found = false;
        //delete pages after and including this one
        for (var i = this.stack.length - 1; i>= 0; i--) {
          var frame = this.stack[i];
          if (frame.page.guid == guid)
            found = true;
          if (frame && frame.page && !frame.page.isDeleted)
            frame.page.destroy();
          if (found)
            break;
        }
      }
      this.currentState = event.state;
    } else if (stateIndex > this.lastStateIndex) {
      //Forward nav
      //push page
      if (typeof stateName == "string") {
        var pageClass = this.getRoute(stateName).page(event.state.args);
        var ret: any = super.push(pageClass);
        var guid = event.state && event.state.guid ? event.state.guid : GUID();
        ret.guid = guid;

        this.index++;
        this.lastStateIndex = this.index;
        this.currentState = event.state;

        return ret;
      }
    }
    this.lastStateIndex = stateIndex;
  }

  setRoot(name: any, ...args: any[]) {
    if (typeof name == "string") {
      var pageClass = this.getRoute(name).page(args);
      var count = this.stack.length;
      var ret: any = super.setRoot(pageClass);

      if (this.index > 0) {
      }

      var guid = GUID();
      ret.guid = guid;

      this.index = 1;
      this.lastStateIndex = this.index;
      this.currentState = { name: name, args: args, index: this.index, guid: guid };
      window.history.replaceState(this.currentState, name, `#${name}`);
      return ret;
    } else {
      return super.setRoot(name, ...args);
    }

  }

  push(name: any, ...args: any[]) {
    if (typeof name == "string") {
      var pageClass = this.getRoute(name).page(args);
      var ret: any = super.push(pageClass);
      var guid = GUID();
      ret.guid = guid;

      this.index++;
      this.lastStateIndex = this.index;
      this.currentState = { name: name, args: args, index: this.index, guid: guid };
      window.history.pushState(this.currentState, name, `#${name}`);
      return ret;
    } else {
      var ret: any = super.push(name, ...args);
    }
  }

  getRoute(name: string): RouteConfig {
    return Objects.find(this.options.routes, (r: RouteConfig) => r.name == name);
  }
}

class Page1 extends BasePage {
  title: string;
  constructor(title: string) {
    super();
    this.title = title;
  }
  get template() {
    return "<div><button onclick='this.destroy()'>Back</button>Page 1. Title: {{this.title}}</div>";
  }
}
class Page2 extends BasePage {
  title: string;
  constructor(title: string) {
    super();
    this.title = title;
  }
  get template() {
    return "<div><button onclick='this.destroy()'>Back</button>Page 2 Title: {{this.title}}</div>";
  }
}
class Page3 extends BasePage {
  title: string;
  constructor(title: string) {
    super();
    this.title = title;
  }
  get template() {
    return "<div><button onclick='this.destroy()'>Back</button>Page 3 Title: {{this.title}}</div>";
  }
}
class Page4 extends BasePage {
  title: string;
  constructor(title: string) {
    super();
    this.title = title;
  }
  get template() {
    return "<div><button onclick='this.destroy()'>Back</button>Page 4 Title: {{this.title}}</div>";
  }
}

var Router = {
  routes: [] as any[],
  mode: null as string | null,
  root: '/',
  interval: null as any,
  config: function(options: any) {
      this.mode = options && options.mode && options.mode == 'history' 
                  && !!(history.pushState) ? 'history' : 'hash';
      this.root = options && options.root ? '/' + this.clearSlashes(options.root) + '/' : '/';
      return this;
  },
  getFragment: function(): string {
      var fragment = '';
      if(this.mode === 'history') {
          fragment = this.clearSlashes(decodeURI(location.pathname + location.search));
          fragment = fragment.replace(/\\?(.*)$/, '');
          fragment = this.root != '/' ? fragment.replace(this.root, '') : fragment;
      } else {
          var match = window.location.href.match(/#(.*)$/);
          fragment = match ? match[1] : '';
      }
      return this.clearSlashes(fragment);
  },
  clearSlashes: function(path: string): string {
      return path.toString().replace(/\/$/, '').replace(/^\//, '');
  },
  add: function(re: any, handler?: Function) {
      if(typeof re == 'function') {
          handler = re;
          re = '';
      }
      this.routes.push({ re: re, handler: handler});
      return this;
  },
  remove: function(param: any) {
      for(var i=0, r: any; i < this.routes.length, r = this.routes[i]; i++) {
          if(r.handler === param || r.re.toString() === param.toString()) {
              this.routes.splice(i, 1); 
              return this;
          }
      }
      return this;
  },
  flush: function() {
      this.routes = [];
      this.mode = null;
      this.root = '/';
      return this;
  },
  check: function(f?: string) {
      var fragment = f || this.getFragment();
      for(var i=0; i < this.routes.length; i++) {
          var match = fragment.match(this.routes[i].re);
          if(match) {
              match.shift();
              this.routes[i].handler.apply({}, match);
              return this;
          }           
      }
      return this;
  },
  listen: function() {
      var self = this;
      var current = self.getFragment();
      var fn = function() {
          if(current !== self.getFragment()) {
              current = self.getFragment();
              self.check(current);
          }
      }
      clearInterval(this.interval);
      this.interval = setInterval(fn, 50);
      return this;
  },
  navigate: function(path?: string) {
      path = path ? path : '';
      if(this.mode === 'history') {
          history.pushState(null, '', this.root + this.clearSlashes(path));
      } else {
          window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
      }
      return this;
  }
}