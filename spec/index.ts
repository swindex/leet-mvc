document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady(): void {
	document.addEventListener('ready', function(){
		init();
	});
}

function init(): void {
	console.log("Initialized")
}