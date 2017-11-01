define(["dojo/base/declare", "dijit/WidgetBase", "dijit/TemplatedMixin", 
	"dojox/calendar/_RendererMixin", "dojo/text!./templates/MobileVerticalRenderer.html"],
	 
	function(declare, WidgetBase, TemplatedMixin, _RendererMixin, template){
	
	return declare("dojox.calendar.MobileVerticalRenderer", [WidgetBase, TemplatedMixin, _RendererMixin], {
				
		// summary:
		//		The mobile specific item vertical renderer.
		
		templateString: template,
		mobile: true,
		
		visibilityLimits: {
			resizeStartHandle: 75,
			resizeEndHandle: -1,
			summaryLabel: 55,			
			startTimeLabel: 75,
			endTimeLabel: 20
		},		
		
		postCreate: function() {
			this.inherited(arguments);
			this._applyAttributes();
		},
		
		_isElementVisible: function(elt, startHidden, endHidden, size){
			var d;
			
			switch(elt){
				case "startTimeLabel":
					d = this.item.startTime;
					if(this.item.allDay || this.owner.isStartOfDay(d)){
						return false;
					}
					break;
				case "endTimeLabel":
					d = this.item.endTime;
					if(this.item.allDay || this.owner.isStartOfDay(d)){
						return false;
					}
					break;
			}
			return this.inherited(arguments);
		}
	});
});
