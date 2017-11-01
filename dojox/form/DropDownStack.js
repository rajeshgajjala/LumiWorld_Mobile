define([
	"dijit/form/Select",
	"./_SelectStackMixin",
	"dojo/base/declare"
], function(Select, _SelectStackMixin, declare){
/*=====
return {
	// summary:
	//		A dropdown-based select stack.
};
=====*/
	return declare("dojox.form.DropDownStack", [ Select, _SelectStackMixin ]);
});