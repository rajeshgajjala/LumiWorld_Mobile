define(["dojo/base/declare","dijit/WidgetBase", "dijit/TemplatedMixin", "dojo/text!./template/navigationHUD.html",
		"dojo/base/lang", "dojox/gesture/swipe", "dojox/gesture/tap", "dojo/on", "./js/Transitioner.js", "dojo/dom-style"], 
	function(declare, WidgetBase, TemplatedMixin, template, lang, swipe, tap, on, transitioner, domStyle){
    
		return declare([WidgetBase, TemplatedMixin], {
			enterpriseName: "",
			_setEnterpriseNameAttr : function(newName){ 
				if(newName != ""){
					this._set("enterpriseName", newName);
					this.enterpriseNameNode.childNodes[1].innerText = newName;
					domStyle.set(this.enterpriseNameNode, "display","");
				}
			},
			
			categoryName: "",
			_setCategoryNameAttr : function(newName){ 
				if(newName != ""){
					this._set("categoryName", newName);
					this.categoryNameNode.innerHTML = "<span class='navigationHUDLabel'>" + newName + "</span>";
					domStyle.set(this.categoryNameNode, "display","");
				}
			},
			
			sectorName: "",
			_setSectorNameAttr : function(newName){ 
				if(newName != ""){
					this._set("sectorName", newName);
					this.sectorNameNode.innerHTML = "<span class='navigationHUDLabel'>" + newName + "</span>";
				}
			},
			
			backLabel: "Home",
			
			settingButtonImageURL : require.toUrl("./images/settingsButton.ico"),
			
			interestButtonImageURL: require.toUrl("./images/interestedInButton.png"),
			
			_setSettingButtonImageURLAttr : function(imagePath){ 
				if(imagePath != ""){
					this._set("settingButtonImageURL", imagePath);
					this.settingsButtonImage.src = imagePath;
				}
			},
			
			interestButtonVisible: true,
			
			_setInterestButtonVisibleAttr : function(value){
				this._set("interestButtonVisible", value);
				this.interestButton.hidden = !value;
			},
			
			templateString: template,
			
			baseClass: "navigationHUD",

			postCreate: function(){
			
				var sectorNameNode = this.sectorNameNode;
				var categoryNameNode = this.categoryNameNode;
				var enterpriseNameNode = this.enterpriseNameNode;
				var settingsButton = this.settingsButton;
				var interestButton = this.interestButton;
				var backButton = this.backButton;
				
				this.inherited(arguments);
				
				this.own(
					on(sectorNameNode, tap, lang.hitch(this, "sectorsNameClicked")),
					on(categoryNameNode, tap, lang.hitch(this, "categoryNameClicked")),
					on(enterpriseNameNode, tap, lang.hitch(this, "enterpriseNameClicked")),
					on(backButton, tap, function(e){transitioner.zoomTo({element:this, newScreen:"home", event:e, opts:{direction: -1, reverse:true}},1);}),
					on(settingsButton, tap, lang.hitch(this, "settingsButtonOnTap")),
					on(interestButton, tap, lang.hitch(this, "interestButtonOnTap")),
					on(sectorNameNode, swipe.end, lang.hitch(this, "_sectorsNameSwiped")),
					on(categoryNameNode, swipe.end, lang.hitch(this, "_categoryNameSwiped")),
					on(enterpriseNameNode, swipe.end, lang.hitch(this, "_enterpriseNameSwiped"))
				);
			
			},
			
			_swipeDirection: function(event){
				var direction = 0;
				if(event.dx < 0){direction = -1;}else{direction = 1}
				
				return direction;
			},
			
			_sectorsNameSwiped: function(event){
				this.sectorsNameSwiped(this._swipeDirection(event),event);
			},
			
			_categoryNameSwiped: function(event){
				this.categoryNameSwiped(this._swipeDirection(event),event);
			},
			
			_enterpriseNameSwiped: function(event){
				this.enterpriseNameSwiped(this._swipeDirection(event),event);
			},
			
			settingsButtonOnTap: function(){},
			
			interestButtonOnTap: function(){},
			
			sectorsNameClicked: function(){},
			
			categoryNameClicked: function(){},
			
			enterpriseNameClicked: function(){},
			
			sectorsNameSwiped: function(direction){},
			
			categoryNameSwiped: function(direction){},
			
			enterpriseNameSwiped: function(direction){}
        });

});