define(["dojox/gesture/tap", "dojo/dom", "dojo/on", "dojo/dom-construct", "../js/Transitioner", "dojo/base/lang", 
		"dojox/mobile/Badge", "dojo/dom-style","../widget/tabNavigation/tabNavigation", "../widget/headerBar/headerBar", 
		"dojox/mobile/ListItem", "dijit/registry", "dojo/aspect"], 
	function(tap, dom, on, domConstruct, Transitioner, lang, badge, domStyle, tabNavigation, HeaderBar, ListItem, registry, aspect){
	var aboutScreen = {
		
		navigationWidget: new Object,
		
		headerWidget: new Object,
		
		eventHandler: new Object,
		
		init: function(){
			aboutScreen.navigationWidget = new tabNavigation();
			
			aboutScreen.headerWidget = new HeaderBar();
			aboutScreen.navigationWidget.connectButtonOnTap = lang.hitch(this, "_connectTap");
			aboutScreen.navigationWidget.profileButtonOnTap = lang.hitch(this, "_profileButtonTap");
			aboutScreen.navigationWidget.homeButtonOnTap= lang.hitch(this, "_homeButtonTap");
			
			dom.byId("versionText").innerHTML = "Version " + window.localStorage.getItem("version");
			
			aspect.after(window, "onNotificationGCM", lang.hitch(this, "updateUnreadBadge"), true);
			
		},
	
		beforeActivate: function(){
		
			var naviPlaceHolder = dom.byId("aboutTab");
			var headerPlaceHolder = dom.byId("aboutHeader");
			
			aboutScreen.headerWidget.set('title', 'About');
			aboutScreen.headerWidget.set('backButtonText', 'Back');
			aboutScreen.headerWidget.backButtonOnTap = lang.hitch(this, "_settingsButtonTap", this);
			aboutScreen.navigationWidget.set("profileButtonImageURL", "./images/ProfileLogo_fill.png");
			aboutScreen.navigationWidget.set("connectButtonBadgeValue", Number(window.unreadCount));
			
			aboutScreen.navigationWidget.placeAt(naviPlaceHolder);
			aboutScreen.headerWidget.placeAt(headerPlaceHolder);
			
			/*if(window.innerHeight < 410){
				var img = dom.byId("imgSplash");
				domStyle.set(img, "height", "100%");
				domStyle.set(img, "position", "static");
				
				domStyle.set(dom.byId("websiteText"), "color", "white");
				domStyle.set(dom.byId("otherText"), "color", "white");
			}*/
			
			var context = this;
			aboutScreen.eventHandler = lang.hitch(context, "_settingsButtonTap", context);
			
			document.addEventListener('backbutton', aboutScreen.eventHandler, false);
			
		},
		
		beforeDeactivate: function(){
			document.removeEventListener('backbutton', aboutScreen.eventHandler, false);
		},
		
		_connectTap: function(){
			Transitioner.zoomTo({element:event.currentTarget, newScreen:"feeds", event:event, direction: -1},null,"about");
		},
		
		_homeButtonTap: function(e){
			Transitioner.zoomTo({element:e.currentTarget, newScreen:"home", event:e, direction: -1},1,"about", 0);
		},
		
		_profileButtonTap: function(e){
			Transitioner.zoomTo({element:e.currentTarget, newScreen:"profile", event:e},1,"about", 0);
		},
		
		_settingsButtonTap: function(context, e){
				Transitioner.zoomTo({element:context.domNode, newScreen:context.params.settings, event:e, direction: -1},context.params.parentid, "about", 0);
		},
		
		updateUnreadBadge: function(){
			aboutScreen.navigationWidget.set("connectButtonBadgeValue", Number(window.unreadCount));
		}
		
	}
	
	return aboutScreen;
});