define([
	"dojo/base/kernel",	// dojo.getObject
	"dojo/base/declare",
	"dojo/parser",
	"./widgetParser"
], function(declare, parser, widgetParser){

dojo.getObject("xml", true, dojox);

declare("dojox.xml.Script", null, {
	constructor: function(props, node){
		parser.instantiate(
			widgetParser._processScript(node)
		);
	}
});

return dojox.xml.Script;

});
