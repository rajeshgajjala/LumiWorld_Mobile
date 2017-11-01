define(["dojo/has", "./WidgetBase", "./BidiMixin"], function(has, WidgetBase, BidiMixin){

	// module:
	//		dijit/BidiSupport

	/*=====
	return function(){
		// summary:
		//		Deprecated module for enabling textdir support in the dijit widgets.   New code should just define
		//		has("dojo-bidi") to return true, rather than manually requiring this module.
	};
	=====*/

	WidgetBase.extend(BidiMixin);

	// Back-compat with version 1.8: just including BidiSupport should trigger bidi support in all the widgets.
	// Although this statement doesn't do much because the other widgets have likely already been loaded.
	has.add("dojo-bidi", true);

	return WidgetBase;
});
