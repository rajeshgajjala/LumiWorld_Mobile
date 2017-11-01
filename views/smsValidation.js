define(["dojo/dom", "dijit/registry", "dojox/gesture/tap", "dojo/base/lang",
		"dojo/on", "../js/Transitioner", "dojo/request/xhr", "dijit/Dialog",
		"dojox/mobile/Button", "../js/RemoteUpdateModule", "dijit/form/ValidationTextBox", "dojo/json",
		"dojo/dom-construct", "../widget/headerBar/headerBar", "dojo/dom-style", "dojo/query"],
	function( dom, registry, tap, lang, on, Transitioner, xhr, Dialog, Button, RUM, validationTextBox, json, domConstruct, HeaderBar, style, query){

	var ValidationScreen = {

		ValidationScreenForm: {},
		
		headerWidget: new Object,
		
		countDown : 60,
		
		countDownTimer : new Object,
	
		init: function(){
			ValidationScreen.headerWidget = new HeaderBar();
			ValidationScreen.headerWidget.backButtonOnTap = lang.hitch(this, "_settingsButtonTap");
		},
		
		beforeActivate: function(){	
		
			var headerPlaceHolder = dom.byId("ValidationScreenHeader");
			
			ValidationScreen.headerWidget.set('backButtonText', 'Cancel');
			ValidationScreen.headerWidget.set('backButtonImgVisible', false);
			
			ValidationScreen.headerWidget.set('contextButtonImgVisible', false);
			
			this.ValidationScreenForm = registry.byId("ValidationScreenForm");
					
			ValidationScreen.headerWidget.set('title', 'Step 2/4');
			ValidationScreen.headerWidget.set('contextButtonText', 'Verify');
			
			dom.byId("userMobileNumber").innerHTML = "+" + window.localStorage.getItem("userId");
			dom.byId("resendSMSBtn").disabled = true;
		
			this.own(
				on(this.ValidationScreenForm, 'submit', function(event){event.preventDefault(); return false;}),
				on(dom.byId("resendSMSBtn"), tap, lang.hitch(this, "_resendSMSBtnTapped"))
			);
			
			ValidationScreen.headerWidget.contextButtonOnTap = lang.hitch(this, "_ValidationScreenBtnTapped");
			
			ValidationScreen.headerWidget.placeAt(headerPlaceHolder);
			
			ValidationScreen.countDownTimer = setInterval(ValidationScreen._updateCountDown, 1000);
			ValidationScreen.countDown = 60;
			
		},
		
		beforeDeactivate: function () {
			registry.byId("VerificationCode").reset();
		},
		
		afterDeactivate: function(){
			clearInterval(ValidationScreen.countDownTimer);
			ValidationScreen.headerWidget.set("contextButtonImgVisible", false);
		},
		
		_ValidationScreenBtnTapped: function(event){
		
			event.preventDefault();
			event.cancelBubble = true;
		
			this.ValidationScreenForm.connectChildren();
			this.ValidationScreenForm.validate();
			
			ValidationScreen.headerWidget.set("contextButtonText", " ");
			ValidationScreen.headerWidget.set("contextButtonImageURL", "./images/icons/ajax-loader-header.gif");
			ValidationScreen.headerWidget.set("contextButtonImgVisible", true);
		
			var test = this.ValidationScreenForm.get("state");
		
			if((test == "")){
			
				var formData = this.ValidationScreenForm.get('value');
				var validationDetails = {};
				validationDetails.cell = window.localStorage.getItem("userId");
				validationDetails.password = formData.code;
				
				
				var Rum = new RUM(this);
				
				var promise = Rum.userLogin(validationDetails);
				
				promise.then(function(result){
					if(result == "2"){
						Transitioner.zoomTo({element:dom.byId("ValidationScreenForm"), newScreen:"editPassword"},1,"smsValidation");
					}else{
						ValidationScreen._createDialog("The SMS Validation code you entered is incorrect. Please try again.", "OK");
						ValidationScreen.headerWidget.set("contextButtonImgVisible", false);
						ValidationScreen.headerWidget.set("contextButtonText", "Verify");
					}
				},function(error){
					console.log(error);
					ValidationScreen._createDialog("We could not connect to Luminet World please check you internet connectivity and try again.","OK");
					ValidationScreen.headerWidget.set("contextButtonImgVisible", false);
					ValidationScreen.headerWidget.set("contextButtonText", "Verify");
				});
			
			}else{
				ValidationScreen._createDialog("Please correct all the fields marked in red.","OK");
				ValidationScreen.headerWidget.set("contextButtonImgVisible", false);
				ValidationScreen.headerWidget.set("contextButtonText", "Verify");
			}
			
			return false;
		},
		
		_resendSMSBtnTapped: function(){
			
			if(dom.byId("resendSMSBtn").disabled == false){ //It appears that some android devices disregard the disabled attribute in the DOM, firing the ontap events regardless, this if statement is meant to catch these occurrences.
				var Rum = new RUM(this);
				
				var promise = Rum.requestSmsValidation(window.localStorage.getItem("userId"));
				
				promise.then(function(result){
					ValidationScreen.countDown = 60;
					ValidationScreen.countDownTimer = setInterval(ValidationScreen._updateCountDown, 1000);
					style.set(dom.byId("resendSMSBtn"), "color", "gray");
					style.set(dom.byId("resendSMSBtn"), "border-color", "gray");
					dom.byId("resendSMSBtn").disabled = true;
				},function(error){
					console.log(error);
					ValidationScreen._createDialog("We could not connect to Luminet World please check you internet connectivity and try again.","OK");
				});
			}
		},
		
		_createDialog: function(text,btnOk){
			var dialog = new Dialog({title : "SMS Validation", content: text + "<br />", class:"claro", daggable:false, style:{color: "black", border:"black 2px solid", textAlign:"center"}});
			var btnOk = new Button({label: btnOk, onClick: function(){dialog.hide();}, style:{color: "black", backgroundColor:"rgba(0,0,0,0)", border:"black 2px solid", width:"35%", height:"40%", backgroundImage:"none",borderRadius:"0px"}}).placeAt(dialog);
			dialog.show();
			query(".dijitDialogTitleBar").forEach(function(node){
				style.set(node, {backgroundColor:"black", border:"none", backgroundImage:"none", color:"white", textAlign:"left"});
			});
			query(".dijitDialogTitle").forEach(function(node){
				style.set(node, {color:"white"});
			});
			
		},
		
		_settingsButtonTap: function(e){
			Transitioner.zoomTo({element:e.currentTarget, newScreen:"walkthrough", transition:"none", event:e, direction: -1},0, "smsValidation", 0);
		},
		
		_updateCountDown: function(){
			ValidationScreen.countDown--;
			
			dom.byId(countDown).innerHTML = ValidationScreen.countDown;
			
			if(ValidationScreen.countDown == 0){
				clearInterval(ValidationScreen.countDownTimer);
				style.set(dom.byId("resendSMSBtn"), "color", "black");
				style.set(dom.byId("resendSMSBtn"), "border-color", "black");
				dom.byId("resendSMSBtn").disabled = false;
			}
		}
		
	};

return ValidationScreen;
});