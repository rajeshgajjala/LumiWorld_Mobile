
require(["dojo/json", "dojox/app/main", "dojo/text!./testapp.json", "dojo/dom", "dojo/dom-construct", "dojo/sniff", "dojo/request"],
function(json, Application, configx, dom, domConstruct, has, request){


	var init = function(){
		Application(
			json.parse(configx, true)
		);
		var splash = dom.byId("splash");
		domConstruct.destroy(splash);
		window.localStorage.setItem("version", "0.5.28.125");
		window.unreadCount = 0;

		if(has("cordova")){
			require(["plugin/PushNotification.js"],function(){
				document.addEventListener("deviceready", function(){
					try{
						pushNotification = window.plugins.pushNotification;
                                                if(device.platform == 'android' || device.platform == 'Android'){
                                                    pushNotification.register(successHandler, errorHandler, {"senderID":"48445117482","ecb":"onNotificationGCM"});// required!
                                                }else{
                                                    pushNotification.register(tokenHandler, errorHandler, {"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN" });
                                                }
					}
					catch(err)
					{
						txt="There was an error on this page.\n\n";
						txt+="Error description: " + err.message + "\n\n";
						alert(txt);
					}
				});
			});
		}
	};

init();
	/*request("../dcordova/sniff.js").then(function(){
		// cordova project is here, sniff cordova features and load the app
		require(["dcordova/sniff"], function(){
			init();
		});
	}, function(){
		// cordova project is not here, directly load the app
		init();
	});*/

});

// handle GCM notifications for Android
function onNotificationGCM(e) {

	require(["dojo/query"],function(query){
		switch( e.event )
		{
			case 'registered':
			if ( e.regid.length > 0 )
			{
				//add to app object and store on device for later use
				window.localStorage.setItem("gcmId",e.regid);
			}
			break;

			case 'message':
				// if this flag is set, this notification happened while we were in the foreground.
				// you might want to play a sound to get the user's attention, throw up a dialog, etc.
				if (e.foreground)
				{
					// if the notification contains a soundname, play it.
					//var my_media = new Media("/android_asset/www/"+ e.soundname);
					//my_media.play();
					console.log(e);

					window.unreadCount = Number(window.unreadCount)+1;

					/*query("mblBadge mblDomButtonRedBadge mblDomButton").forEach(function(node){
						node.children[0].innerHTML = window.sessionStorage.unreadCount;
					});*/

				}
				else
				{	// otherwise we were launched because the user touched a notification in the notification tray.
					if (e.coldstart){
						console.log("Cold Start");
					}
				}
			break;

			case 'error':
				//Must Put some kind of error message here
			break;

			default:
				// No clue how to handle this yet
			break;
		}

	});

}

function successHandler (result) {
	console.log("Success");
}

function tokenHandler (result) {
	console.log(result);
        window.localStorage.setItem("gcmId",result);
}

function errorHandler (error) {
	console.log("Fail");
}
