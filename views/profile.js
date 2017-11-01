define(["../js/Transitioner", "dojo/base/lang","../widget/tabNavigation/tabNavigation", "../widget/headerBar/headerBar","dojo/dom",
		"dijit/registry", "dojo/on", "dojox/gesture/tap", "dojo/json","dojo/request/xhr",
		"dijit/Dialog", "dijit/form/Button", "dojox/mobile/ListItem", "dojo/aspect", "dojo/dom-style",
		"../js/RemoteUpdateModule"], 
	function(Transitioner, lang, tabNavigation, HeaderBar,dom,registry, on, tap, json, xhr, Dialog, Button, ListItem, aspect, domStyle, RUM){
	var profileScreen = {
		
		navigationWidget: new Object,
		
		headerWidget: new Object,
		
		pushListerner : new Object,
		
		eventHandler: new Object,
		
		init: function(){
			profileScreen.navigationWidget = new tabNavigation();
			
			profileScreen.headerWidget = new HeaderBar();
			
			profileScreen.navigationWidget.connectButtonOnTap = lang.hitch(this, "_connectTap");
			
			profileScreen.navigationWidget.homeButtonOnTap = lang.hitch(this, "_homeButtonTap");
			
			profileScreen.pushListerner = aspect.after(window, "onNotificationGCM", lang.hitch(this, "updateUnreadBadge"), true);
			
		},
	
		beforeActivate: function(){
		
			var naviPlaceHolder = dom.byId("profileTab");
			var headerPlaceHolder = dom.byId("profileHeader");
			var submitBtn = dom.byId("updateProfileBtn");
			
			var context = this;
			
			profileScreen.headerWidget.set('title', 'Profile');
			profileScreen.headerWidget.set('backButtonText', ' ');
			//profileScreen.headerWidget.backButtonOnTap = lang.hitch(this, "_settingsButtonTap", this);
			profileScreen.headerWidget.set('backButtonImgVisible', false);
			
			profileScreen.navigationWidget.set("profileButtonImageURL", "./images/ProfileLogo_fill.png");
			profileScreen.navigationWidget.set("connectButtonBadgeValue", Number(window.unreadCount));
			
			var user = (window.localStorage.getItem("lastName") ? window.localStorage.getItem("lastName") + ", " : "");
			user = user + (window.localStorage.getItem("firstName") ? window.localStorage.getItem("firstName") + "<br />" : "");
			user = user + "<i>" + window.localStorage.getItem("displayName") + "</i>";
			
			var editProfileListItem = new ListItem({label:user, style:{color:"black", background:"white"},  variableHeight:true, moveTo:"#"});
			registry.byId("OptionsList").addChild(editProfileListItem);		
					
			registry.byId("OptionsList").addChild(new ListItem({header:true, style:{backgroundColor:"whitesmoke", backgroundImage:"none", border:"none", borderBottom:"1px solid rgb(151,157,163)"}}));
					
			var changePasswordListItem = new ListItem({label:"Change Password", style:{color:"black", background:"white"}, moveTo:"#"});
			registry.byId("OptionsList").addChild(changePasswordListItem);
			
			var supportListItem = new ListItem({label:"Support", style:{color:"black", background:"white"}, moveTo:"#"});
			registry.byId("OptionsList").addChild(supportListItem);
			
			registry.byId("OptionsList").addChild(new ListItem({header:true, style:{backgroundColor:"whitesmoke", backgroundImage:"none", border:"none", borderBottom:"1px solid rgb(151,157,163)"}}));
			
			var TCListItem = new ListItem({label:"Terms and Conditions", style:{color:"black", background:"white"}, moveTo:"#"});
			registry.byId("OptionsList").addChild(TCListItem);
			
			var aboutListItem = new ListItem({label:"About", style:{color:"black", background:"white"}, moveTo:"#"});
			registry.byId("OptionsList").addChild(aboutListItem);
			
			registry.byId("OptionsList").addChild(new ListItem({header:true, style:{backgroundColor:"whitesmoke", backgroundImage:"none", border:"none", borderBottom:"1px solid rgb(151,157,163)"}}));
			
			var logOutListItem = new ListItem({label:"Logout", style:{color:"black", background:"white"}});
			registry.byId("OptionsList").addChild(logOutListItem);
			
			this.own(
				on(editProfileListItem, tap, function(e){Transitioner.zoomTo({element:e.currentTarget, newScreen:"editProfile", event:e},0,"profile")}),
				on(changePasswordListItem, tap, function(e){Transitioner.zoomTo({element:e.currentTarget, newScreen:"editPassword", event:e},0,"profile")}),
				on(aboutListItem, tap, function(e){Transitioner.zoomTo({element:e.currentTarget, newScreen:"about", event:e},0,"profile")}),
				on(TCListItem, tap, function(e){Transitioner.zoomTo({element:e.currentTarget, newScreen:"termsAndConditions", event:e},0,"profile")}),
				on(supportListItem, tap, lang.hitch(context, "_emailSupport")),
				on(logOutListItem, tap, lang.hitch(context, "logout"))
			);
			
			profileScreen.navigationWidget.placeAt(naviPlaceHolder);
			profileScreen.headerWidget.placeAt(headerPlaceHolder);
		
			var context = this;
			profileScreen.eventHandler = lang.hitch(context, "_settingsButtonTap", context);
			
			document.addEventListener('backbutton', profileScreen.eventHandler, false);
			
		},
		
		afterActivate: function(){
		//The following code is a fix for smaller android screens, Dojo forces a minimum height for the scrollable view, this in turn forces our Sector list behind the navigation bar
		//to solve this problem we will check the height of the Scrollable View, if its at the minimum (200px) we will move the sector list up by 48px.
		
			var container = dom.byId("OptionsListContainer");
			var computedStyle = domStyle.getComputedStyle(container);
			
			if(parseInt(computedStyle.height) < 300){
				domStyle.set(container, "margin-top", "none");
			}
			domStyle.set(container, "height", (parseInt(computedStyle.height) - 36 + "px"));
			
		
		},
		
		afterDeactivate:function(){
			document.removeEventListener('backbutton', profileScreen.eventHandler, false);
			profileScreen._destroyAllContentItems();
		},
		
		_destroyAllContentItems: function(){
			registry.byId("OptionsList").destroyDescendants();
		},
		
		_connectTap: function(){
			Transitioner.zoomTo({element:event.currentTarget, newScreen:"feeds", transition:"none", event:event, direction: -1},null,"profile");
		},
		
		_homeButtonTap: function(e){
			Transitioner.zoomTo({element:e.currentTarget, newScreen:"home", transition:"none", event:e, direction: -1},1,"profile", 0);
		},
		
		_settingsButtonTap: function(context, e){
			document.activeElement.blur();
			Transitioner.zoomTo({element:context.domNode, newScreen:context.params.settings, event:e, direction: -1},context.params.parentid, "profile", 0);
		},
		
		logout:function(e){
			
			var userId = window.localStorage.getItem("userId");
			
			window.localStorage.removeItem("userId");
			window.localStorage.removeItem("pWord");
			window.localStorage.removeItem("gcmId");
			window.localStorage.removeItem("firstName");
			window.localStorage.removeItem("lastName");
			window.localStorage.removeItem("displayName");
			
			var Rum = new RUM(this);
			
			Rum.loginUpdate(userId);
			
			this.loadedStores.Enterprises.nuke();
			this.loadedStores.NewsFeeds.nuke();
			Transitioner.zoomTo({element:e.currentTarget, newScreen:"walkthrough", event:e},0,"#");
		},
		
		_emailSupport: function(){
			var subject = encodeURI("Support Query for: " + window.localStorage.getItem("userId"));
			var body = encodeURI("Please help me this app does not work properly.");
			var href = "mailto:support@luminetgroup.com?subject=" + subject + "&" + body;
		
			document.location.href = href;
		},
		
		updateUnreadBadge: function(){
			profileScreen.navigationWidget.set("connectButtonBadgeValue", Number(window.unreadCount));
		}
		
	}
	
	return profileScreen;
});