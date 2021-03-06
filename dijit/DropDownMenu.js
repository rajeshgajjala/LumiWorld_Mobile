define([
	"dojo/base/declare", // declare
	"dojo/keys", // keys
	"dojo/text!./templates/Menu.html",
	"./OnDijitClickMixin",
	"./MenuBase"
], function(declare, keys, template, OnDijitClickMixin, MenuBase){

	// module:
	//		dijit/DropDownMenu

	return declare("dijit.DropDownMenu", [MenuBase, OnDijitClickMixin], {
		// summary:
		//		A menu, without features for context menu (Meaning, drop down menu)

		templateString: template,

		baseClass: "dijitMenu",

		// Arrow key navigation
		_onUpArrow: function(){
			this.focusPrev();
		},
		_onDownArrow: function(){
			this.focusNext();
		},
		_onRightArrow: function(/*Event*/ evt){
			this._moveToPopup(evt);
			evt.stopPropagation();
			evt.preventDefault();
		},
		_onLeftArrow: function(){
			if(this.parentMenu){
				if(this.parentMenu._isMenuBar){
					this.parentMenu.focusPrev();
				}else{
					this.onCancel(false);
				}
			}else{
				evt.stopPropagation();
				evt.preventDefault();
			}
		}
	});
});
