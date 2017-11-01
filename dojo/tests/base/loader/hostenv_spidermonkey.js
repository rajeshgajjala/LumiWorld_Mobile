dojo.provide("dojo.tests.base._loader.hostenv_spidermonkey");

tests.register("tests.base._loader.hostenv_spidermonkey",
	[
		function getText(t){
			var filePath = dojo.moduleUrl("tests.base._loader", "getText.txt");
			var text = readText(filePath);
			t.assertEqual("dojo._getText() test data", text);
		}
	]
);
