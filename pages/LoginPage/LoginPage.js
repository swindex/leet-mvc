import "./LoginPage.scss";
import { BasePage } from "./../BasePage";
import { FormValidator } from "./../../core/form_validator";
import { Translate } from "./../../core/Translate";
import { DeBouncer } from "./../../core/DeBouncer";

export class LoginPage extends BasePage {
	constructor(page){
		super(page)

		this.passwordType = "password";

		this.form={
			user:null, pass:null, remember: false
		};

		/** @type {FieldTemplate[]} */
		this.rules=[
			{name:"user", title:Translate('User_Name'), type:"text", validateRule:'required|min:2'},
			{name:'pass', title:Translate('Password'), type:"text", validateRule:'required|min:5'}
		]
		this.error={};

		this.validator = new FormValidator(this.form, this.rules, this.error,{});
		this.validateChanges = false;

		this.showLanguage = false;
		this.showLocation = false;
		this.regionName = "";

		this.isDev = false;
		this.version = "0.0.0";
	}
	onInit(){
		super.onInit(
			{
				change:(ev)=>{
					if (ev.target.name)
						this.validator.validateField(ev.target.name);
				}
			}
		);
	}

	init(){
		var logo = this.page.find('#logo');
		var login = this.page.find('#login');
		this.i_height = this.page.height();
		this.i_width = this.page.width();

		logo.height(this.i_height*0.35);
		login.height(this.i_height);

		this.backgroundSize = this.i_height*0.25+"px";

		//create 2 debouncers, so they do not cancel each other
		this.debouncer1 = DeBouncer.timeoutFirst(500);
		this.debouncer2 = DeBouncer.timeoutFirst(500);
	}

	onResize(){
		var h = this.page.height();
		var w = this.page.width();
		var logo = this.page.find('#logo');
		var dc = this.page.find('.content');
			
		if (h < this.i_height && w === this.i_width){
			//use debounce, so it does not fire too often
			this.debouncer1(()=>{
				dc.animate({ 'margin-top': -logo.height() }, 500 );	
			})
		}else{ 
			//use debounce, so it does not fire too often
			this.debouncer2(()=>{
				dc.animate({ 'margin-top': 0 }, 500 );	
			})
		}
	}
	validateForm(){
		this.validator.clearErrors();
		if (!this.validator.validate()){
			return false;
		}
		return true;
	}

	onLoginClicked(__e){
		if (!this.validateForm()){
			return;
		}

		this.onLoginSubmit({username:this.form.user,password: this.form.pass,remember: this.form.remember});
	};

	/** 
	 * ***Override***
	 * Called when form is validated and login data can be submitted
	 * @param {{username: string, password:string, remember: boolean}} data
	 * */
	onLoginSubmit(data){
		throw new Error("Override onLoginSubmit!");
	}

	onForgotClicked(){
		this.validator.clearErrors();
		this.onForgotSubmit({username:this.form.user,password: this.form.pass,remember: this.form.remember});
	};
	
	/** 
	 * ***Override***
	 * Called when Forgot Password is clicked
	 * @param {{username: string, password:string, remember: boolean}} data
	 * */
	onForgotSubmit(data){

	}

	/** 
	 * ***Override***
	 * Called when Register is clicked
	 */
	onRegisterClicked(){
		//this.Nav.push(RegisterPage);
	}

	/** 
	 * ***Override***
	 * Called when Language is clicked
	 */
	onLanguageClicked(){

	}
	/**
	 * ***Override***
	 * Called when location is clicked
	 */
	onLocationClicked(){}

	togglePasswordType(){
		this.passwordType = this.passwordType==="text" ? "password" : "text";
	}
};
LoginPage.selector = 'page-login';
LoginPage.template = `
<div class="content" >
	<div id="logo" [style]="{backgroundSize:this.backgroundSize}">
		<span bind="Translate('AppSlogan')"></span>
		<div ion-fab right top [if]="this.showLanguage">
			<button text-only onclick="this.onLanguageClicked()"><i class="fas fa-language"></i></button>
		</div>
		<div ion-fab left top [if]="this.showLocation">
			<button text-only onclick="this.onLocationClicked()" class="location"><i class="fas fa-globe"></i> {{ this.regionName }}</button>
		</div>
	</div>
	<div id="login">
		<form>
			<div class="fieldgroup" [class]="this.error.user ? 'has-error' : null">
				<span class="hint" [class]="this.error.user ? 'error' : null" bind="this.error.user"></span>
				<input autocapitalize="off" autocorrect="off" spellcheck="false" autocomplete="off" type="text" bind="this.form.user" name="user" [attribute]="{placeholder:Translate('User_Name')}" value="">
			</div>
			<div class="fieldgroup" [class]="this.error.pass ? 'has-error' : null">
				<span class="hint" [class]="this.error.pass ? 'error' : null" bind="this.error.pass"></span>
				<input autocapitalize="off" autocorrect="off"  spellcheck="false" autocomplete="current-password" [attribute]="{type: this.passwordType,placeholder:Translate('Password')}" bind="this.form.pass" name="pass" value="">
				<div class="icon" onclick="this.togglePasswordType($event)" onmousedown="$event.preventDefault()">
					<i class="fas fa-eye" [if]="this.passwordType=='password'"></i>
					<i class="fas fa-eye-slash" [if]="this.passwordType=='text'"></i>
				</div>	
			</div>
			<div class="fieldgroup">
				<label class="toggle">
					<b bind = "Translate('Remember me')"></b>
					<input type="checkbox" bind="this.form.remember">
					<span class="slider round"></span>
				</label>
			</div>
			<div class="fieldgroup">
				<button type="button"  onclick="this.onLoginClicked()"><b bind = "Translate('SIGN IN')"></b></button>
			</div>
			<div class="fieldgroup">
				<label onclick="this.onForgotClicked()" class="centered" bind = "Translate('Forgot Password?')"></label>
			</div>
		</form>	
	</div>
	<div class="dev_label" [if]="this.isDev">d{{this.version}}</div>
</div>
`;
