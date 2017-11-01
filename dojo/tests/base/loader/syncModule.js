if (typeof dojoCdnTestLog=="undefined"){
	dojoCdnTestLog= [];
}
dojoCdnTestLog.push("in-dojo.tests.base.loader.syncModule");
dojo.provide("dojo.tests.base.loader.syncModule");
dojo.declare("dojo.tests.base.loader.syncModule", null, {});
dojo.tests.base.loader.syncModule.status= "OK";
dojo.require("dojo.tests.base.loader.syncModuleDep");
dojoCdnTestLog.push("out-dojo.tests.base.loader.syncModule");
