// @ts-nocheck
import { NavController } from "../../core/NavController";
import { Injector } from "../../core/Injector";
import { LoginPage } from "../../pages/LoginPage/LoginPage";

var Inject = Injector.implement({
	Nav: null,
})

Inject.Nav = new NavController();

var page: LoginPage = null;
describe("Page Login", function() {
	describe("Display", function() {
		var spy: any;
		beforeEach(function(done) {
			page = Inject.Nav.setRoot(LoginPage);
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
		});
	});
})