define([
	"dojo/base/declare",
	"dijit/WidgetBase",
	"dijit/TemplatedMixin",
	"dijit/WidgetsInTemplateMixin",
	"dijit/registry",
	"dojo/text!./test_mvc_widget_template.html",
	"dojox/mvc/at",
	"dijit/form/TextBox",
	"dojox/mvc/Group",
	"dojox/mvc/Repeat"
], function(declare, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, registry, template, at){
	return declare("dojox.mvc.tests.test_templatedWidget.myMvcTemplated", [WidgetBase, TemplatedMixin, WidgetsInTemplateMixin], {
		// summary:
		//		A sample templated widget for dojox.mvc
		// description:
		//		This template is used to show how to use exprchar to avoid instance of TemplatedMixin error in dojo.mvc data binding.
		//		If the templateString contains ${xxx}, it will throw an template error, use #{xxx} with exprchar :"#" instead.
		//		See how it works in test_mvc_widget.html and test_mvc_widget_template.html

		// ctrl: dojox.mvc.ModelRefController
		//		The controller that the form widgets in the template refer to.
		ctrl: null,

		templateString: template,

		buildRendering: function(){
			console.log("call myMvcTemplated buildRendering");
			window.at = at;			
			this.inherited(arguments);
		},

		getParent: function(){
			console.log("Call myMvcTemplated getParent");
			return null;
		}
	});
});
