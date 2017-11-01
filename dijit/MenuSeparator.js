define([
	"dojo/base/declare", // declare
	"dojo/dom", // dom.setSelectable
	"./WidgetBase",
	"./TemplatedMixin",
	"./Contained",
	"dojo/text!./templates/MenuSeparator.html"
], function(declare, dom, WidgetBase, TemplatedMixin, Contained, template){

	// module:
	//		dijit/MenuSeparator

	return declare("dijit.MenuSeparator", [WidgetBase, TemplatedMixin, Contained], {
		// summary:
		//		A line between two menu items

		templateString: template,

		buildRendering: function(){
			this.inherited(arguments);
			dom.setSelectable(this.domNode, false);
		},

		isFocusable: function(){
			// summary:
			//		Override to always return false
			// tags:
			//		protected

			return false; // Boolean
		}
	});
});
