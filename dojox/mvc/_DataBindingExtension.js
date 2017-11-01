define([
	"dojo/base/array",
	"dojo/aspect",
	"dojo/base/lang",
	"dijit/WidgetBase",
	"./_DataBindingMixin"
], function(array, aspect, lang, WidgetBase, DataBindingMixin){

	//Apply the data binding mixin to all dijits, see mixin class description for details
	lang.extend(WidgetBase, /*===== {} || =====*/ new DataBindingMixin());

	// monkey patch dijit/WidgetBase.startup to get data binds set up
	aspect.before(WidgetBase.prototype, "startup", function(){
		this._dbstartup();
	});

	// monkey patch dijit/WidgetBase.destroy to remove watches setup in _DataBindingMixin
	aspect.before(WidgetBase.prototype, "destroy", function(){
		if(this._modelWatchHandles){
			array.forEach(this._modelWatchHandles, function(h){ h.unwatch(); });
		}
		if(this._viewWatchHandles){
			array.forEach(this._viewWatchHandles, function(h){ h.unwatch(); });
		}
	});
});
