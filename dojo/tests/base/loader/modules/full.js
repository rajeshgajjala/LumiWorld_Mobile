define("dojo/tests/base/loader/modules/full", ["./anon", "../a", "./wrapped", "require"], function(anon, a, wrapped, require){
	return {
		twiceTheAnswer: a.number + require("../a").number
	};
});