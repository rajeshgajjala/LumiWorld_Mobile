define([
	"./WidgetBase",
	"./TemplatedMixin",
	"./WidgetsInTemplateMixin",
	"dojo/base/array", // array.forEach
	"dojo/base/declare", // declare
	"dojo/base/lang", // lang.extend lang.isArray
	"dojo/base/kernel" // kernel.deprecated
], function(WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, array, declare, lang, kernel){

	// module:
	//		dijit/Templated

	// These arguments can be specified for widgets which are used in templates.
	// Since any widget can be specified as sub widgets in template, mix it
	// into the base widget class.  (This is a hack, but it's effective.)
	// Remove for 2.0.   Also, hide from API doc parser.
	lang.extend(WidgetBase, /*===== {} || =====*/ {
		waiRole: "",
		waiState:""
	});

	return declare("dijit.Templated", [TemplatedMixin, WidgetsInTemplateMixin], {
		// summary:
		//		Deprecated mixin for widgets that are instantiated from a template.
		//		Widgets should use TemplatedMixin plus if necessary WidgetsInTemplateMixin instead.

		// widgetsInTemplate: [protected] Boolean
		//		Should we parse the template to find widgets that might be
		//		declared in markup inside it?  False by default.
		widgetsInTemplate: false,

		constructor: function(){
			kernel.deprecated(this.declaredClass + ": dijit.Templated deprecated, use dijit.TemplatedMixin and if necessary dijit.WidgetsInTemplateMixin", "", "2.0");
		},

		_processNode: function(baseNode, getAttrFunc){
			var ret = this.inherited(arguments);

			// Do deprecated waiRole and waiState
			var role = getAttrFunc(baseNode, "waiRole");
			if(role){
				baseNode.setAttribute("role", role);
			}
			var values = getAttrFunc(baseNode, "waiState");
			if(values){
				array.forEach(values.split(/\s*,\s*/), function(stateValue){
					if(stateValue.indexOf('-') != -1){
						var pair = stateValue.split('-');
						baseNode.setAttribute("aria-"+pair[0], pair[1]);
					}
				});
			}

			return ret;
		}
	});
});
