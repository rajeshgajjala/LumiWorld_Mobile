define(["dojo/base/declare","dijit/WidgetBase", "dijit/TemplatedMixin", "dojo/text!./template/FeedsViewHeader.html", "dojo/base/lang", 
		"dojox/gesture/tap", "dojo/on", "./js/Transitioner.js", "dojo/dom-style"], 
	function(declare, WidgetBase, TemplatedMixin, template, lang, tap, on, transitioner, style){
    
		return declare([WidgetBase, TemplatedMixin], {
			enterpriseName: "EnterpriseX",
			_setEnterpriseNameAttr : function(newName){
				if(newName != ""){
					if(newName.length > 18){
						style.set(this.enterpriseNameTitleNode, "font-size", "small")
					}else{
						style.set(this.enterpriseNameTitleNode, "font-size", "larger")
					}
					this._set("title", newName);
					this.enterpriseNameTitleNode.innerText = newName;
				}
			},
			
			enterpriseLogoURL: require.toUrl("./images/LumiLogo.png"),
			_setEnterpriseLogoURLAttr: function(url){
				if(url != ""){
					this._set("enterpriseLogoURL", url);
					this.feedsViewLogoNode.src = url;
				}
			},
			
			datePublished: new Date(),
			_setDatePublishedAttr : function(date){
				if(date){
					style.set(this.publishedDateNode, "font-size", "normal");
					if(window.innerHeight < 431){
						style.set(this.publishedDateNode, "font-size", "0.8em");
					}
					if(window.innerHeight < 401){
						style.set(this.publishedDateNode, "font-size", "0.7em");
						style.set(this.enterpriseNameTitleNode, "margin-top", "0px");
					}
					this.publishedDateNode.innerHTML = date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear() + " " + date.toLocaleTimeString();
				}
			},
			
			callButtonLabel: require.toUrl("./images/icons/actionTwo.png"),
			
			followButtonImage: require.toUrl("./images/icons/follow.png"),
			_setFollowButtonImageAttr: function(url){
				if(url != ""){
					this._set("followButtonImage", url);
					this.followButtonImageNode.src = url;
				}
			},
			
			templateString: template,
			
			baseClass: "FeedsViewHeader",

			postCreate: function(){
			
				var callButton = this.callButton;
				var followButton = this.followButton;
				var enterprise = this.enterpriseInfoNode
				
				this.inherited(arguments);
				
				this.own(
					on(callButton, tap, lang.hitch(this, "_callButtonOnClick")),
					on(enterprise, tap, lang.hitch(this, "_enterpriseOnClick")),
					on(followButton, tap, lang.hitch(this, "_followButtonOnClick"))
				);
			
			},
			
			_callButtonOnClick: function(event){
				this.callButtonClicked(event);
			},
			
			callButtonClicked: function() {},
			
			_followButtonOnClick: function(event){
				this.followButtonClicked(event);
			},
			
			followButtonClicked: function(){},
			
			_enterpriseOnClick: function(event){
				this.enterpriseClicked(event);
			},
			
			enterpriseClicked: function(){}
        });

});