define(["dojox/gesture/tap", "dojo/dom", "dojo/on", "../js/Transitioner", "dojo/base/lang", 
		"dojox/mobile/Badge", "dojo/dom-style","../widget/tabNavigation/tabNavigation", "../widget/headerBar/headerBar", 
		"dojox/mobile/ListItem", "dijit/registry", "dojox/mobile/EdgeToEdgeCategory", "dojo/aspect"], 
	function(tap, dom, on, Transitioner, lang, badge, domStyle, tabNavigation, HeaderBar, ListItem, registry, Category, aspect){
	var homeScreen = {
		
		navigationWidget: new Object,
		
		headerWidget: new Object,
		
		eventHandlers : new Array,
		
		init: function(){
			homeScreen.navigationWidget = new tabNavigation();
			
			homeScreen.headerWidget = new HeaderBar();
			
			this.loadedStores.Sectors.query(null, {sort:[{attribute:"id", descending: false}]}).forEach(lang.hitch(this, "_addNewSectorElement"));
			
			var categoryListItem = new Category({style:{backgroundColor:"rgba(0,0,0,0)", backgroundImage:"none", border:"none"}});
			registry.byId("SectorList").addChild(categoryListItem,0);
			
			var bodyListItem = new ListItem({label:"My Organisations", style:{color:"black", background:"white"}, moveTo:"#"});
			registry.byId("SectorList").addChild(bodyListItem,0);
			
			bodyListItem.own(
				on(bodyListItem, tap, function(e){
					Transitioner.zoomTo({element:e.currentTarget, newScreen:"myOrganisations", event:e},1,"home");
				})
			);
			
			categoryListItem = new Category({style:{backgroundColor:"rgba(0,0,0,0)", backgroundImage:"none", border:"none"}});
			registry.byId("SectorList").addChild(categoryListItem,0);
			
			homeScreen.navigationWidget.connectButtonOnTap = lang.hitch(this, "_connectTap");
			homeScreen.navigationWidget.profileButtonOnTap = lang.hitch(this, "_profileButtonTap");
			
			aspect.after(window, "onNotificationGCM", lang.hitch(this, "updateUnreadBadge"), true);
			
		},
	
		beforeActivate: function(){
		
			var naviPlaceHolder = dom.byId("homeTab");
			var headerPlaceHolder = dom.byId("homeHeader");
			
			homeScreen.headerWidget.set('title', 'Lumi World');
			homeScreen.headerWidget.set('backButtonText', ' ');
			homeScreen.headerWidget.set('backButtonImgVisible', false);
			//homeScreen.headerWidget.backButtonOnTap = lang.hitch(this, "_settingsButtonTap");
			homeScreen.navigationWidget.set("backButtonImageURL", "./images/lumiLogo_fill.png");
			homeScreen.navigationWidget.set("connectButtonBadgeValue", Number(window.unreadCount));
			
			homeScreen.navigationWidget.placeAt(naviPlaceHolder);
			homeScreen.headerWidget.placeAt(headerPlaceHolder);
			
			var context = this;
			homeScreen.eventHandlers.push(lang.hitch(context, "_settingsButtonTap", context));
			
			document.addEventListener('backbutton', homeScreen.eventHandlers[0], false);
		
		},
		
		afterActivate: function(){
		//The following code is a fix for smaller android screens, Dojo forces a minimum height for the scrollable view, this in turn forces our Sector list behind the navigation bar
		//to solve this problem we will check the height of the Scrollable View, if its at the minimum (<300px) we will move the sector list up by 36px.
		
			var container = dom.byId("SectorListContainer");
			var computedStyle = domStyle.getComputedStyle(container);
			if(parseInt(computedStyle.height) < 300){
				domStyle.set(container, "margin-top", "");
			}
			domStyle.set(container, "height", (parseInt(computedStyle.height) - 36 + "px"));
			
		
		},
		
		beforeDeactivate: function(){
			document.removeEventListener('backbutton', homeScreen.eventHandlers[0], false);
		},
		
		_addNewSectorElement: function(Sector){
			
			var bodyListItem = new ListItem({label:Sector.displayName, style:{color:"black", background:"white"}, icon:"./images/icons/" + Sector.id + ".png", moveTo:"#"});
			registry.byId("SectorList").addChild(bodyListItem);
			
			
			bodyListItem.own(
				on(bodyListItem, tap, function(e){
					Transitioner.zoomTo({element:e.currentTarget, newScreen:"tier", event:e},parseInt(Sector.id),"home");
				})
			);
		},
		
		_connectTap: function(){
			Transitioner.zoomTo({element:event.currentTarget, newScreen:"feeds", transition:"none", event:event, direction: -1},null,"home");
		},
		
		_profileButtonTap: function(e){
			Transitioner.zoomTo({element:e.currentTarget, newScreen:"profile", transition:"none", event:e},1,"home", 0);
		},
		
		_settingsButtonTap: function(context, e){
				Transitioner.zoomTo({element:context.domNode, newScreen:context.params.settings, event:e, direction: -1},context.params.parentid, "home", 0);
		},
		
		updateUnreadBadge: function(){
			homeScreen.navigationWidget.set("connectButtonBadgeValue", Number(window.unreadCount));
		}
		
	}
	
	return homeScreen;
});