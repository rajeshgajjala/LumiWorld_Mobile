define([
	"dojo/base/kernel",
	"dojo/base/declare",
	"./Container"
], function(kernel, declare, Container){

	kernel.deprecated("dojox/mobile/FixedSplitterPane", "Use dojox/mobile/Container instead", 2.0);

	// module:
	//		dojox/mobile/FixedSplitterPane

	return declare("dojox.mobile.FixedSplitterPane", Container, {
		// summary:
		//		Deprecated widget. Use dojox/mobile/Container instead.

		baseClass: "mblFixedSplitterPane"
	});
});
