define([ "dojo/dom", "../widget/navigationHud/navigationHUD", "dijit/registry", "dojox/mobile/ListItem",
	"dojox/gesture/tap", "dojo/base/lang", "dojo/on", "../js/Transitioner", "dojo/base/fx"],
	function( dom, navigationHUDWidget, registry, ListItem, tap, lang, on, Transitioner, fx){

	var SettingScreen = {

		navigationWidget: new Object,
		
		selectionList: new Array,
		
		deselectionList: new Array,
	
		init: function(){

		},
		
		beforeActivate: function(){
			
			var context = this;
			var naviPlaceHolder = dom.byId("SettingHUD");
			SettingScreen.navigationWidget = new navigationHUDWidget();
			
			var SettingsList = registry.byId("SettingsList");
			
			switch(context.params.settings){
				case "i":
					context.loadedStores.InterestedIn.query({sectorID: context.params.parentid},{ sort:[{attribute:"displayName", descending: false}]})
						.forEach(function(result){
							context._addNewContentElement(result, context.loadedStores.DisplayInterestedIn.get(result.id))
						});
						
					////////// Temporary Fix for items being stuck behind the HUD 
					SettingsList.addChild(new ListItem({style:{height: "48px", font:"0.8em arial,sans-serif", color:"grey", wordWrap:"none",}}),"last");
					SettingsList.addChild(new ListItem({style:{height: "48px", font:"0.8em arial,sans-serif", color:"grey", wordWrap:"none",}}),"last");
						
					////Navigation Widget Initialization////
					SettingScreen.navigationWidget.set("sectorName", context.loadedStores.Sectors.get(context.params.parentid).displayName);
					SettingScreen.navigationWidget.sectorsNameClicked = lang.hitch(this, "sectorTap",context.params.parentid);
					SettingScreen.navigationWidget.settingsButtonOnTap = lang.hitch(this, "sectorTap",context.params.parentid);
					SettingScreen.navigationWidget.interestButtonOnTap = lang.hitch(this, "sectorTap",context.params.parentid);
				break;
				case "e":
					context.loadedStores.Enterprises.query({parentid: context.params.parentid})
						.forEach(function(result){
							context._addNewContentElement(result, context.loadedStores.DisplayEnterprises.get(result.id))
						});
						
					var category = this.loadedStores.Categories.get(this.params.parentid);
					
					////Navigation Widget Initialization////
					SettingScreen.navigationWidget.set("sectorName", this.loadedStores.Sectors.get(category.parentid).displayName);
					SettingScreen.navigationWidget.set("categoryName", category.displayName);
					SettingScreen.navigationWidget.categoryNameClicked = lang.hitch(this, "categoryTap",context.params.parentid);
					SettingScreen.navigationWidget.settingsButtonOnTap = lang.hitch(this, "categoryTap",context.params.parentid);
					SettingScreen.navigationWidget.sectorsNameClicked = lang.hitch(this, "sectorTap",category.parentid);
					SettingScreen.navigationWidget.set("interestButtonVisible", false);
				break;
				default:
					context.loadedStores.Categories.query({parentid: context.params.parentid})
						.forEach(function(result){
							context._addNewContentElement(result, context.loadedStores.DisplayCategories.get(result.id))
						});
					
					////Navigation Widget Initialization////
					SettingScreen.navigationWidget.set("sectorName", context.loadedStores.Sectors.get(context.params.parentid).displayName);
					SettingScreen.navigationWidget.sectorsNameClicked = lang.hitch(this, "sectorTap",context.params.parentid);
					SettingScreen.navigationWidget.settingsButtonOnTap = lang.hitch(this, "sectorTap",context.params.parentid);
					SettingScreen.navigationWidget.set("interestButtonVisible", false);
				break;
			}
			
			SettingScreen.navigationWidget.placeAt(naviPlaceHolder);
			
		},
		
		beforeDeactivate: function(){
			this._updateDisplayStores();
		},
		
		afterDeactivate: function(){
			this._destroyAllContentItems();
			SettingScreen.navigationWidget.destroyRecursive();
			SettingScreen.selectionList = [];
			SettingScreen.deselectionList = [];
			console.log("dead");
		},
		
		_updateDisplayStores: function(){
		
			var DisplayStore = {};
			var LocalStore = {};
		
			switch(this.params.settings){
				case "i":
					DisplayStore = this.loadedStores.DisplayInterestedIn;
					LocalStore = this.loadedStores.InterestedIn;
				break;
				case "e":
					DisplayStore = this.loadedStores.DisplayEnterprises;
					LocalStore = this.loadedStores.Enterprises;
				break;
				case "c":
					DisplayStore = this.loadedStores.DisplayCategories;
					LocalStore = this.loadedStores.Categories;
				break;
			};
			
			for(x in SettingScreen.selectionList){
			
				try{
					LocalStore.query({displayName:SettingScreen.selectionList[x].label}).forEach(function(result){DisplayStore.add(result)});
				}catch(error){
					console.log("Its ok");
				}
			}
			
			for(y in SettingScreen.deselectionList){
				LocalStore.query({displayName:SettingScreen.deselectionList[y].label}).forEach(function(result){
					console.log(DisplayStore.remove(result.id))
				});
			}
			
		},
		
		_itemTapped: function(item,event){
			if(item.checked){
				SettingScreen._itemDeselected(item);
			}else{
				SettingScreen._itemSelected(item);
			}
		},
		
		_itemSelected: function(item){
			item.checked = true;
			fx.animateProperty({
        		node: dom.byId(item.domNode),
        		properties: { 
					backgroundColor: {start : "white", end: "#0F0"} }
    		}).play();
			
			SettingScreen.selectionList.push(item);
			SettingScreen.deselectionList.splice(SettingScreen.deselectionList.indexOf(item),1);
		},
		
		_itemDeselected: function(item){
			item.checked = false;
			fx.animateProperty({
        		node: dom.byId(item.domNode),
        		properties: { backgroundColor: "white" }
    		}).play();
			
			SettingScreen.deselectionList.push(item);
			SettingScreen.selectionList.splice(SettingScreen.selectionList.indexOf(item),1);
	
		},
		
		_addNewContentElement: function(ContentElement,displayed){

			var bodyListItem = new ListItem({label:ContentElement.displayName, style:{color:"black", background:"white"}});
			
			registry.byId("SettingsList").addChild(bodyListItem);
			
			if(displayed){
				this._itemSelected(bodyListItem, ContentElement);
			}
			
			bodyListItem.own(
				on(bodyListItem, tap, lang.hitch(this, "_itemTapped", bodyListItem))
			);
		},
		
		sectorTap: function(parentID,event){
			Transitioner.zoomTo({element:event.currentTarget, newScreen:"tier", event:event},parentID,"c")
		},
		
		categoryTap: function(parentID,event){
			Transitioner.zoomTo({element:event.currentTarget, newScreen:"tier", event:event},parentID,"e")
		},
		
		_destroyAllContentItems: function(){
		
			registry.byId("SettingsList").destroyDescendants();
			
		}
	
	};

return SettingScreen;
});