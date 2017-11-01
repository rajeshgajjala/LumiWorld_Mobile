define(["doh/main", "require"], function(doh, require){
	if(doh.isBrowser){
		doh.register("tests.base.xhr", require.toUrl("./xhr.html"), 60000);
	}
});
