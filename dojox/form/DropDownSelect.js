define([
	"dojo/base/kernel",
	"dojo/base/lang",
	"dijit/form/Select"
], function(kernel, lang, Select){
	kernel.deprecated("dojox.form.DropDownSelect", "Use Select instead", "2.0");

	lang.setObject("dojox.form.DropDownSelect", Select);
	return Select;
});