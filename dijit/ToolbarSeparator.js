define([
	"dojo/base/declare", // declare
	"dojo/dom", // dom.setSelectable
	"./Widget",
	"./TemplatedMixin"
], function(declare, dom, Widget, TemplatedMixin){

	// module:
	//		dijit/ToolbarSeparator


	return declare("dijit.ToolbarSeparator", [Widget, TemplatedMixin], {
		// summary:
		//		A spacer between two `dijit.Toolbar` items

		templateString: '<div class="dijitToolbarSeparator dijitInline" role="presentation"></div>',

		buildRendering: function(){
			this.inherited(arguments);
			dom.setSelectable(this.domNode, false);
		},

		isFocusable: function(){
			// summary:
			//		This widget isn't focusable, so pass along that fact.
			// tags:
			//		protected
			return false;
		}
	});
});
