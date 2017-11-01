define(["doh/main", "require"], function(doh, require){

	var test_robot = true;

	doh.register("base.manager", require.toUrl("./manager.html"), 999999);
	doh.register("base.wai", require.toUrl("./wai.html"), 999999);
	doh.register("base.place", require.toUrl("./place.html"), 999999);
	doh.register("base.popup", require.toUrl("./popup.html"), 999999);
	if(test_robot){
		doh.register("base.robot.CrossWindow", require.toUrl("./robot/CrossWindow.html"), 999999);
		doh.register("base.robot.FocusManager", require.toUrl("./robot/FocusManager.html"), 999999);
		doh.register("base.robot.focus_mouse", require.toUrl("./robot/focus_mouse.html"), 999999);
	}

});
