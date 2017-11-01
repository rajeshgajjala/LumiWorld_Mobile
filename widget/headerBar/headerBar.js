define(["dojo/base/declare","dijit/WidgetBase", "dijit/TemplatedMixin", "dojo/text!./template/headerBar.html",
		"dojo/base/lang", "dojox/gesture/tap", "dojo/on", "./js/Transitioner.js", "dojo/dom-style"], 
	function(declare, WidgetBase, TemplatedMixin, template, lang, tap, on, transitioner, style){
    
		return declare([WidgetBase, TemplatedMixin], {
			
			title: "Connect",
			_setTitleAttr : function(newName){ 
				if(newName != ""){
					if(newName.length > 18){
						newName = newName.slice(0,14) + "...";
					}
					this._set("title", newName);
					this.titleNode.innerText = newName;
				}
			},
			
			backButtonText: "Filter",
			_setBackButtonTextAttr : function(newName){ 
				if(newName != ""){
					this._set("backButtonText", newName);
					this.backButton.childNodes[2].innerText = newName;
				}
			},
			
			backButtonImgVisible: true,
			
			_setBackButtonImgVisibleAttr : function(value){
				this._set("backButtonImgVisible", value);
				this.backButtonImage.hidden = !value;
			},
			
			contextButtonText: " ",
			_setContextButtonTextAttr : function(newName){ 
				if(newName != ""){
					this._set("contetxButtonText", newName);
					this.contextButton.childNodes[1].innerText = newName;
				}
			},
			
			contextButtonImgVisible: false,
			
			_setContextButtonImgVisibleAttr : function(value){
				this._set("contextButtonImgVisible", value);
				style.set(this.contextButtonImage, "display", (value ? "block" : "none"));
				this.contextButtonImage.hidden = !value;
			},
			
			contextButtonVisible: false,
			
			_setContextButtonVisibleAttr : function(value){
				this._set("contextButtonVisible", value);
				this.contextButton.hidden = !value;
			},
			
			backButtonImageURL : require.toUrl("./images/icn_nav_back-hdpi.png"),
			
			contextButtonImageURL : require.toUrl("./images/ProfileLogo_clear.png"),
			
			_setContextButtonImageURLAttr : function(URL){
				if(URL != ""){
					this._set("contextButtonImageURL", URL);
					this.contextButtonImage.src = URL;
				}
			},
			
			templateString: template,
			
			baseClass: "headerBar",

			postCreate: function(){
			
				var contextButton = this.contextButton;
				var backButton = this.backButton;
				var titleNode = this.titleNode;
				
				this._setContextButtonImgVisibleAttr(false);
				
				this.inherited(arguments);
				
				this.own(
					on(backButton, tap, lang.hitch(this, "backButtonOnTap")),
					on(contextButton, tap, lang.hitch(this, "contextButtonOnTap"))
				);
			
			},
			
			backButtonOnTap: function(){},
			
			contextButtonOnTap: function(){}
        });

});