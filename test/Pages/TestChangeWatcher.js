import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
import { Watcher } from "../../core/Watcher";

export class TestChangeWatcher extends HeaderPage{
    constructor(){
        super();

        this.backButton = true;

        this.object = {
            counter:0,
            level2:{
                counter:0
            },
            level3:{
                counter:0
            }

        }

        this.log = ""

        
    }

    mutate(){
        this.log +=`Mutate State counters to ${this.object.counter+1}\n`
        this.object.counter ++;
        this.object.level2.counter ++;
        
        setTimeout(() => {
            this.object.level3.counter ++;
        }, 10);
    }

    hookWatchers(){
        this.log +=`Watchers Connected!\n`
        Watcher.on(this.object,
            (target, prop, value)=>{
                this.log +=`Watcher 1: Prop ${prop} changed to ${value}\n`
            },()=>{
                //throw new Error("Watcher1 onChange fail!")
                this.log +=`Watcher 1: Object updated\n`
            }
        )

        Watcher.on(this.object,
            (target, prop, value)=>{
                this.log +=`Watcher 2: Prop ${prop} changed to ${value}\n`
            },()=>{
                this.log +=`Watcher 2: Object updated\n`
            }
        )
    }
    unHookWatchers(){
        Watcher.off(this.object);
    }
    memTest(){
        this.log = "Running 100000 mounts\n"
        for (let index = 0; index <= 100000; index++) {
            setTimeout(() => {
                this.unHookWatchers();
                this.hookWatchers();
                this.mutate();
                this.log = `New Counter: ${this.object.counter}\n`
            }, 1);
        }
        //this.log += `New Counter: ${this.object.counter}\n`

        //this.mutate();
        //this.unHookWatchers();
    }
    onNewWindow(){
        var p = this.Nav.push(TestChangeWatcher);
        p.object = this.object;


    }

    get template (){
        return super.extendTemplate(super.template, template);
    }
}
var template = `
<div class="fill scroll">
<div><button onclick="this.hookWatchers()">Hook Watchers</button> <button onclick="this.unHookWatchers()">Un-Hook Watchers</button> <button onclick="this.memTest()">Test for Memory Leaks</button></div>
<div><button onclick="this.mutate()">Mutate State</button></div>
<div><button onclick="this.onNewWindow()">New Window</button></div>
<pre>{{ this.log }}</pre>
</div>
`