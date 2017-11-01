define(["dojox/gesture/tap", "dojo/dom", "dojo/on", "../js/Transitioner", "dojo/base/lang", 
		"dojox/mobile/Badge", "dojo/dom-style","../widget/tabNavigation/tabNavigation", "../widget/headerBar/headerBar", 
		"dojox/mobile/ListItem", "dijit/registry", "dojox/mobile/EdgeToEdgeCategory", "dojo/dom-construct", "dojox/mobile/ProgressIndicator",
		"../js/RemoteUpdateModule", "dojox/mobile/Button", "dijit/Dialog", "dojo/query", "dojo/dom-style", "dojo/aspect"], 
	function(tap, dom, on, Transitioner, lang, badge, domStyle, tabNavigation, HeaderBar, ListItem, registry, Category, Construct, ProgressIndicator, RUM, Button, Dialog, query, style, aspect){
	var myOrganisationsScreen = {
		
		navigationWidget: new Object,
		
		headerWidget: new Object,
		
		eventHandler: new Object,
		
		init: function(){
			myOrganisationsScreen.navigationWidget = new tabNavigation();
			myOrganisationsScreen.headerWidget = new HeaderBar();
			
			myOrganisationsScreen.navigationWidget.connectButtonOnTap = lang.hitch(this, "_connectTap");
			myOrganisationsScreen.navigationWidget.profileButtonOnTap = lang.hitch(this, "_profileButtonTap");
			
			myOrganisationsScreen.pushListerner = aspect.after(window, "onNotificationGCM", lang.hitch(this, "updateUnreadBadge"), true);
			
		},
	
		beforeActivate: function(){
		
			var naviPlaceHolder = dom.byId("myOrganisationsTab");
			var headerPlaceHolder = dom.byId("myOrganisationsHeader");
			
			myOrganisationsScreen.headerWidget.set('title', 'My Organisations');
			myOrganisationsScreen.headerWidget.set('backButtonText', 'Back');
			myOrganisationsScreen.headerWidget.set('backButtonImgVisible', true);
			myOrganisationsScreen.headerWidget.backButtonOnTap = lang.hitch(this, "_settingsButtonTap", this);
			myOrganisationsScreen.headerWidget.set('contextButtonVisible', false);
			
			myOrganisationsScreen.navigationWidget.set("backButtonImageURL", "./images/lumiLogo_fill.png");
			myOrganisationsScreen.navigationWidget.set("connectButtonBadgeValue", Number(window.unreadCount));
			myOrganisationsScreen.navigationWidget.homeButtonOnTap = lang.hitch(this, "_homeButtonTap");
			
			myOrganisationsScreen.navigationWidget.placeAt(naviPlaceHolder);
			myOrganisationsScreen.headerWidget.placeAt(headerPlaceHolder);
			
			this.loadedStores.Sectors.query(null, {sort:[{attribute:"displayName", descending: true}]}).forEach(lang.hitch(this, "_addNewSectorElement"));
			registry.byId("myOrgsList").addChild(new ListItem({style:{color:"black", background:"rgba(0,0,0,0)", border:"none"}}),"last");
			
			var context = this;
			myOrganisationsScreen.eventHandler = lang.hitch(context, "_settingsButtonTap", context);
			
			document.addEventListener('backbutton', myOrganisationsScreen.eventHandler, false);
			
		},
		
		beforeDeactivate: function(){
			document.removeEventListener('backbutton', myOrganisationsScreen.eventHandler, false);
			myOrganisationsScreen._destroyAllContentItems();
		},
		
		_addEnterpriseElement: function(Sector, Enterprise){
			var context = this;
			var notEmpty = false;
		
			this.loadedStores.ConnectedEnterprises.query({ID: window.localStorage.getItem("userId") + "_" + Enterprise.companyRegistrationNumber, status:1}).forEach(function(result){
				var bodyListItem = new ListItem({label:Enterprise.displayName, icon: Enterprise.enterpriseLogo, rightIcon:"images/icons/actionTwo.png", rightIcon2:"images/icons/following.png", variableHeight:true, style:{color:"black", background:"white"}});
				
				Construct.create("div", {innerHTML: Sector.displayName, style:{fontSize:"0.8em", color:"gray", fontWeight:"normal"}}, bodyListItem.domNode, "last");
				registry.byId("myOrgsList").addChild(bodyListItem,0);
				
				bodyListItem.own(
					on(bodyListItem.domNode, tap, lang.hitch(context, "_delegateTap", Enterprise, result))
				);
				//notEmpty = true;
			});
			
			if(notEmpty){
				var sectorListItem = new Category({label:Sector.displayName, style:{color:"black", background:"rgba(0,0,0,0)", border:"none", fontWeight:"normal"}});
				registry.byId("myOrgsList").addChild(sectorListItem, 0);
			}
		
		},
		
		_addNewSectorElement: function(Sector){			
			this.loadedStores.Enterprises.query({parentid: Sector.id}, {sort: [{attribute:"displayName", descending: true}]}).forEach(lang.hitch(this, "_addEnterpriseElement", Sector));
			
		},
		
		_delegateTap: function(enterprise, relation,event){
		
			event.preventDefault();
			event.cancelBubble = true;
		
			var cssClass = event.target.className;
			
			switch(cssClass){
				case "mblImageIcon mblListItemRightIcon" :
				
				myOrganisationsScreen._callButtonTapped(enterprise,event);
				
				break;
				case "mblImageIcon mblListItemRightIcon2" :
				
					var context = this;
					var Rum = new RUM(context);
					
					if(relation.status == 1){
					
						var yesOnClick = function(dialog){
							dialog.hide();
								
							var promise = Rum.changeEnterpriseRelationship(window.localStorage.getItem("userId"),enterprise.companyRegistrationNumber,0);							
							var Item = Construct.create("img", {src:"./images/icons/ajax-loader.gif", class:"mblImageIcon mblListItemRightIcon2", style:{marginTop: "9px"}}, event.target, "replace");
							
							promise.then(function(){							
								relation.status = 0;							
								Construct.create("img", {src:"images/icons/follow.png", class:"mblImageIcon mblListItemRightIcon2", style:{marginTop: "9px"}}, Item, "replace");
							});
						};
						
						var dialog = new Dialog({title : "Remove Organisation?", content: "<p>Removing an organisation from your My Organisations list means that they can no longer send you direct messages.</p><p>You can re-add an organisation at any time by tapping on the + next to their name.</p>", class:"claro", daggable:false, style:{color: "black", border:"black 2px solid", textAlign:"center"}});
						var btnOk = new Button({label: "OK", onClick: function(){yesOnClick(dialog, context)}, style:{color: "black", backgroundColor:"rgba(0,0,0,0)", border:"black 2px solid", width:"30%", height:"15%", backgroundImage:"none",borderRadius:"0px", fontSize:"1.1em", margin:"5%"}}).placeAt(dialog);
						var btnCancel = new Button({label: "Cancel", onClick: function(){dialog.hide()}, style:{color: "black", backgroundColor:"rgba(0,0,0,0)", border:"black 2px solid", width:"30%", height:"15%", backgroundImage:"none",borderRadius:"0px", fontSize:"1.1em", margin:"5%"}}).placeAt(dialog);
						query(".dijitDialogPaneContent").forEach(function(node){
							style.set(node, {fontSize:"smaller"});
						});
						dialog.show();
						query(".dijitDialogTitleBar").forEach(function(node){
							style.set(node, {backgroundColor:"black", border:"none", backgroundImage:"none", color:"white", textAlign:"left"});
						});
						query(".dijitDialogTitle").forEach(function(node){
							style.set(node, {color:"white"});
						});
					
					
					}else{
					
						var promise = Rum.changeEnterpriseRelationship(window.localStorage.getItem("userId"),enterprise.companyRegistrationNumber,1), context = this;
						
						/*var pro = new ProgressIndicator.getInstance({center:true, size:26, removeOnStop:true, style:{float:"right", marginTop:"9px", position:"static"}}).placeAt(event.target, "replace");
						pro.start();*/
						
						var Item = Construct.create("img", {src:"./images/icons/ajax-loader.gif", class:"mblImageIcon mblListItemRightIcon2", style:{marginTop: "9px"}}, event.target, "replace");
						
						promise.then(function(){
						
							relation.status = 1;
						
							Construct.create("img", {src:"images/icons/following.png", class:"mblImageIcon mblListItemRightIcon2", style:{marginTop: "9px"}}, Item, "replace");
						
							//pro.stop();
							
						});
					
					}
					
				break;
				default : 
					Transitioner.zoomTo({element:event.target, newScreen:"enterprise", event:event},enterprise.id, "myOrganisations");
				break;
			
			}
		},
		
		_callButtonTapped:function(enterprise, event){
		
			var phoneNumber = enterprise.contactNumber || "+27 12 665 3638";
		
			this._createDialog("This is a cellular call and will be charged according to your service provider agreement","tel:" + phoneNumber,"Ok","Cancel", enterprise);
		},
		
		_createDialog: function(text,href,btnOk,btnCancle, enterprise){
			var dialog = new Dialog({title : "Cellular Call", content: text + "<br />", class:"claro", daggable:false, style:{color: "black", border:"black 2px solid", textAlign:"center"}});
			var btnOk = new Button({label: btnOk, onClick: lang.hitch(this, "_makeCall", href, dialog, enterprise), style:{color: "black", backgroundColor:"rgba(0,0,0,0)", border:"black 2px solid", width:"35%", height:"30%", backgroundImage:"none",borderRadius:"0px", margin:"5%", fontSize:"1.1em"}}).placeAt(dialog);
			var btnCancle = new Button({label:btnCancle, onClick: function(){dialog.hide()}, style:{color: "black", backgroundColor:"rgba(0,0,0,0)", border:"black 2px solid", width:"35%", height:"30%", backgroundImage:"none",borderRadius:"0px", margin:"5%", fontSize:"1.1em"}}).placeAt(dialog);
			dialog.show();
			query(".dijitDialogTitleBar").forEach(function(node){
				style.set(node, {backgroundColor:"black", border:"none", backgroundImage:"none", color:"white", textAlign:"left"});
			});
			query(".dijitDialogTitle").forEach(function(node){
				style.set(node, {color:"white"});
			});
			
		},
		
		_makeCall: function(href, dialog, enterprise){
			var Rum = new RUM(this);
			
			var enterpriseId = enterprise.id;
			var enterpriseNumber = enterprise.contactNumber;
			
			var callLog = Rum.logGSMCallBreakOut(window.localStorage.getItem('userId'), enterpriseId, enterpriseNumber);
			
			callLog.then(function(){
				//console.log("Engage Call Logged");
				dialog.hide();
			document.location.href = href;
			});
		},
		
		_connectTap: function(){
			Transitioner.zoomTo({element:event.currentTarget, newScreen:"feeds", transition:"none", event:event, direction: -1},null,"myOrganisations");
		},
		
		_profileButtonTap: function(e){
			Transitioner.zoomTo({element:e.currentTarget, newScreen:"profile", transition:"none", event:e},1,"myOrganisations", 0);
		},
		
		_settingsButtonTap: function(context, e){
				Transitioner.zoomTo({element:context.domNode, newScreen:"home", event:e, direction: -1},context.params.parentid, "myOrganisations", 0);
		},
		
		_homeButtonTap: function(e){
			Transitioner.zoomTo({element:e.currentTarget, newScreen:"home", event:e},0,"enterprise", 0);
		},
		
		_destroyAllContentItems: function(){
			registry.byId("myOrgsList").destroyDescendants();
		},
		
		updateUnreadBadge: function(){
			myOrganisationsScreen.navigationWidget.set("connectButtonBadgeValue", Number(window.unreadCount));
		}
		
	}
	
	return myOrganisationsScreen;
});