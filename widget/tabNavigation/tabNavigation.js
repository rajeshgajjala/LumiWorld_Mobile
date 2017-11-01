define(["dojo/base/declare","dijit/WidgetBase", "dijit/TemplatedMixin", "dojo/text!./template/tabNavigation.html",
		"dojo/base/lang", "dojox/gesture/tap", "dojo/on", "./js/Transitioner.js", "dojox/mobile/Badge", "dojo/dom-style"], 
	function(declare, WidgetBase, TemplatedMixin, template, lang, tap, on, transitioner, Badge, style){
    
		return declare([WidgetBase, TemplatedMixin], {
			
			backButtonImageURL : require.toUrl("./images/lumiLogo_clear.png"),
			
			_setBackButtonImageURLAttr : function(imagePath){ 
				if(imagePath != ""){
					this._set("backButtonImageURL", imagePath);
					this.backButtonImage.src = imagePath;
				}
			},
			
			profileButtonImageURL : require.toUrl("./images/ProfileLogo_clear.png"),
			
			_setProfileButtonImageURLAttr : function(imagePath){ 
				if(imagePath != ""){
					this._set("profileButtonImageURL", imagePath);
					this.profileButtonImage.src = imagePath;
				}
			},
			
			connectButtonImageURL: require.toUrl("./images/ConnectLogo_clear.png"),
			
			_setConnectButtonImageURLAttr : function(imagePath){ 
				if(imagePath != ""){
					this._set("connectButtonImageURL", imagePath);
					this.connectButtonImage.src = imagePath;
				}
				
			},
			
			connectButtonBadgeValue: window.unreadCount,
			
			connectBadgeIdentity: new Badge({fontSize:10}),
			
			_setConnectButtonBadgeValueAttr : function(value){ 
				if(value == 0){
					this._set("connectButtonBadgeValue", value);
					this.connectBadgeIdentity.domNode.hidden = true;
				}else{
					if(this.connectButtonBadgeValue == 0){
						this.connectButton.appendChild(this.connectBadgeIdentity.domNode);
						style.set(this.connectBadgeIdentity.domNode, "position", "absolute");
						style.set(this.connectBadgeIdentity.domNode, "left", "17%");
						style.set(this.connectBadgeIdentity.domNode, "top", "0px");
						this.connectBadgeIdentity.domNode.hidden = false;
					}
					this._set("connectButtonBadgeValue", value);
					this.connectBadgeIdentity.setValue(value);
				}
				
			},
			
			templateString: template,
			
			baseClass: "tabNavigation",

			postCreate: function(){
			
				var profileButton = this.profileButton;
				var connectButton = this.connectButton;
				var backButton = this.backButton;
				
				this.inherited(arguments);
				
				this.own(
					on(backButton, tap,lang.hitch(this, "homeButtonOnTap")),
					on(profileButton, tap, lang.hitch(this, "profileButtonOnTap")),
					on(connectButton, tap, lang.hitch(this, "connectButtonOnTap"))
				);
			
			},
			
			homeButtonOnTap: function(){},
			
			profileButtonOnTap: function(){},
			
			connectButtonOnTap: function(){}
        });

});