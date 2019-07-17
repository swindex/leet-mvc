import { Config } from "../../src/js/Config";
import '../../src/js/polyfill';
import { InjectTemplate } from "../../src/js/Inject";
import { Injector } from "leet-mvc/core/Injector";
import { NASAPI } from "../../src/js/NASDomesticAPI";

import { NavController } from "leet-mvc/core/NavController";
import { Common } from "../../src/js/Common";
import { Storage } from "leet-mvc/core/storage";
import { TempMemory } from "../../src/js/TempMemory";
import { Language } from "../../src/language/Language";
import { Translate } from "./../../core/Translate";
import { LoginPage } from "./../LoginPage/LoginPage";
//import "babel-polyfill";
window.$ = window.jQuery = require("jquery");
//load easing plugin
require('jquery.easing');

window.device = null;
window['Translate'] = Translate;


var Inject = Injector.implement(InjectTemplate)
Inject.Config = Config ;
Inject.Nav = new NavController;
Inject.CMN = Common;
Inject.Storage = Storage;
Inject.Mem= TempMemory;
Inject.LNG = Language;
Inject.API= new NASAPI(Config.API_URL_UAT);
Inject.API.settings_key = "NAS_KARMA_TESTING"
Inject.API.start(function(){
});
//Inject.SPY = new Analytics();

/** @type {LoginPage} */
var page = null;
describe("Page Login", function() {
	describe("Display", function() {
		var spy
		beforeEach(function(done) {
			page = Inject.Nav.setRoot(LoginPage);
			spyOn(Inject.API,'login').and.callThrough();
			spyOn(Inject.Nav,'setRoot').and.callThrough();
			spyOn(Inject.Nav,'push').and.callThrough();
			done();
		});
		it("Expect page to not be undefined", function(done) {
			expect(page).not.toBeNull();
			done();
		});
		it("Expect validation to fail", function(done) {
			page.form.user = ''
			page.form.pass = ''
			page.validator.validate();
			page.update();
			
			expect(page.validator.validate()).toBeFalsy();

			expect(page.page.html()).toContain("The User Name field is required.");
			expect(page.page.html()).toContain("The Password field is required.");
			done();
		});
		it("Expect validation to not fail", function(done) {
			page.form.user = 'santhi@nas.com'
			page.form.pass = 'testpass'
			page.update();
			expect(page.validator.validate()).toBeTruthy();
			done();
		});
		it("Expect Inject.API.login to have been called", function(done) {
			page.form.user = 'santhi@nas.com'
			page.form.pass = 'testpass'
			page.update();
			
			page.onLoginSubmit = ()=>{
				done();
			}
			page.onLoginClicked();
			//expect(Inject.API.login).toHaveBeenCalled();

		});

		/*it("Expect RegisterPage to open", function(done) {
			page.onRegisterClicked()
			expect(Inject.Nav.push).toHaveBeenCalled();
			done();
		});*/


	});
})