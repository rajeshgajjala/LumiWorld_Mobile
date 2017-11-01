define(["doh/main", "require"], function(doh, require){
	if(doh.isBrowser){
		doh.register("tests.base.fx", require.toUrl("./fx.html"), 15000);
	}
});
