dojo.provide("dojo.tests.base.loader.declareStepsOnProvide");
dojo.provide("dojo.tests.base.loader.declareStepsOnProvide1");

dojo.declare("dojo.tests.base.loader.declareStepsOnProvide", [], {
	status:function(){
		return "OK";
	}
});

dojo.declare("dojo.tests.base.loader.declareStepsOnProvide1", [], {
	status:function(){
		return "OK-1";
	}
});
