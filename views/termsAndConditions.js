define(["dojox/gesture/tap", "dojo/dom", "dojo/on", "dojo/dom-construct", "../js/Transitioner", "dojo/base/lang", 
		"dojox/mobile/Badge", "dojo/dom-style","../widget/tabNavigation/tabNavigation", "../widget/headerBar/headerBar", 
		"dojox/mobile/ListItem", "dijit/registry"], 
	function(tap, dom, on, domConstruct, Transitioner, lang, badge, domStyle, tabNavigation, HeaderBar, ListItem, registry){
	var termsAndConditionsScreen = {
		
		headerWidget: new Object,
		
		init: function(){
			
			termsAndConditionsScreen.headerWidget = new HeaderBar();
			termsAndConditionsScreen.headerWidget.set('title', 'Terms And Conditions');
			termsAndConditionsScreen.headerWidget.set('backButtonText', 'Back');
			termsAndConditionsScreen.headerWidget.set('backButtonImgVisible', true);
			termsAndConditionsScreen.headerWidget.backButtonOnTap = lang.hitch(this, "_backButtonPressed", this);
		},
	
		beforeActivate: function(){
			var headerPlaceHolder = dom.byId("termsAndConditionsHeader");			
			termsAndConditionsScreen.headerWidget.placeAt(headerPlaceHolder);
			
			var context = this;
			termsAndConditionsScreen.eventHandler = lang.hitch(context, "_backButtonPressed", context);
			
			document.addEventListener('backbutton', termsAndConditionsScreen.eventHandler, false);
			
		},
		
		beforeDeactivate: function(){
			document.removeEventListener('backbutton', termsAndConditionsScreen.eventHandler, false);
		},
		
		_backButtonPressed: function(context, e){
			Transitioner.zoomTo({element:context.domNode, newScreen:this.params.settings, event:e, direction: -1},0, this.params.parentid, 0);
		}
		
	}
	
	return termsAndConditionsScreen;
});