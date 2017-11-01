define([ "dojo/dom", "../widget/tabNavigation/tabNavigation", "dijit/registry", "dojox/mobile/ListItem",
	"dojox/gesture/tap", "dojo/base/lang", "dojo/on", "../js/Transitioner", "../widget/headerBar/headerBar",
	"../js/RemoteUpdateModule", "dijit/Dialog", "dojox/mobile/Button", "dojo/dom-construct", "dojo/query", "dojo/dom-style", "dojo/aspect"],
	function( dom, navigationHUDWidget, registry, ListItem, tap, lang, on, Transitioner, HeaderBar, RUM, Dialog, Button, Construct, query, style, aspect){

	var TierScreen = {

		navigationWidget: new Object,
		
		headerWidget: new Object,
		
		eventHandler:new Object,
	
		init: function(){
		
		TierScreen.headerWidget = new HeaderBar();
		
		TierScreen.pushListerner = aspect.after(window, "onNotificationGCM", lang.hitch(this, "updateUnreadBadge"), true);

		},
		
		beforeActivate: function(){
			
			var context = this;
			var naviPlaceHolder = dom.byId("TierHUD");
			var headerPlaceHolder = dom.byId("tierHeader");
			TierScreen.navigationWidget = new navigationHUDWidget();
			
			TierScreen.navigationWidget.connectButtonOnTap = function(e){
				Transitioner.zoomTo({element:e.currentTarget, newScreen:"feeds", event:e},null,"tier");
			};
			
			this.loadedStores.Enterprises.query({parentid:this.params.parentid}, {sort:[{attribute:'displayName', descending: true}]}).forEach(lang.hitch(this, "_addNewEnterpriseContentElement"));	
			var sector = this.loadedStores.Sectors.get(this.params.parentid);
			
			TierScreen.headerWidget.set('title', sector.displayName);
			TierScreen.headerWidget.set('backButtonText', 'Back');
			TierScreen.headerWidget.backButtonOnTap = lang.hitch(this, "_settingsButtonTap", this);
			
			
			TierScreen.navigationWidget.set("backButtonImageURL", "./images/lumiLogo_fill.png");
			TierScreen.navigationWidget.set("connectButtonBadgeValue", Number(window.unreadCount));
			TierScreen.navigationWidget.homeButtonOnTap = lang.hitch(this, "_homeButtonTap");
			TierScreen.navigationWidget.profileButtonOnTap = lang.hitch(this, "_profileButtonTap");
			
			////////// Temporary Fix for items being stuck behind the HUD 
			registry.byId("ContentList").addChild(new ListItem({style:{border:"none", background:"rgba(0,0,0,0)"}}),"last");
						
			TierScreen.navigationWidget.placeAt(naviPlaceHolder);
			TierScreen.headerWidget.placeAt(headerPlaceHolder);
			
			var context = this;
			TierScreen.eventHandler = lang.hitch(context, "_settingsButtonTap", context);
			
			document.addEventListener('backbutton', TierScreen.eventHandler, false);
			
		},
		
		afterDeactivate: function(){
			document.removeEventListener('backbutton', TierScreen.eventHandler, false);
			this._destroyAllContentItems();
			TierScreen.navigationWidget.destroyRecursive();
			//console.log("dead");
		},
		
		_addNewEnterpriseContentElement: function(ContentElement){
			
			var context = this;
			var notEmpty = false;
		
			var bodyListItem = new ListItem({label:ContentElement.displayName, icon: ContentElement.enterpriseLogo, rightIcon:"images/icons/actionTwo.png", rightIcon2:"images/icons/follow.png", variableHeight:true, style:{color:"black", background:"white"}});
				
			var rels = this.loadedStores.ConnectedEnterprises.query({ID: window.localStorage.getItem("userId") + "_" + ContentElement.companyRegistrationNumber});
					
			if(rels[0]){					
				if(rels[0].status == 1){
					bodyListItem = new ListItem({label:ContentElement.displayName, icon: ContentElement.enterpriseLogo, rightIcon:"images/icons/actionTwo.png", rightIcon2:"images/icons/following.png", variableHeight:true, style:{color:"black", background:"white"}});
				}else{
					bodyListItem = new ListItem({label:ContentElement.displayName, icon: ContentElement.enterpriseLogo, rightIcon:"images/icons/actionTwo.png", rightIcon2:"images/icons/follow.png", variableHeight:true, style:{color:"black", background:"white"}});
				}					
			}else{
				bodyListItem = new ListItem({label:ContentElement.displayName, icon: ContentElement.enterpriseLogo, rightIcon:"images/icons/actionTwo.png", rightIcon2:"images/icons/follow.png", variableHeight:true, style:{color:"black", background:"white"}});
			}
				
			//Construct.create("div", {innerHTML: TierScreen.sectorListItem.label, style:{fontSize:"0.8em", color:"gray", fontWeight:"normal"}}, bodyListItem.domNode, "last");
			registry.byId("ContentList").addChild(bodyListItem,0);
				
			bodyListItem.own(
				on(bodyListItem.domNode, tap, lang.hitch(context, "_delegateTap", ContentElement))
			);
				//notEmpty = true;
		},
		
		
		_delegateTap: function(enterprise,event){
		
			event.preventDefault();
			event.cancelBubble = true;
		
			var cssClass = event.target.className;
			
			switch(cssClass){
				case "mblImageIcon mblListItemRightIcon" :
				
				TierScreen._callButtonTapped(enterprise,event);
				
				break;
				case "mblImageIcon mblListItemRightIcon2" :
				
					var context = this;
					var Rum = new RUM(context);
					
					var rels = this.loadedStores.ConnectedEnterprises.query({ID: window.localStorage.getItem("userId") + "_" + enterprise.companyRegistrationNumber});
					
					if(rels[0]){
					
						if(rels[0].status == 1){
						
							var yesOnClick = function(dialog){
								dialog.hide();
									
								var promise = Rum.changeEnterpriseRelationship(window.localStorage.getItem("userId"),enterprise.companyRegistrationNumber,0);							
								var Item = Construct.create("img", {src:"./images/icons/ajax-loader.gif", class:"mblImageIcon mblListItemRightIcon2", style:{marginTop: "9px"}}, event.target, "replace");
								
								promise.then(function(){							
									rels[0].status = 0;							
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
							
								Construct.create("img", {src:"images/icons/following.png", class:"mblImageIcon mblListItemRightIcon2", style:{marginTop: "9px"}}, Item, "replace");
							
								rels[0].status = 1;
							
								//pro.stop();
								
							});
						
						}
					}else{
					
						var promise = Rum.createEnterpriseRelationship(window.localStorage.getItem("userId"),enterprise.companyRegistrationNumber,1), context = this;
							
						/*var pro = new ProgressIndicator.getInstance({center:true, size:26, removeOnStop:true, style:{float:"right", marginTop:"9px", position:"static"}}).placeAt(event.target, "replace");
						pro.start();*/
						
						var Item = Construct.create("img", {src:"./images/icons/ajax-loader.gif", class:"mblImageIcon mblListItemRightIcon2", style:{marginTop: "9px"}}, event.target, "replace");
						
						promise.then(function(){
						
							Construct.create("img", {src:"images/icons/following.png", class:"mblImageIcon mblListItemRightIcon2", style:{marginTop: "9px"}}, Item, "replace");
						
							//pro.stop();
							
							Rum.update('connected');
							
						});
					
					}
					
				break;
				default : 
					Transitioner.zoomTo({element:event.target, newScreen:"enterprise", event:event},enterprise.id, "tier");
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
		
		_destroyAllContentItems: function(){
		
			registry.byId("ContentList").destroyDescendants();
			
		},
		
		_homeButtonTap: function(e){
			Transitioner.zoomTo({element:e.currentTarget, newScreen:"home", event:e},this.params.parentid,"tier", 0);
		},
		
		_profileButtonTap: function(e){
			Transitioner.zoomTo({element:e.currentTarget, newScreen:"profile", event:e},this.params.parentid,"tier", 0);
		},		
		
		_settingsButtonTap: function(context, e){
				Transitioner.zoomTo({element:context.domNode, newScreen:"home", event:e, direction: -1},context.params.parentid, "tier", 0);
		},
		
		updateUnreadBadge: function(){
			TierScreen.navigationWidget.set("connectButtonBadgeValue", Number(window.unreadCount));
		}
	
	};

return TierScreen;
});