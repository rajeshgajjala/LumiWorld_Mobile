define(function(require, exports, module){
	var impliedDep = require("./impliedDep2");
	require("dojo/base/lang").mixin(exports, {
		module:module,
		id:"factoryArityExports",
		impliedDep:impliedDep.id
	});
});
