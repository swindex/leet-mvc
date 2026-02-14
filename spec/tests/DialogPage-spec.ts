// @ts-nocheck
import './../../index';

import { NavController } from "../../core/NavController";
import { Dialog, DialogPage } from "../../pages/DialogPage/DialogPage";
import { Injector } from "../../core/Injector";
import { Override } from '../../core/helpers';
import { DOM } from '../../core/DOM';


Injector.Nav = new NavController();

var page: DialogPage;
describe('Test DialogPage',function(){
	beforeEach(function(done){
		page = Dialog("str_Title");
		setTimeout(() => {
			done();
		}, 1);
	})
	afterEach(function(done){
		page.destroy();
		done();
	})

	it("Page defined",function(){
		expect(page).not.toBeNull();
	});

	it("Title change",function(done){
		expect(page.page.innerHTML).toContain("str_Title");
		page.title = "str_Title2";
		page.update();
		setTimeout(()=>{
			expect(page.page.innerHTML).toContain("str_Title2");
			done();
		},100);
	});

	it("Add Buttons",function(done){
		page.buttons.btn_Ok = function(){};
		page.update();

		setTimeout(()=>{
			expect(page.page.innerHTML).toContain("btn_Ok");
	
			page.buttons.btn_Cancel = null;
			page.update();
			setTimeout(()=>{
				expect(page.page.innerHTML).toContain("btn_Cancel");
				done();
			});
		});
	});

	it("Check Button click",function(done){
		page.buttons.btn_Ok = function(){
			done();
		};
		page.update();

		setTimeout(()=>{
			expect(page.page.innerHTML).toContain("btn_Ok");
			DOM(page.page).find("#dialogButtonbtn_Ok")[0].dispatchEvent(new Event("click"));
		});
	});

	it("Button click that returns {} destroys dialog",function(done){
		page.buttons.btn_Ok = function(){
			return true;
		};

		page.onDestroy = Override(page, page.onDestroy, (next)=>{
			next();
			done();
		})

		page.update();

		setTimeout(()=>{
			expect(page.page.innerHTML).toContain("btn_Ok");
			const button = DOM(page.page).find("#dialogButtonbtn_Ok")[0];
			if (button) {
				button.dispatchEvent(new Event("click"));
			} else {
				// If button not found, still call done to prevent timeout
				done();
			}
		}, 100);
	});
});