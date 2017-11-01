define(["dojo/dom", "../widget/tabNavigation/tabNavigation", "dijit/registry", "dojox/mobile/ListItem",
	"dojox/gesture/tap", "dojo/base/lang", "dojo/on", "../widget/EnterpriseHeader/EnterpriseHeader","../js/Transitioner",
	"dijit/Dialog", "dojo/base/window", "dojox/mobile/Button", "../widget/headerBar/headerBar",
	"../js/RemoteUpdateModule", "dojo/dom-construct", "dojo/query", "dojo/dom-style"],
	function(dom, navigationHUDWidget, registry, ListItem, tap, lang, on, EnterpriseHeader, Transitioner, Dialog, win, Button, HeaderBar, RUM, domConstruct, query, style){

	var EnterpriseScreen = {

		//navigationWidget: new Object,
		
		enterpriseHeaderWidget: new Object,
		
		headerWidget: new Object,
		
		thisEnterprise: new Object,
		
		connectedID: new Object,
		
		eventHandler: new Object,
		
		imageBaseUrl: "./images/logos/",
	
		init: function(){
	
			//EnterpriseScreen.navigationWidget = new navigationHUDWidget();
			EnterpriseScreen.enterpriseHeaderWidget = new EnterpriseHeader();
			EnterpriseScreen.headerWidget = new HeaderBar();
		},
		
		beforeActivate: function(){
			
			var context = this;
			var naviPlaceHolder = dom.byId("EnterpriseHUD");
			var headerPlaceHolder = dom.byId("EnterpriseHeader");
			var headerBarPlaceHolder = dom.byId("enterpriseNavHeader");
			
			this.loadedStores.ServiceLookup.query({enterpriseID:this.params.parentid},{sort:[{attribute:"id", descending: false}]}).forEach(function(result){
				context.loadedStores.Services.query({id:result.serviceID}).forEach(lang.hitch(context, "_addNewServiceElement"));
			});
			
			this.loadedStores.Enterprises.get(this.params.parentid).then(function(result){
			
				EnterpriseScreen.thisEnterprise = result;
				
				//header Bar Initialization
				EnterpriseScreen.headerWidget.set('title', EnterpriseScreen.thisEnterprise.displayName);
				EnterpriseScreen.headerWidget.set('backButtonText', 'Back');	
				EnterpriseScreen.headerWidget.backButtonOnTap = lang.hitch(context, "_settingsButtonTap", context);
				EnterpriseScreen.headerWidget.placeAt(headerBarPlaceHolder);		

				//Bottom Navigation Widget Initialization
				/*EnterpriseScreen.navigationWidget.connectButtonOnTap = function(e){
					Transitioner.zoomTo({element:e.currentTarget, newScreen:"feeds", event:e});
				};
				
				EnterpriseScreen.navigationWidget.set("backButtonImageURL", "./images/lumiLogo_fill.png");
				EnterpriseScreen.navigationWidget.profileButtonOnTap = lang.hitch(this, "_profileButtonTap");
				EnterpriseScreen.navigationWidget.homeButtonOnTap = lang.hitch(this, "_homeButtonTap");
				EnterpriseScreen.navigationWidget.placeAt(naviPlaceHolder);*/
				
				//Enterprise Header Initialization
				EnterpriseScreen.enterpriseHeaderWidget.set("enterpriseName", EnterpriseScreen.thisEnterprise.displayName);
				EnterpriseScreen.enterpriseHeaderWidget.set("enterpriseShort", EnterpriseScreen.thisEnterprise.shortDescription);
				EnterpriseScreen.enterpriseHeaderWidget.set("enterpriseLogoURL", EnterpriseScreen.thisEnterprise.enterpriseLogo || (EnterpriseScreen.imageBaseUrl + EnterpriseScreen.thisEnterprise.id + ".png"));
				EnterpriseScreen.enterpriseHeaderWidget.firstActionButtonClicked = lang.hitch(context, "_feedsButtonTapped");
				EnterpriseScreen.enterpriseHeaderWidget.secondActionButtonClicked = lang.hitch(context, "_callButtonTapped");
				
				EnterpriseScreen.enterpriseHeaderWidget.set("followButtonImage", "./images/icons/follow.png");
				//EnterpriseScreen.enterpriseHeaderWidget.set("followButtonLabel", "Add");
				EnterpriseScreen.enterpriseHeaderWidget.followButtonClicked = lang.hitch(context, "followEnterprise");
				
				context.loadedStores.ConnectedEnterprises.query({ID: window.localStorage.getItem("userId") + "_" + EnterpriseScreen.thisEnterprise.companyRegistrationNumber}).forEach(function(result){
					EnterpriseScreen.connectedID = result;
					console.log('result.status : ' + result.status);
					if(result.status == 1){
						EnterpriseScreen.enterpriseHeaderWidget.followButtonClicked = lang.hitch(context, "unfollowEnterprise");
						EnterpriseScreen.enterpriseHeaderWidget.set("followButtonImage", "./images/icons/following.png");
						//EnterpriseScreen.enterpriseHeaderWidget.set("followButtonLabel", "Remove");
					}
				});	
			
				EnterpriseScreen.enterpriseHeaderWidget.placeAt(headerPlaceHolder);
				
				var logoStyle = style.getComputedStyle(EnterpriseScreen.enterpriseHeaderWidget.enterpriseLogoNode);
					
				if(parseInt(logoStyle.height) <= 77){
					style.set(EnterpriseScreen.enterpriseHeaderWidget.enterpriseLogoNode, "margin-top", "0px")
				}
			});
			
			var context = this;
			EnterpriseScreen.eventHandler = lang.hitch(context, "_settingsButtonTap", context);
			
			document.addEventListener('backbutton', EnterpriseScreen.eventHandler, false);
			
		},
		
		beforeDeactivate: function(){
			document.removeEventListener('backbutton', EnterpriseScreen.eventHandler, false);
			EnterpriseScreen._destroyAllContentItems();
			EnterpriseScreen.connectedID = {};
		},
		
		_addNewServiceElement: function(ServiceElement){
			
//			if((ServiceElement.id != 1) &&  (ServiceElement.id != 2)){
				var bodyListItem = new ListItem({label:ServiceElement.displayName, style:{color:"black", textTransform:"capitalize", background:"white"}});
				registry.byId("ServiceList").addChild(bodyListItem);
			
				if(ServiceElement.url){
					bodyListItem.own(
						on(bodyListItem, tap, lang.hitch(EnterpriseScreen, "_ContentItemTap", ServiceElement.url))
					);
				}
				
				
//			}else
			if(ServiceElement.id == 1){
				EnterpriseScreen.headerWidget.set("actionButtonTwoVisible", true);
			}else if(ServiceElement.id == 2){
				EnterpriseScreen.headerWidget.set("actionButtonThreeVisible", false);
			}
			
		},
		
		_ContentItemTap: function(url, event){
			window.open(url, "_system");
		},
		
		_destroyAllContentItems: function(){
			registry.byId("ServiceList").destroyDescendants();
		},
		
		_feedsButtonTapped:function(event){
			event.stopPropagation();
			Transitioner.zoomTo({element:event.currentTarget, newScreen:"feeds", event:event},this.params.parentid, "enterprise",2);
		},
		
		_callButtonTapped:function(event){
		
			var phoneNumber = EnterpriseScreen.thisEnterprise.contactNumber || "";
			
			if(phoneNumber == ""){phoneNumber = "+27 12 665 3638";};
		
			this._createDialog("This is a cellular call and will be charged according to your service provider agreement","tel:" + phoneNumber,"Ok","Cancel");
		},
		
		_createDialog: function(text,href,btnOk,btnCancle){
			var dialog = new Dialog({title : "Cellular Call", content: text + "<br />", class:"claro", daggable:false, style:{color: "black", border:"black 2px solid", textAlign:"center"}});
			var btnOk = new Button({label: btnOk, onClick: lang.hitch(this, "_makeCall", href, dialog), style:{color: "black", backgroundColor:"rgba(0,0,0,0)", border:"black 2px solid", width:"35%", height:"30%", backgroundImage:"none",borderRadius:"0px", margin:"5%", fontSize:"1.1em"}}).placeAt(dialog);
			var btnCancle = new Button({label:btnCancle, onClick: lang.hitch(this, "_cancelDialog", dialog), style:{color: "black", backgroundColor:"rgba(0,0,0,0)", border:"black 2px solid", width:"35%", height:"30%", backgroundImage:"none",borderRadius:"0px", margin:"5%", fontSize:"1.1em"}}).placeAt(dialog);
			dialog.show();
			query(".dijitDialogTitleBar").forEach(function(node){
				style.set(node, {backgroundColor:"black", border:"none", backgroundImage:"none", color:"white", textAlign:"left"});
			});
			query(".dijitDialogTitle").forEach(function(node){
				style.set(node, {color:"white"});
			});
			
		},
		
		_makeCall: function(href, dialog){
			var Rum = new RUM(this);
			var context = this;
			
			var enterpriseId = EnterpriseScreen.thisEnterprise.id;
			var enterpriseNumber = EnterpriseScreen.thisEnterprise.contactNumber;
			
			var callLog = Rum.logGSMCallBreakOut(window.localStorage.getItem('userId'), enterpriseId, enterpriseNumber);
			
			callLog.then(function(){
				//console.log("Engage Call Logged");
				dialog.hide();
				document.location.href = href;
			},function(error){
				dialog.hide();
				var errDialog = new Dialog({title : "Cellular Call", content: "We could not connect to Lumi World please check you internet connectivity and try again.", class:"claro", daggable:false, style:{color: "black", border:"black 2px solid", textAlign:"center"}});
				var btnOk = new Button({label: "Retry", onClick: lang.hitch(context, "_makeCall", href, errDialog), style:{color: "black", backgroundColor:"rgba(0,0,0,0)", border:"black 2px solid", width:"35%", height:"30%", backgroundImage:"none",borderRadius:"0px", margin:"5%", fontSize:"1.1em"}}).placeAt(errDialog);
				errDialog.show();
				query(".dijitDialogTitleBar").forEach(function(node){
					style.set(node, {backgroundColor:"black", border:"none", backgroundImage:"none", color:"white", textAlign:"left"});
				});
				query(".dijitDialogTitle").forEach(function(node){
					style.set(node, {color:"white"});
				});
			});
		},
		
		_cancelDialog: function(dialog){
			dialog.hide();
		},
		
		followEnterprise: function(event){
		
			var Rum = new RUM(this);
		
			var rels = this.loadedStores.ConnectedEnterprises.query({ID: window.localStorage.getItem("userId") + "_" + EnterpriseScreen.thisEnterprise.companyRegistrationNumber});
					
			if(rels[0]){
				var promise = Rum.changeEnterpriseRelationship(window.localStorage.getItem("userId"),EnterpriseScreen.thisEnterprise.companyRegistrationNumber,1), context = this;
				
				EnterpriseScreen.enterpriseHeaderWidget.set("followButtonImage", "./images/icons/ajax-loader.gif");
				
				promise.then(function(){
				
					rels[0].status = 1;
					
					EnterpriseScreen.enterpriseHeaderWidget.set("followButtonImage", "./images/icons/following.png");
					//EnterpriseScreen.enterpriseHeaderWidget.set("followButtonLabel", "Remove");
					EnterpriseScreen.enterpriseHeaderWidget.followButtonClicked = lang.hitch(context, "unfollowEnterprise");
					
				},function(error){
					var dialog = new Dialog({title : "Cellular Call", content: "We could not connect to Lumi World please check you internet connectivity and try again.", class:"claro", daggable:false, style:{color: "black", border:"black 2px solid", textAlign:"center"}});
					var btnOk = new Button({label: "OK", onClick: function(){dialog.hide();}, style:{color: "black", backgroundColor:"rgba(0,0,0,0)", border:"black 2px solid", width:"35%", height:"30%", backgroundImage:"none",borderRadius:"0px", margin:"5%", fontSize:"1.1em"}}).placeAt(dialog);
					dialog.show();
					query(".dijitDialogTitleBar").forEach(function(node){
						style.set(node, {backgroundColor:"black", border:"none", backgroundImage:"none", color:"white", textAlign:"left"});
					});
					query(".dijitDialogTitle").forEach(function(node){
						style.set(node, {color:"white"});
					});
				});
				
			}else{
			
				var promise = Rum.createEnterpriseRelationship(window.localStorage.getItem("userId"),EnterpriseScreen.thisEnterprise.companyRegistrationNumber,1), context = this;
				
				EnterpriseScreen.enterpriseHeaderWidget.set("followButtonImage", "./images/icons/ajax-loader.gif");
				
				promise.then(function(){
				
					EnterpriseScreen.enterpriseHeaderWidget.set("followButtonImage", "./images/icons/following.png");
					//EnterpriseScreen.enterpriseHeaderWidget.set("followButtonLabel", "Remove");
					EnterpriseScreen.enterpriseHeaderWidget.followButtonClicked = lang.hitch(context, "unfollowEnterprise");
					
					Rum.update('connected');
					
				},function(error){
					var dialog = new Dialog({title : "Cellular Call", content: "We could not connect to Lumi World please check you internet connectivity and try again.", class:"claro", daggable:false, style:{color: "black", border:"black 2px solid", textAlign:"center"}});
					var btnOk = new Button({label: "OK", onClick: function(){dialog.hide()}, style:{color: "black", backgroundColor:"rgba(0,0,0,0)", border:"black 2px solid", width:"35%", height:"30%", backgroundImage:"none",borderRadius:"0px", margin:"5%", fontSize:"1.1em"}}).placeAt(dialog);
					dialog.show();
					query(".dijitDialogTitleBar").forEach(function(node){
						style.set(node, {backgroundColor:"black", border:"none", backgroundImage:"none", color:"white", textAlign:"left"});
					});
					query(".dijitDialogTitle").forEach(function(node){
						style.set(node, {color:"white"});
					});
				});
			
			}
			
		},
		
		unfollowEnterprise: function(){
		
			var Rum = new RUM(this);
		
			var rels = this.loadedStores.ConnectedEnterprises.query({ID: window.localStorage.getItem("userId") + "_" + EnterpriseScreen.thisEnterprise.companyRegistrationNumber});
		
			if(rels[0]){
				var context = this;
				var yesOnClick = function(dialog){
					dialog.hide();
					var promise = Rum.changeEnterpriseRelationship(window.localStorage.getItem("userId"),EnterpriseScreen.thisEnterprise.companyRegistrationNumber,0);
						
					EnterpriseScreen.enterpriseHeaderWidget.set("followButtonImage", "./images/icons/ajax-loader.gif");
					
					promise.then(function(){
					
						rels[0].status = 0;
						
						EnterpriseScreen.enterpriseHeaderWidget.set("followButtonImage", "./images/icons/follow.png");
						//EnterpriseScreen.enterpriseHeaderWidget.set("followButtonLabel", "Add");
						EnterpriseScreen.enterpriseHeaderWidget.followButtonClicked = lang.hitch(context, "followEnterprise");
						
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
			
			}
		},
		
		/*_homeButtonTap: function(e){
			Transitioner.zoomTo({element:e.currentTarget, newScreen:"home", event:e},EnterpriseScreen.thisEnterprise.id,"enterprise", 0);
		},
		
		_profileButtonTap: function(e){
			Transitioner.zoomTo({element:e.currentTarget, newScreen:"profile", event:e},EnterpriseScreen.thisEnterprise.id,"enterprise", 0);
		},*/
		
		_settingsButtonTap: function(context, e){
				var parentid = EnterpriseScreen.thisEnterprise.id;
				
				if(context.params.settings == "tier"){
					parentid = context.loadedStores.Sectors.get(EnterpriseScreen.thisEnterprise.parentid).id
				}
				
				Transitioner.zoomTo({element:context.domNode, newScreen:context.params.settings, event:e, direction: -1},parentid, "enterprise", 0);
		}
	
	};

return EnterpriseScreen;
});