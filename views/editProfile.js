define(["../js/Transitioner", "dojo/base/lang","../widget/tabNavigation/tabNavigation", "../widget/headerBar/headerBar","dojo/dom",
		"dijit/registry", "dojo/on", "dojox/gesture/tap", "dojo/json","dojo/request/xhr", "dijit/Dialog", "dojox/mobile/Button", 
		"dojo/dom-style", "dojo/query", "dojo/aspect", "../js/RemoteUpdateModule"], 
	function(Transitioner, lang, tabNavigation, HeaderBar,dom,registry, on, tap, json, xhr, Dialog, Button, style, query, aspect, RUM){
	var editProfileScreen = {
		
		headerWidget: new Object,
		
		eventHandler: new Object,
		
		init: function(){
			
			editProfileScreen.headerWidget = new HeaderBar();	
			on(dom.byId("TermsLink"), 'click', lang.hitch(this, "_TsAndCsClick"));
		},
	
		beforeActivate: function(){
		
			var headerPlaceHolder = dom.byId("editProfileHeader");
			
			editProfileScreen.headerWidget.set('title', 'Profile');
			editProfileScreen.headerWidget.set('backButtonText', 'Back');
			editProfileScreen.headerWidget.set('backButtonImgVisible', true);
			editProfileScreen.headerWidget.backButtonOnTap = lang.hitch(this, "_settingsButtonTap", this);
			
			editProfileScreen.headerWidget.set('contextButtonText', 'Update');
			editProfileScreen.headerWidget.contextButtonOnTap = lang.hitch(this, "updateBackend");
			
			editProfileScreen.headerWidget.placeAt(headerPlaceHolder);
			
			style.set(dom.byId("RegisterText"), "display", "none");
			
			this.own(
				on(dom.byId("ProfileForm"), 'submit', function(event){event.preventDefault(); return false;})
			);
			
			var context = this;
			editProfileScreen.eventHandler = lang.hitch(context, "_settingsButtonTap", context);
			
			document.addEventListener('backbutton', editProfileScreen.eventHandler, false);	
			
			if(this.params.settings == "editPassword"){
				editProfileScreen.headerWidget.set('title', 'Step 4/4');
				editProfileScreen.headerWidget.set('contextButtonText', 'Register');
				editProfileScreen.headerWidget.set('backButtonText', ' ');
				editProfileScreen.headerWidget.set('backButtonImgVisible', false);
				editProfileScreen.headerWidget.backButtonOnTap = null;
				editProfileScreen.headerWidget.contextButtonOnTap = lang.hitch(this, "contextButtonTap");
				style.set(dom.byId("RegisterText"), "display", "block");
				style.set(dom.byId("editProfileTitle"), "display", "block");
				style.set(dom.byId("profile.firstNameLabel"), "display", "none");
				style.set(dom.byId("profile.lastNameLabel"), "display", "none");
				style.set(dom.byId("profile.displayNameLabel"), "display", "none");
			}else{
				registry.byId("profile.firstName").set("value", window.localStorage.getItem("firstName") || "First Name");
				registry.byId("profile.lastName").set("value", window.localStorage.getItem("lastName") || "Last Name");
				registry.byId("profile.displayName").set("value", (window.localStorage.getItem("displayName") || "Display Name*"));
				style.set(dom.byId("editProfileTitle"), "display", "none");
				style.set(dom.byId("profile.firstNameLabel"), "display", "");
				style.set(dom.byId("profile.lastNameLabel"), "display", "");
				style.set(dom.byId("profile.displayNameLabel"), "display", "");
			}
			
		},
		
		beforeDeactivate: function(){
			document.removeEventListener('backbutton', editProfileScreen.eventHandler, false);
		},
		
		afterDeactivate: function(){
			registry.byId("profile.firstName").reset();
			registry.byId("profile.lastName").reset();
			registry.byId("profile.displayName").reset();
			editProfileScreen.headerWidget.set('contextButtonText', 'Update');
			editProfileScreen.headerWidget.set("contextButtonImgVisible", false);
		},
		
		contextButtonTap: function (e){
		
			var dialog = new Dialog({title : "T's & C's", content: "I accept the Luminet World Terms and Conditions" + "<br />", class:"claro", daggable:false, style:{color: "black", border:"black 2px solid", textAlign:"center"}});
			var btnOk = new Button({label: "I Accept", onClick: lang.hitch(this, "updateBackend", dialog), style:{color: "black", backgroundColor:"rgba(0,0,0,0)", border:"black 2px solid", height:"30%", backgroundImage:"none",borderRadius:"0px", margin:"5%"}}).placeAt(dialog);
			var btnCancel = new Button({label: "I Do Not Accept", onClick: function(){dialog.hide()}, style:{color: "black", backgroundColor:"rgba(0,0,0,0)", border:"black 2px solid", height:"30%", backgroundImage:"none",borderRadius:"0px", margin:"5%"}}).placeAt(dialog);
			query(".dijitDialogTitleBar").forEach(function(node){
			style.set(node, {backgroundColor:"black", border:"none", backgroundImage:"none", color:"white", textAlign:"left"});
			});
			query(".dijitDialogTitle").forEach(function(node){
				style.set(node, {color:"white"});
			});
			dialog.show();
			query(".dijitDialogPaneContent").forEach(function(node){
				style.set(node, {height:"auto"});
			});
	
		},
		
		updateBackend: function(dialog, e){
			
			if(dialog.hide){dialog.hide()};
			
			var context = this;
			var Rum = new RUM(context);
			
			editProfileScreen.headerWidget.set('contextButtonText', ' ');
			editProfileScreen.headerWidget.set("contextButtonImageURL", "./images/icons/ajax-loader-header.gif");
			editProfileScreen.headerWidget.set("contextButtonImgVisible", true);
			
			Rum.loginUpdate(window.localStorage.getItem("userId"),  registry.byId("ProfileForm").get("value")).then(function(result){
				if(result == 0){
					console.log("Fail");
					editProfileScreen._createDialog("We could not connect to Luminet World please check you internet connectivity and try again.","OK");
				}else{
					if(context.params.settings == "editPassword"){
						context.loadedStores.Enterprises.get(59).then(function(result){
							Rum.createEnterpriseRelationship(window.localStorage.getItem("userId"), result.companyRegistrationNumber).then(function(result){
								Rum.initialize(["connected"]).then(function(){
									Transitioner.zoomTo({element:context.domNode, newScreen:"home", event:e, direction: -1},context.params.parentid, "profile", 0);
								});
							});
						});
					}else{
						editProfileScreen._createDialog("Thank you, your profile has been updated.","OK");
						editProfileScreen.headerWidget.set('contextButtonText', 'Update');
						editProfileScreen.headerWidget.set("contextButtonImgVisible", false);
					}
				}
				
			},function(error){
				console.log(error);
				editProfileScreen._createDialog("We could not connect to Luminet World please check you internet connectivity and try again.","OK");
			});
			
		},
		
		_createDialog: function(text,btnOk){
			var dialog = new Dialog({title : "Profile", content: text + "<br />", class:"claro", daggable:false, style:{color: "black", border:"black 2px solid", textAlign:"center"}});
			var btnOk = new Button({label: btnOk, baseClass:"", onClick: function(){dialog.hide();}, style:{color: "black", backgroundColor:"rgba(0,0,0,0)", border:"black 2px solid", width:"35%", height:"40%", backgroundImage:"none",borderRadius:"0px"}}).placeAt(dialog);
			dialog.show();
			query(".dijitDialogTitleBar").forEach(function(node){
				style.set(node, {backgroundColor:"black", border:"none", backgroundImage:"none", color:"white", textAlign:"left"});
			});
			query(".dijitDialogTitle").forEach(function(node){
				style.set(node, {color:"white"});
			});
		},
		
		_connectTap: function(){
			Transitioner.zoomTo({element:event.currentTarget, newScreen:"feeds", event:event, direction: -1},null,"profile");
		},
		
		_homeButtonTap: function(e){
			Transitioner.zoomTo({element:e.currentTarget, newScreen:"home", event:e, direction: -1},1,"profile", 0);
		},
		
		_settingsButtonTap: function(context, e){
			document.activeElement.blur();
			Transitioner.zoomTo({element:context.domNode, newScreen:context.params.settings, event:e, direction: -1},context.params.parentid, "profile", 0);
		},
		
		_TsAndCsClick: function(e){
			Transitioner.zoomTo({element:e.currentTarget, newScreen:"termsAndConditions", event:e, direction: 1},this.params.settings, "editProfile", 0);
		},
		
		updateUnreadBadge: function(){
			editProfileScreen.navigationWidget.set("connectButtonBadgeValue", Number(window.unreadCount));
		}
		
	}
	
	return editProfileScreen;
});