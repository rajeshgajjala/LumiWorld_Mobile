define(["dojo/dom", "dijit/registry", "dojox/mobile/ListItem", "dojox/gesture/tap", "dojo/base/lang",
	"dojo/on", "../widget/FeedsViewHeader/FeedsViewHeader","../js/Transitioner",
	"dijit/Dialog", "dojox/mobile/Button", "../widget/headerBar/headerBar",
	"../js/RemoteUpdateModule", "dojo/dom-construct", "dojo/query", "dojo/dom-style", "dojox/mobile/ProgressIndicator"],
	function(dom, registry, ListItem, tap, lang, on, feedsViewHeader, Transitioner, Dialog, Button, HeaderBar, RUM, domConstruct, query, style, ProgressIndicator){

	var feedsViewScreen = {
		
		feedsViewHeaderWidget: new Object,
		
		headerWidget: new Object,
		
		thisFeed: new Object,
		
		thisEnterprise: new Object,
		
		connectedID: new Object,
		
		eventHandler: new Object,
	
		init: function(){
			feedsViewScreen.feedsViewHeaderWidget = new feedsViewHeader();
			feedsViewScreen.headerWidget = new HeaderBar();
		},
		
		beforeActivate: function(){
			
			if(this.params.settings != "enterprise"){
				var context = this;
				var headerPlaceHolder = dom.byId("feedsViewHeader");
				var headerBarPlaceHolder = dom.byId("feedsViewNavHeader");
				
				this.loadedStores.NewsFeeds.get(this.params.parentid).then(function(result){
					feedsViewScreen.thisFeed = result;
				
					context.loadedStores.Enterprises.get(feedsViewScreen.thisFeed.enterpriseID).then(function(result){
					
						feedsViewScreen.thisEnterprise = result;
						
						//header Bar Initialization
						feedsViewScreen.headerWidget.set('title', feedsViewScreen.thisEnterprise.displayName);
						feedsViewScreen.headerWidget.set('backButtonText', 'Back');	
						feedsViewScreen.headerWidget.backButtonOnTap = lang.hitch(context, "_settingsButtonTap", context);
						feedsViewScreen.headerWidget.placeAt(headerBarPlaceHolder);
						
						//header Widget
						feedsViewScreen.feedsViewHeaderWidget.set("enterpriseName", feedsViewScreen.thisEnterprise.displayName);
						feedsViewScreen.feedsViewHeaderWidget.set("datePublished", new Date(parseInt(feedsViewScreen.thisFeed.publishedTime)));
						feedsViewScreen.feedsViewHeaderWidget.set("enterpriseLogoURL", feedsViewScreen.thisEnterprise.enterpriseLogo);
						
						feedsViewScreen.feedsViewHeaderWidget.callButtonClicked = lang.hitch(context, "_callButtonTapped");
						feedsViewScreen.feedsViewHeaderWidget.enterpriseClicked = lang.hitch(context, "_enterpriseTap");
						
						context.loadedStores.ConnectedEnterprises.query({ID: window.localStorage.getItem("userId") + "_" + feedsViewScreen.thisEnterprise.companyRegistrationNumber}).forEach(function(result){
							feedsViewScreen.connectedID = result;
							if(result.status == 1){
								feedsViewScreen.feedsViewHeaderWidget.followButtonClicked = lang.hitch(context, "unfollowEnterprise");
								feedsViewScreen.feedsViewHeaderWidget.set("followButtonImage", "./images/icons/following.png");
							}
						});
						
						feedsViewScreen.feedsViewHeaderWidget.placeAt(headerPlaceHolder);
						
					});
					
					registry.byId("messageContent").set("content", feedsViewScreen.thisFeed.NewsFeedBody);
					(new RUM(this)).pushDisplayedFeed(result.guid);
				});
			}
			
			var context = this;
			feedsViewScreen.eventHandler = lang.hitch(context, "_settingsButtonTap", context);
			
			document.addEventListener('backbutton', feedsViewScreen.eventHandler, false);
			
		},
		
		beforeDeactivate: function(){
			document.removeEventListener('backbutton', feedsViewScreen.eventHandler, false);
		},
		
		_callButtonTapped:function(event){
		
			var phoneNumber = feedsViewScreen.thisEnterprise.contactNumber || "";
			
			if(phoneNumber == ""){phoneNumber = "+27 12 665 3638";};
		
			this._createDialog("This is a cellular call and will be charged according to your service provider agreement","tel:" + phoneNumber,"Ok","Cancel");
		},
		
		_createDialog: function(text,href,btnOk,btnCancle){
			var dialog = new Dialog({title : "Cellular Call", content: text + "<br />", class:"claro", daggable:false, style:{color: "black", border:"black 2px solid", textAlign:"center"}});
			var btnOk = new Button({label: btnOk, onClick: lang.hitch(this, "_makeCall", href, dialog), style:{color: "black", backgroundColor:"rgba(0,0,0,0)", border:"black 2px solid", width:"35%", height:"30%", backgroundImage:"none",borderRadius:"0px", margin:"5%", fontSize:"1.1em"}}).placeAt(dialog);
			var btnCancle = new Button({label:btnCancle, onClick: function(){dialog.hide()}, style:{color: "black", backgroundColor:"rgba(0,0,0,0)", border:"black 2px solid", width:"35%", height:"30%", backgroundImage:"none",borderRadius:"0px", margin:"5%", fontSize:"1.1em"}}).placeAt(dialog);
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
			
			var enterpriseId = feedsViewScreen.thisEnterprise.id;
			var enterpriseNumber = feedsViewScreen.thisEnterprise.contactNumber;
			
			var callLog = Rum.logGSMCallBreakOut(window.localStorage.getItem('userId'), enterpriseId, enterpriseNumber);
			
			callLog.then(function(){
				//console.log("Engage Call Logged");
				dialog.hide();
				document.location.href = href;
			});
		},
		
		followEnterprise: function(event){
		
			var promise, Rum = new RUM(this), context = this;
			
			if(!feedsViewScreen.connectedID.ID){
				promise = Rum.createEnterpriseRelationship(window.localStorage.getItem("userId"),feedsViewScreen.thisEnterprise.companyRegistrationNumber);
				feedsViewScreen.connectedID.ID = window.localStorage.getItem("userId") + "_" + feedsViewScreen.thisEnterprise.companyRegistrationNumber;
				feedsViewScreen.connectedID.status = 1;
			}else{
				promise = Rum.changeEnterpriseRelationship(window.localStorage.getItem("userId"),feedsViewScreen.thisEnterprise.companyRegistrationNumber, 1);
				feedsViewScreen.connectedID.status = 1;
			}
			
			//var pro = new ProgressIndicator.getInstance({center:true, size:26, removeOnStop:true, style:{float:"left", marginTop:"9px", position:"static"}}).placeAt(event.currentTarget, "last");
			//pro.start();
			
			feedsViewScreen.feedsViewHeaderWidget.set("followButtonImage", "./images/icons/ajax-loader.gif");
			
			var button = event.currentTarget;			
			//button.style.backgroundColor = "lightgray";
			
			promise.then(function(){
				context.loadedStores.ConnectedEnterprises.put(feedsViewScreen.connectedID);
				
				//pro.stop();
				//button.style.backgroundColor = "white";
				
				feedsViewScreen.feedsViewHeaderWidget.set("followButtonImage", "./images/icons/following.png");
				feedsViewScreen.feedsViewHeaderWidget.followButtonClicked = lang.hitch(context, "unfollowEnterprise");
			});
			
		},
		
		unfollowEnterprise: function(event){
			var context = this;
			var yesOnClick = function(dialog, context){
				dialog.hide();
				var promise = (new RUM(this)).changeEnterpriseRelationship(window.localStorage.getItem("userId"), feedsViewScreen.thisEnterprise.companyRegistrationNumber,0);
				feedsViewScreen.feedsViewHeaderWidget.set("followButtonImage", "./images/icons/ajax-loader.gif");
				
				promise.then(function(){
					feedsViewScreen.connectedID.status = 0;
					var id = context.loadedStores.ConnectedEnterprises.getIdentity(feedsViewScreen.connectedID);
								
					feedsViewScreen.feedsViewHeaderWidget.set("followButtonImage", "./images/icons/follow.png");
					feedsViewScreen.feedsViewHeaderWidget.followButtonClicked = lang.hitch(context, "followEnterprise");
				});
			}
			
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
		
		},
		
		_settingsButtonTap: function(context, e){				
				Transitioner.zoomTo({element:context.domNode, newScreen:"feeds", event:e, direction: -1},this.params.parentid, "feedsView", this.params.filter);
		},
		
		_enterpriseTap: function(e){				
				Transitioner.zoomTo({element:e.currentTarget, newScreen:"enterprise", event:e, direction: 1},feedsViewScreen.thisEnterprise.id, "feedsView", this.params.filter);
		}
	
	};

return feedsViewScreen;
});