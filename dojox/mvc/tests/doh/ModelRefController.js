define([
	"doh",
	"dojo/base/declare",
	"dojo/base/lang",
	"dojo/Stateful",
	"dijit/WidgetBase",
	"dijit/TemplatedMixin",
	"dijit/WidgetsInTemplateMixin",
	"../doh/ModelRefController",
	"dojo/text!../templates/ModelRefControllerInTemplate.html"
], function(doh, declare, lang, Stateful, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, ModelRefController, template){
	doh.register("dojox.mvc.tests.doh.ModelRefController", [
		{
			name: "attachPoint",
			runTest: function(){
				lang.setObject("model", new Stateful());
				var w = new (declare([WidgetBase, TemplatedMixin, WidgetsInTemplateMixin], {
					templateString: template
				}))();
				w.startup();
				doh.t(w.controllerNode, "The controllerNode exists in the template widget");
			},
			tearDown: function(){
				lang.setObject("model", void 0);
			}
		}
	]);
});