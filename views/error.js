define(["dojox/gesture/tap", "dojo/dom", "dojo/on", "../js/Transitioner", "dojo/base/lang", "../widget/headerBar/headerBar"], 
	function(tap, dom, on, Transitioner, lang, HeaderBar){
	var errorScreen = {
		
		headerWidget: new Object,
		
		init: function(){
			
			errorScreen.headerWidget = new HeaderBar();
			
		},
	
		beforeActivate: function(){
			var headerPlaceHolder = dom.byId("errorHeader");
			
			errorScreen.headerWidget.set('title', 'Error');
			errorScreen.headerWidget.set('backButtonText', ' ');
			errorScreen.headerWidget.set('backButtonImgVisible', false);
			errorScreen.headerWidget.placeAt(headerPlaceHolder);
			
			var retry = dom.byId("retry");
			
			this.own(
				on(retry, tap, lang.hitch(this, "retry"))
			);
		
		},
		
		retry : function(e){
			if(navigator.splashscreen){
				navigator.splashscreen.show();
			}
			Transitioner.zoomTo({element:e.currentTarget, newScreen:"walkthrough", transition:"none", event:e},0, "error", 0);
		
		},
		
	}
	
	return errorScreen;
});