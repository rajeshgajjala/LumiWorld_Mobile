define(["doh/main", "require"], function(doh, require){

	// Utility methods (previously in dijit/base)
	doh.register("registry", require.toUrl("./registry.html"), 999999);
	doh.register("focus", require.toUrl("./focus.html"), 999999);
	doh.register("place", require.toUrl("./place.html"), 999999);
	doh.register("place-margin", require.toUrl("./place-margin.html"), 999999);
	doh.register("place-clip", require.toUrl("./place-clip.html"), 999999);
	doh.register("popup", require.toUrl("./popup.html"), 999999);
	doh.register("a11y", require.toUrl("./a11y.html"), 999999);
	doh.register("robot.typematic", require.toUrl("./robot/typematic.html"), 999999);

	// Widget
	doh.register("Widget-lifecycle", require.toUrl("./Widget-lifecycle.html"), 999999);
	doh.register("Widget-attr", require.toUrl("./Widget-attr.html"), 999999);
	doh.register("Widget-subscribe", require.toUrl("./Widget-subscribe.html"), 999999);
	doh.register("Widget-placeAt", require.toUrl("./Widget-placeAt.html"), 999999);
	doh.register("robot.Widget-on", require.toUrl("./Widget-on.html"), 999999);
	doh.register("robot.Widget-deferredConnect", require.toUrl("./robot/Widget-deferredConnect.html"), 999999);
	doh.register("robot.Widget-ondijitclick_mouse", require.toUrl("./robot/Widget-ondijitclick_mouse.html"), 999999);
	doh.register("robot.Widget-ondijitclick_a11y", require.toUrl("./robot/Widget-ondijitclick_a11y.html"), 999999);

	// Templated and other mixins
	doh.register("AttachMixin", require.toUrl("./AttachMixin.html"), 999999);
	doh.register("TemplatedMixin", require.toUrl("./TemplatedMixin.html"), 999999);
	doh.register("WidgetsInTemplateMixin", require.toUrl("./WidgetsInTemplateMixin.html"), 999999);
	doh.register("Templated-widgetsInTemplate1.x", require.toUrl("./Templated-widgetsInTemplate1.x.html"), 999999);
	doh.register("Container", require.toUrl("./Container.html"), 999999);
	doh.register("KeyNavContainer", require.toUrl("./KeyNavContainer.html"), 999999);
	doh.register("HasDropDown", require.toUrl("./HasDropDown.html"), 999999);

	doh.register("Declaration", require.toUrl("./test_Declaration.html"), 999999);
	doh.register("Declaration_1.x", require.toUrl("./test_Declaration_1.x.html"), 999999);

	// Miscellaneous
	doh.register("NodeList-instantiate", require.toUrl("./NodeList-instantiate.html"), 999999);
	doh.register("Destroyable", require.toUrl("./Destroyable.html"), 999999);
	doh.register("robot.BgIframe", require.toUrl("./robot/BgIframe.html"), 999999);

});
