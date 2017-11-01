require(['doh', 'dojo/base/kernel', 'dojo/base/sniff', 'dojo/base/url'], function(doh, dojo){

if(dojo.isBrowser){
	doh.registerUrl("dojox.io.tests.scriptFrame", dojo.moduleUrl("dojox.io.tests", "scriptFrame.html"));
}

});
