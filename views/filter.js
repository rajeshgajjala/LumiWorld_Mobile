define([ "dojo/dom", "../widget/headerBar/headerBar", "dijit/registry", "dojox/mobile/ListItem",
	"dojox/gesture/tap", "dojo/base/lang", "dojo/on", "../js/Transitioner", "dojo/base/fx"],
	function( dom, navigationHUDWidget, registry, ListItem, tap, lang, on, Transitioner, fx){

	var filterScreen = {

		navigationWidget: new Object,
	
		eventHandler: new Object,
	
		init: function(){

		},
		
		beforeActivate: function(){
			
			var context = this;
			var filterCode = parseInt(context.params.filter) || 0;
			var naviPlaceHolder = dom.byId("FilterHUD");
			filterScreen.navigationWidget = new navigationHUDWidget();
			filterScreen.navigationWidget.set("backButtonText", "Cancel");
			filterScreen.navigationWidget.set("backButtonImgVisible", false);
			filterScreen.navigationWidget.backButtonOnTap = lang.hitch(this, "_settingsButtonTap", this);
			
			filterScreen.navigationWidget.placeAt(naviPlaceHolder);
			
			switch(filterCode){
				case 4 :
					this.loadedStores.Sectors.query(null,{sort:[{attribute: "displayName", descending: false}]}).forEach(lang.hitch(this, "_addSectorElement"));
				break;
				case 2 :
					this.loadedStores.Enterprises.query(null,{sort:[{attribute: "displayName", descending: false}]}).forEach(lang.hitch(this, "_addEnterpriseElement"));	
				break;
				default:
					this.loadedStores.filters.query(null,{sort:[{attribute: "id", descending: false}]}).forEach(lang.hitch(this, "_addNewMenueElement"));
				break;
			}
			
			var context = this;
			filterScreen.eventHandler = lang.hitch(context, "_settingsButtonTap", context);
			
			document.addEventListener('backbutton', filterScreen.eventHandler, false);
			
		},
		
		beforeDeactivate: function(){
			document.removeEventListener('backbutton', filterScreen.eventHandler, false);
		},
		
		afterDeactivate: function(){
			this._destroyAllContentItems();
			filterScreen.navigationWidget.destroyRecursive();
			console.log("dead");
		},
		
		_menueItemTapped: function(filter, event){
			if(filter > 1){
				Transitioner.zoomTo({element:event.currentTarget, newScreen:"filter", event:event},null,"filter",filter)
			}else{
				Transitioner.zoomTo({element:event.currentTarget, newScreen:"feeds", event:event},filter,"filter",filter)
			}
		},
		
		_itemTapped: function(id,filter,event){
			Transitioner.zoomTo({element:event.currentTarget, newScreen:"feeds", event:event},id,"filter",filter)
		},
		
		_addNewMenueElement: function(ContentElement){

			var bodyListItem = new ListItem({label:ContentElement.label, style:{color:"black", textTransform:"capitalize", background:"white"}});
			
			registry.byId("FilterList").addChild(bodyListItem);
			
			bodyListItem.own(
				on(bodyListItem, tap, lang.hitch(this, "_menueItemTapped", ContentElement.id))
			);
		},
		
		_addSectorElement: function(ContentElement){

			var context = this;
		
			var bodyListItem = new ListItem({label:ContentElement.displayName, style:{color:"black", textTransform:"capitalize", background:"white"}});
			
			registry.byId("FilterList").addChild(bodyListItem);
			
			bodyListItem.own(
				on(bodyListItem, tap, lang.hitch(context, "_itemTapped", ContentElement.id, context.params.filter))
			);
		},
		
		_addEnterpriseElement: function(ContentElement){
		
			var context = this;

			this.loadedStores.ConnectedEnterprises.query({ID: window.localStorage.getItem("userId") + "_" + ContentElement.companyRegistrationNumber, status:1}).forEach(function(result){
				var bodyListItem = new ListItem({label:ContentElement.displayName, icon: ContentElement.enterpriseLogo, variableHeight:true, style:{color:"black", background:"white"}});
				
				registry.byId("FilterList").addChild(bodyListItem);
				
				bodyListItem.own(
					on(bodyListItem, tap, lang.hitch(context, "_itemTapped", ContentElement.id, context.params.filter))
				);
			});
		},
		
		sectorTap: function(parentID,event){
			Transitioner.zoomTo({element:event.currentTarget, newScreen:"feeds", event:event},parentID,"c",0)
		},
		
		_destroyAllContentItems: function(){
		
			registry.byId("FilterList").destroyDescendants();
			
		},
		
		_settingsButtonTap: function(context, e){
				Transitioner.zoomTo({element:context.domNode, newScreen:"feeds", event:e},context.params.parentid, "filter", 0);
		}
	
	};

return filterScreen;
});