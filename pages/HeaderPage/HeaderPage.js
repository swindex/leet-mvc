
import './HeaderPage.scss';
import { BasePage } from '../BasePage';

/**
 * A page with header and menu and back buttons
 */
export class HeaderPage extends BasePage{
	constructor(Page){
		super(Page);
		this.backButton = false;
		this.menuButton = false;
		this.refreshButton = false;

		this.title = null;
		this.content = null
		this.footer = null;
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

}
HeaderPage.className = 'page-HeaderPage';
HeaderPage.template = `
	<div class="header">
		<button id="backButton" [if]="this.backButton" onclick = "this.onBackButtonClicked()"><i class="fas fa-arrow-left"></i></button>
		<button id="menuButton" [if]="this.menuButton" onclick = "this.onMenuButtonClicked()"><i class="fas fa-bars"></i></button>
		<span class="headertitle" [innerHTML]="this.title"></span>
		<span class="logo" [if]="!this.title"></span>
		<button id="refreshButton" [if]="this.refreshButton" [class]="this.refreshButtonRotating ? 'rotating' : null" onclick = "this.onRefreshButtonClicked()"><i class="fas fa-sync-alt"></i></i></button>
	</div>
	<div class="content" [directive] = "this.content">
	</div>

	<div class="footer" [if]="this.footer" >
		<div [directive] = "this.footer">
		</div>
	</div>
`