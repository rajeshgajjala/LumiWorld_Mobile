define([
	"dojo/base/config",
	"dojo/has",
	"dijit/WidgetBase",
	"./atBindingExtension"
], function(config, has, WidgetBase, atBindingExtension){
	has.add("mvc-extension-per-widget", (config["mvc"] || {}).extensionPerWidget);
	if(!has("mvc-extension-per-widget")){
		atBindingExtension(WidgetBase.prototype);
	}
});
