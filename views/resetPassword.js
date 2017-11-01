define(["dojo/dom", "../js/Transitioner", "dojo/base/lang", "../widget/headerBar/headerBar", "dijit/Dialog",
		"dojox/mobile/Button", "dojo/on", "dojox/gesture/tap", "dijit/registry", "../js/RemoteUpdateModule",
		"dojo/dom-style", "dojo/query", "dojox/mobile/ProgressIndicator"], 
	function(dom, Transitioner, lang, HeaderBar, Dialog, Button, on, tap, registry, RUM, style, query, progressIndicator){
	var resetPasswordScreen = {
		
		headerWidget: new Object,
		
		eventHandler: new Object,
		
		init: function(){
			
			resetPasswordScreen.headerWidget = new HeaderBar();
			
		},
	
		beforeActivate: function(){
			var headerPlaceHolder = dom.byId("resetPasswordHeader");
			
			resetPasswordScreen.headerWidget.set('title', 'Reset Password');
			resetPasswordScreen.headerWidget.set('backButtonText', 'Cancel');
			resetPasswordScreen.headerWidget.set('backButtonImgVisible', false);
			resetPasswordScreen.headerWidget.backButtonOnTap = lang.hitch(this, "_backButtonPressed", this);
			resetPasswordScreen.headerWidget.placeAt(headerPlaceHolder);
			
			on(dom.byId("resetButton"), tap, lang.hitch(this, "resetPassword"));
			
			var context = this;
			resetPasswordScreen.eventHandler = lang.hitch(context, "_backButtonPressed", context);
			
			document.addEventListener('backbutton', resetPasswordScreen.eventHandler, false);
			
		},
		
		beforeDeactivate: function(){
			document.removeEventListener('backbutton', resetPasswordScreen.eventHandler, false);
		},
		
		_backButtonPressed: function(context, e){
			Transitioner.zoomTo({element:context.domNode, newScreen:context.params.settings, transition:"none", event:e, direction: -1},0, context.params.parentid, 0);
		},
		
		resetPassword: function(){
			event.preventDefault();
			event.cancelBubble = true;
			
			var textBox = registry.byId("resetCell");
			textBox.validate();
		
			if(textBox.isValid()){
				var Rum = new RUM(this);
				
				var userCell = textBox.get("value");
				
				if(userCell.charAt(0) == "0"){
					userCell = userCell.replace("0","27");
				}else{
					userCell = "27" + userCell;
				}
				
				var promise = Rum.requestPasswordReset(userCell);
				
				var dialog = new Dialog({title : "Password Retrieval", content: "<div style=\"width:85%; float:right;\">Your password will be sent to you via SMS</div>", class:"claro", daggable:false, style:{color: "black", border:"black 2px solid", textAlign:"center"}});
				var pro = new progressIndicator.getInstance({center:true, size:40, style:{top:"0px", left:"0px", marginLeft:"10px", marginTop:"11px"}}).placeAt(dialog);
				query(".mblProgContainer").forEach(function(node){
					style.set(node, {position:"static"});
				});
				pro.start();
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
				promise.then(function(result){
					if(result == 1){
						Transitioner.zoomTo({element:this.LuminetWorld.domNode, newScreen:"login"},null,"l");
						dialog.hide();
						pro.stop();
					}else{
						Transitioner.zoomTo({element:this.LuminetWorld.domNode, newScreen:"error", transition:"none", event:event},null,"l");
					}
				},function(error){
					dialog.hide();
					pro.stop();
					resetPasswordScreen._createDialog("We could not connect to Luminet World please check you internet connectivity and try again.","OK");
				});
			
			}else{
				resetPasswordScreen._createDialog("Please enter a valid Mobile Number.","OK");
			}
			
			return false;
		},
		
		_createDialog: function(text,btnOk){
			var dialog = new Dialog({title : "Password Reset", content: text + "<br />", class:"claro", daggable:false, style:{color: "black", border:"black 2px solid", textAlign:"center"}});
			var btnOk = new Button({label: btnOk, onClick: function(){dialog.hide();}, style:{color: "black", backgroundColor:"rgba(0,0,0,0)", border:"black 2px solid", width:"35%", height:"40%", backgroundImage:"none",borderRadius:"0px"}}).placeAt(dialog);
			dialog.show();
			query(".dijitDialogTitleBar").forEach(function(node){
				style.set(node, {backgroundColor:"black", border:"none", backgroundImage:"none", color:"white", textAlign:"left"});
			});
			query(".dijitDialogTitle").forEach(function(node){
				style.set(node, {color:"white"});
			});
			
		},
		
	}
	
	return resetPasswordScreen;
});