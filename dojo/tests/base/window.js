define(["doh/main", "require"], function(doh, require){
	if(doh.isBrowser){
		doh.register("tests.base.window", require.toUrl("./window.html"), 15000);
	}
});
