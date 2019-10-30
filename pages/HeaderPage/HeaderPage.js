
import './HeaderPage.scss';
import { BasePage } from '../BasePage';

/**
 * A page with header and menu and back buttons
 */
export class HeaderPage extends BasePage{
	constructor(){
		super();
		this.backButton = false;
		this.menuButton = false;
		this.refreshButton = false;
		this.searchButton = false;
		
		this.title = null;

		//content directive
		this.content = null;
		//footer directive
		this.footer = null;
		this.showFooter = false;

		this.serviceProvider_id = null;

		//header directive
		this.header=`
			<button id="backButton" [if]="this.backButton" onclick = "this.onBackButtonClicked()"><i class="fas fa-arrow-left"></i></button>
			<button id="menuButton" [if]="this.menuButton" onclick = "this.onMenuButtonClicked()"><i class="fas fa-bars"></i></button>
			<span class="headertitle" [innerhtml]="this.title"></span>
			<span class="logo" [if]="!this.title"></span>
			<button id="refreshButton" [if]="this.refreshButton" [class]="this.refreshButtonRotating ? 'rotating' : null" onclick = "this.onRefreshButtonClicked()"><i class="fas fa-sync-alt"></i></button>
			<button id="searchButton" [if]="this.searchButton" onclick = "this.onSearchButtonClicked()"><i class="fas fa-search"></i></button>
		`;
	}

	/**
	 * ***Override***
	 */
	onBackButtonClicked(){
		this.destroy();
	}
	/**
	 * ***Override***
	 */
	onMenuButtonClicked(){
		console.log("Override me : onMenuButtonClicked");
	}
	/**
	 * ***Override***
	 */
	onRefreshButtonClicked(){
		console.log("Override me : onRefreshButtonClicked");
	}
	/**
	 * ***Override***
	 */
	onSearchButtonClicked(){

	}

	get template(){
		return this.extendTemplate(super.template, template);
	}

	/**
	 * ***OverrideCallSuper***
	 */
	/*resize(windowSize){
		var h = $(this.page).height();
		var header = this.page.find('>.header').height();
		var footer = this.page.find('>.footer').height();

		h -= !empty(header) ? header : 0 ;
		h -= !empty(footer) ? footer : 0 ;

		this.page.find('.content').css('height', h +'px');

		super.resize(windowSize);
	}*/


}
HeaderPage.className = 'page-HeaderPage';
var template = `
	<div class="header" [if]="this.header">
		<div [directive] = "this.header"></div>
	</div>
	<div class="content">
		<div [directive] = "this.content"></div>
	</div>

	<div class="footer" [if]="this.footer && this.showFooter">
		<div [directive] = "this.footer"></div>
	</div>
`