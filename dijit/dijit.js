define([
	"./main",
	"./base",
	"dojo/parser",
	"./Widget",
	"./TemplatedMixin",
	"./Container",
	"./layout/_LayoutWidget",
	"./form/_FormWidget",
	"./form/_FormValueWidget"
], function(dijit){

	// module:
	//		dijit/dijit

	/*=====
	return {
		// summary:
		//		A roll-up for common dijit methods
		//		All the stuff in base (these are the function that are guaranteed available without an explicit dojo.require)
		//		And some other stuff that we tend to pull in all the time anyway
	};
	=====*/

	return dijit;
});
