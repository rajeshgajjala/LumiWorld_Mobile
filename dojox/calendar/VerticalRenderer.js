define(["dojo/base/declare", "dijit/WidgetBase", "dijit/TemplatedMixin",
	"dojox/calendar/_RendererMixin", "dojo/text!./templates/VerticalRenderer.html"],
	
	function(declare, WidgetBase, TemplatedMixin, _RendererMixin, template){
	
	return declare("dojox.calendar.VerticalRenderer", [WidgetBase, TemplatedMixin, _RendererMixin], {
		
		// summary:
		//		The default item vertical renderer.		
		
		templateString: template,
		
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
