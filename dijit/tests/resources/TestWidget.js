define([
	"dojo/base/declare",
	"dijit/WidgetBase",
	"dijit/TemplatedMixin"
], function(declare, WidgetBase, TemplatedMixin){
	return declare([WidgetBase, TemplatedMixin], {
		templateString: '<div data-dojo-attach-point="fooNode">TestWidget</div>',
		foo: "bar"
	});
});