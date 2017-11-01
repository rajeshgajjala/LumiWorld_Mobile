define(["doh", "dojo/base/declare", "../Selection", "dijit/WidgetBase"], 
	function(doh, declare, Selection, WidgetBase){
	doh.register("tests.Selection", [
		function test_Lifecycle(t){
			var C = declare("MyWidget", [WidgetBase, Selection], {
				updateRenderers: function(){
				}
			});
			var o = new C();
			o.set("selectedItem", "1");
			t.is("1", o.get("selectedItem"));
			t.is(["1"], o.get("selectedItems"));
			o.set("selectedItems", ["2"]);
			t.is("2", o.get("selectedItem"));
			t.is(["2"], o.get("selectedItems"));
			o = new C({selectedItem: "1"});
			t.is("1", o.get("selectedItem"));
			t.is(["1"], o.get("selectedItems"));
		}
	]);
});
