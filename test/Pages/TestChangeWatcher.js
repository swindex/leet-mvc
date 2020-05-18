import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
import { Watcher2 } from "../../core/Watcher2";

var parentObject = {
  counter: 0,
  childObject: {
    counter: 0
  }
}
export class TestChangeWatcher extends HeaderPage{
    constructor(){
        super();

        this.backButton = true;

        this.log = ""
        
    }

    mutate(){
        this.log +=`Mutate State counters to ${parentObject.counter + 1}\n`
        parentObject.counter ++;
        
        /*setTimeout(() => {
            this.object.level3.counter ++;
        }, 10);*/
    }

    hookWatchers(){
      this.log +=`Watchers Connected!\n`
      parentObject= Watcher2.on(parentObject,
          (target, prop, value)=>{
              this.log +=`Watcher 1: Prop ${prop} changed to ${value}\n`
          },()=>{
              //throw new Error("Watcher1 onChange fail!")
              this.log +=`Watcher 1: Object updated\n`
          }
      )

      Watcher2.on(parentObject.childObject,
        (target, prop, value)=>{
            this.log +=`Watcher 2: Prop ${prop} changed to ${value}\n`
        },()=>{
            //throw new Error("Watcher1 onChange fail!")
            this.log +=`Watcher 2: Object updated\n`
        }
      )
      
      /*Watcher2.on(parentObject,
          (target, prop, value)=>{
              this.log +=`Watcher 2: Prop ${prop} changed to ${value}\n`
          },()=>{
              this.log +=`Watcher 2: Object updated\n`
          }
      )*/
    }
    unHookWatchers(){
        Watcher2.off(parentObject);
    }
    /*memTest(){
        this.log = "Running 100000 mounts\n"
        for (let index = 0; index <= 100000; index++) {
            setTimeout(() => {
                this.unHookWatchers();
                this.hookWatchers();
                this.mutate();
                this.log = `New Counter: ${parentObject.counter}\n`
            }, 1);
        }
        //this.log += `New Counter: ${this.object.counter}\n`

        //this.mutate();
        //this.unHookWatchers();
    }*/
    /*onNewWindow(){
        var p = this.Nav.push(TestChangeWatcher);
        p.object = this.object;


    }*/
    parentObjectLog(){
      return JSON.stringify(parentObject, null ,"  ");
    }

    childObjectLog(){
      //return JSON.stringify(childObject, null ,"  ");
    }

    get template (){
        return super.extendTemplate(super.template, template);
    }
}
var template = `
<div class="fill scroll">
<div><button onclick="this.hookWatchers()">Hook Watchers</button>
<button onclick="this.unHookWatchers()">Un-Hook Watchers</button>
<!--<button onclick="this.memTest()">Test for Memory Leaks</button></div>-->
<div><button onclick="this.mutate()">Mutate State</button></div>
<!--<div><button onclick="this.onNewWindow()">New Window</button></div>-->


<pre>{{ this.parentObjectLog() }}</pre>
<pre>{{ this.childObjectLog() }}</pre>

<pre>{{ this.log }}</pre>
</div>
`