define([
	"dojo/base/declare",
	"./RoundRectList",
	"./_StoreListMixin"
], function(declare, RoundRectList, StoreListMixin){

	// module:
	//		dojox/mobile/RoundRectStoreList

	return declare("dojox.mobile.RoundRectStoreList", [RoundRectList, StoreListMixin], {
		// summary:
		//		A dojo/store-enabled version of RoundRectList.
		// description:
		//		RoundRectStoreList is a subclass of RoundRectList which
		//		can generate ListItems according to the given dojo/store store.
	});
});
