define(["doh", "dojo/base/declare", "../_Invalidating", "dijit/WidgetBase"], 
	function(doh, declare, _Invalidating, WidgetBase){
	doh.register("tests._Invalidating", [
		function test_Lifecycle(t){
			var C = declare("MyWidget", [WidgetBase, _Invalidating], {
				constructor: function(){
					this.invalidatingProperties = ["a"];
					this.addInvalidatingProperties(["b"]);
				}					
			});
			var o = new C();
			o.startup();
			t.is(["a", "b"], o.invalidatingProperties);
		}
	]);
});
