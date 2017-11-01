define(["doh/main", "require"], function(doh, require){
	doh.register("BidiSupport.layout.TabContainer", require.toUrl("./TabContainer.html"), 999999);
	doh.register("BidiSupport.layout.StackContainer", require.toUrl("./StackContainer.html"), 999999);
	doh.register("BidiSupport.layout.AccordionContainer", require.toUrl("./AccordionContainer.html"), 999999);
});
