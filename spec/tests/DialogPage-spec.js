import './../../index';

import { NavController } from "../../core/NavController";
import { Dialog, DialogPage } from "../../pages/DialogPage/DialogPage";
import { Injector } from "../../core/Injector";
import { doesNotReject } from 'assert';
import { Override } from '../../core/helpers';


var I = Injector.implement({
	Nav: null,
})

I.Nav = new NavController();
/** @type {DialogPage} */
var page;
xdescribe('Test DialogPage',function(){
	beforeEach(function(done){
		page = Dialog("str_Title");
		page.onLoaded=()=>{
			page.update();
			done();
		}
	})
	afterEach(function(done){
		page.destroy();

		debugger;
		page.onDestroy = Override(page, page.onDestroy, (next)=>{
			done();
			next();
		})
	})

	it("Page defined",function(){
		expect(page).not.toBeNull();
	});

	it("Title change",function(done){
		//console.log(page.page.html());
		expect(page.page.html()).toContain("str_Title");
		page.title = "str_Title2"
		setTimeout(()=>{
			expect(page.page.html()).toContain("str_Title2");
			done();
		},100);
	});

	it("Add Buttons",function(done){
		page.buttons.btn_Ok = function(){};

		setTimeout(()=>{
			expect(page.page.html()).toContain("btn_Ok");
	
			page.buttons.btn_Cancel = null;
			setTimeout(()=>{
				expect(page.page.html()).toContain("btn_Cancel");
				done();
			});
		});
	});

	it("Check Button click",function(done){
		page.buttons.btn_Ok = function(){
			done();
		};

		setTimeout(()=>{
			expect(page.page.html()).toContain("btn_Ok");
			page.page.find("#dialogButtonbtn_Ok")[0].dispatchEvent(new Event("click"));
		});
	});

	it("Button click that returns {} destroys dialog",function(done){
		page.buttons.btn_Ok = function(){
			return true;
		};

		page.onDestroy = Override(page, page.onDestroy, (next)=>{
			done();
			next();
		})


		setTimeout(()=>{
			expect(page.page.html()).toContain("btn_Ok");
			page.page.find("#dialogButtonbtn_Ok")[0].dispatchEvent(new Event("click"));
		});
	});
});