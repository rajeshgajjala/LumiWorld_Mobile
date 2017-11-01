define(["dojo/base/declare","dijit/WidgetBase", "dijit/TemplatedMixin", "dojo/text!./template/EnterpriseHeader.html", "dojo/base/lang", 
	"dojox/gesture/swipe", "dojox/gesture/tap", "dojo/on", "./js/Transitioner.js", "dojo/dom-style"], 
	function(declare, WidgetBase, TemplatedMixin, template, lang, swipe, tap, on, transitioner, style){
    
		return declare([WidgetBase, TemplatedMixin], {
			enterpriseName: "EnterpriseX",
			_setEnterpriseNameAttr : { node : "enterpriseNameTitleNode", type : "innerHTML"},
			
			enterpriseLogoURL: require.toUrl("./images/LumiLogo.png"),
			_setEnterpriseLogoURLAttr: function(url){
				if(url != ""){
					this._set("enterpriseLogoURL", url);
					this.enterpriseLogoNode.src = url;
				}
				style.set(this.enterpriseLogoNode, "margin-top", "15%");
				if(window.innerHeight < 401){
					style.set(this.enterpriseLogoNode, "margin-top", "5%");
				}
				
			},
			
			enterpriseShort: "This is an enterprise that offers you some exciting new services.",
			_setEnterpriseShortAttr : { node : "enterpriseShortNode", type : "innerHTML"},
			
			firstbuttonLabel: require.toUrl("./images/icons/actionOne.png"),
			secondButtonLabel: require.toUrl("./images/icons/actionTwo.png"),
			thirdButtonLabel: require.toUrl("./images/icons/actionThree.png"),
			
			//Added By Rajesh
			facebookIconLabel: require.toUrl("./images/icons/facebook.png"),
			twitterIconLabel: require.toUrl("./images/icons/twitter.png"),
			instagramIconLabel: require.toUrl("./images/icons/instagram.png"),
			linkedinIconLabel: require.toUrl("./images/icons/linkedin.png"),
			//Till here Added By Rajesh.
			
			followButtonImage: require.toUrl("./images/icons/follow.png"),
			_setFollowButtonImageAttr: function(url){
				if(url != ""){
					this._set("followButtonImage", url);
					this.followButtonImageNode.src = url;
				}
			},
			
			/*followButtonLabel: "Add",
			_setFollowButtonLabelAttr: function(text){
				if(text != ""){
					this._set("followButtonLabel", text);
					this.followButtonLabelNode.innerHTML = text;
				}
			},*/
			
			templateString: template,
			
			baseClass: "EnterpriseHeader",
			
			actionButtonTwoVisible: false,
			
			_setActionButtonTwoVisibleAttr : function(value){
				this._set("actionButtonTwoVisible", value);
				this.secondActionButton.hidden = !value;
			},
			
			actionButtonThreeVisible: false,
			
			_setActionButtonThreeVisibleAttr : function(value){
				this._set("actionButtonThreeVisible", value);
				this.thirdActionButton.hidden = !value;
			},

			postCreate: function(){
			
				var actionOne = this.firstActionButton;
				var actionTwo = this.secondActionButton;
				var actionThree = this.thirdActionButton;
				var followButton = this.followButton;
				
				this.thirdActionButton.style.display = "none"
				this.thirdActionButtonImage.hidden = true;
				
				this.inherited(arguments);
				
				this.own(
					on(actionOne, tap, lang.hitch(this, "_firstActionButtonOnClick")),
					on(actionTwo, tap, lang.hitch(this, "_secondtActionButtonOnClick")),
					on(actionThree, tap, lang.hitch(this, "_thirdActionButtonOnClick")),
					on(followButton, tap, lang.hitch(this, "_followButtonOnClick"))
				);
			
			},
			
			_firstActionButtonOnClick: function(event){
				this.firstActionButtonClicked(event);
			},
			
			firstActionButtonClicked: function() {},
			
			_secondtActionButtonOnClick: function(event){
				this.secondActionButtonClicked(event);
			},
			
			secondActionButtonClicked: function() {},
			
			_thirdActionButtonOnClick: function(event){
				this.thirdActionButtonClicked(event);
			},
			
			thirdActionButtonClicked: function(){},
			
			_followButtonOnClick: function(event){
				this.followButtonClicked(event);
			},
			
			followButtonClicked: function(){},
        });

});