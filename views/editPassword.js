define(["../js/Transitioner", "dojo/base/lang","../widget/tabNavigation/tabNavigation", "../widget/headerBar/headerBar","dojo/dom",
		"dijit/registry", "dojo/on", "dojox/gesture/tap", "dojo/json","dojo/request/xhr", "dijit/Dialog", "dojox/mobile/Button", 
		"dojo/dom-style", "dojo/query", "dojo/aspect", "../js/RemoteUpdateModule"], 
	function(Transitioner, lang, tabNavigation, HeaderBar,dom,registry, on, tap, json, xhr, Dialog, Button, style, query, aspect, RUM){
	var editPasswordScreen = {
		
		headerWidget: new Object,
		
		eventHandler: new Object,
		
		init: function(){
			
			editPasswordScreen.headerWidget = new HeaderBar();
			
		},
	
		beforeActivate: function(){
		
			var naviPlaceHolder = dom.byId("editPasswordTab");
			var headerPlaceHolder = dom.byId("editPasswordHeader");
			
			editPasswordScreen.headerWidget.set('title', 'Profile');
			editPasswordScreen.headerWidget.set('backButtonText', 'Back');
			editPasswordScreen.headerWidget.backButtonOnTap = lang.hitch(this, "_settingsButtonTap", this);
			
			editPasswordScreen.headerWidget.set('contextButtonText', 'Update');
			editPasswordScreen.headerWidget.contextButtonOnTap = lang.hitch(this, "updatePassword");
			
			registry.byId("Update.confirmPassword").validator = function(value){
				if(value != registry.byId("Update.newPassword").get('value'))
					{
						return false;
				}else{
						return true;
				}
			}
			
			editPasswordScreen.headerWidget.placeAt(headerPlaceHolder);
			
			this.own(
				on(dom.byId("UpdateForm"), 'submit', function(event){event.preventDefault(); return false;})
			);
			
			var context = this;
			editPasswordScreen.eventHandler = lang.hitch(context, "_settingsButtonTap", context);
			
			document.addEventListener('backbutton', editPasswordScreen.eventHandler, false);
			
			dom.byId("Update.cell").innerHTML = "+" + window.localStorage.getItem('userId');
			dom.byId("editPasswordTitle").innerHTML = "Change your password";
			dom.byId("editPasswordSubTitle").innerHTML = "Enter your new password here:";
			
			registry.byId("Update.password").set("disabled", false);
			style.set(registry.byId("Update.password").domNode, "display", "block");
			
			if(this.params.settings == "smsValidation"){
				editPasswordScreen.headerWidget.set('title', 'Step 3/4');
				editPasswordScreen.headerWidget.set('contextButtonText', 'Next');
				dom.byId("editPasswordTitle").innerHTML = "Your mobile number has been verified";
				dom.byId("editPasswordSubTitle").innerHTML = "Please set a password:";
				registry.byId("Update.password").set("disabled", true);
				style.set(registry.byId("Update.password").domNode, "display", "none");
				editPasswordScreen.headerWidget.set('backButtonText', ' ');
				editPasswordScreen.headerWidget.set('backButtonImgVisible', false);
				editPasswordScreen.headerWidget.backButtonOnTap = null;				
			}
			
		},
		
		beforeDeactivate: function(){
			document.removeEventListener('backbutton', editPasswordScreen.eventHandler, false);
			registry.byId("Update.password").reset();
			registry.byId("Update.newPassword").reset();
			registry.byId("Update.confirmPassword").reset();
		},
		
		updatePassword: function(event){
			var form = registry.byId("UpdateForm");
			form.validate();
			
			var formData = form.get('value');
			
			if(form.get("state") == ""){
			
				editPasswordScreen.headerWidget.set("contextButtonText", " ");
				editPasswordScreen.headerWidget.set("contextButtonImageURL", "./images/icons/ajax-loader-header.gif");
				editPasswordScreen.headerWidget.set("contextButtonImgVisible", true);
			
				var context = this;
				var Rum = new RUM(context);
			
				var formData = form.get('value');
				var formDataString = {};
				
				formDataString.cell = window.localStorage.getItem("userId");
				formDataString.password = window.localStorage.getItem("pWord");
				
				Rum.userLogin(formDataString).then(function(result){
					if(result == "2" || result == "3"){
						if(context.params.settings == "smsValidation"){
							formData.status = 2;
						}
						context.updateBackend(window.localStorage.getItem("userId"), formData);
					}else{
						editPasswordScreen._createDialog("Could not verify Mobile Number or Password, Please Check them and try again","OK");
						editPasswordScreen.headerWidget.set("contextButtonImgVisible", false);
						editPasswordScreen.headerWidget.set("contextButtonText", "Next");
					}
				},function(error){
					editPasswordScreen._createDialog("We could not connect to Luminet World please check you internet connectivity and try again.","OK");
					editPasswordScreen.headerWidget.set("contextButtonImgVisible", false);
					editPasswordScreen.headerWidget.set("contextButtonText", "Next");
				});
			
			}else{
				editPasswordScreen._createDialog("Please correct all the fields marked in red.","OK");
			}
			
		},
		
		updateBackend: function(userId, formData){
			
			var context = this;
			var Rum = new RUM(context);
			
			window.localStorage.setItem("pWord", formData.newPassword);
			
			Rum.loginUpdate(userId, formData).then(function(result){
				if(result == 0){
					console.log("Fail");
					editPasswordScreen._createDialog("We could not connect to Luminet World please check you internet connectivity and try again.","OK");
					editPasswordScreen.headerWidget.set("contextButtonImgVisible", false);
					editPasswordScreen.headerWidget.set("contextButtonText", "Next");
				}else{
					editPasswordScreen.headerWidget.set("contextButtonText", "Update");
					editPasswordScreen.headerWidget.set("contextButtonImgVisible", false);
					if(context.params.settings == "smsValidation"){
						Transitioner.zoomTo({element:context.domNode, newScreen: "editProfile", direction: 1},context.params.parentid, "editPassword", 0);
					}else{
						editPasswordScreen._createDialog("Your password has been changed","OK");
					}
				}
				
			},function(error){
				console.log(error);
				editPasswordScreen._createDialog("We could not connect to Luminet World please check you internet connectivity and try again.","OK");
				editPasswordScreen.headerWidget.set("contextButtonImgVisible", false);
				editPasswordScreen.headerWidget.set("contextButtonText", "Next");
			});
			
		},
		
		_createDialog: function(text,btnOk){
			var dialog = new Dialog({title : "Change Password", content: text + "<br />", class:"claro", daggable:false, style:{color: "black", border:"black 2px solid", textAlign:"center"}});
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
		
	}
	
	return editPasswordScreen;
});