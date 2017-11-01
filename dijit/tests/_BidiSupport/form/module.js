define(["doh/main", "require"], function(doh, require){

	doh.register("BidiSupport.form.test_PlaceholderInput.", require.toUrl("./test_PlaceholderInput.html"));

	doh.register("BidiSupport.form.multiSelect", require.toUrl("./multiSelect.html"));

	doh.register("BidiSupport.form.noTextDirTextWidgets", require.toUrl("./noTextDirTextWidgets.html"));

	doh.register("BidiSupport.form.Button", require.toUrl("./Button.html"));

	doh.register("BidiSupport.form.Select", require.toUrl("./test_Select.html"));

	doh.register("BidiSupport.form.Slider", require.toUrl("./test_Slider.html"));

	doh.register("BidiSupport.form.robot.Textarea", require.toUrl("./robot/Textarea.html"), 999999);

	doh.register("BidiSupport.form.robot.SimpleComboBoxes", require.toUrl("./robot/SimpleComboBoxes.html"), 999999);

	doh.register("BidiSupport.form.robot.SimpleTextarea", require.toUrl("./robot/SimpleTextarea.html"), 999999);

	doh.register("BidiSupport.form.robot.TextBoxes", require.toUrl("./robot/TextBoxes.html"), 999999);

	doh.register("BidiSupport.form.robot.InlineEditBox", require.toUrl("./robot/InlineEditBox.html"), 999999);

	doh.register("BidiSupport.form.TimeTextBox", require.toUrl("./test_TimeTextBox.html?mode=test"), 999999);

});