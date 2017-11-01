define([
	"doh",
	"dojo/base/declare",
	"dijit/registry",
	"dijit/WidgetBase",
	"dijit/TemplatedMixin",
	"dijit/WidgetsInTemplateMixin",
	"../doh/_Controller",
	"dojo/text!../templates/_ControllerInTemplate.html"
], function(doh, declare, registry, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, _Controller, template){
	doh.register("dojox.mvc.tests.doh._Controller", [
		function destroyFromWidgetsInTemplate(){
			var w = new (declare([WidgetBase, TemplatedMixin, WidgetsInTemplateMixin], {
				templateString: template
			}))({}, document.createElement("div"));
			w.startup();
			var ctrl = w.controllerNode,
			 id = ctrl.id;
			w.destroy();
			doh.f(registry.byId(id), "The controller should have been removed from registry along with the template widget");
			doh.t(ctrl._destroyed, "The controller should have been marked as destroyed along with the template widget");
		}
	]);
});