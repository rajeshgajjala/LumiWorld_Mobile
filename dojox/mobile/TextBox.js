define([
	"dojo/base/declare",
	"dojo/dom-construct",
	"dijit/WidgetBase",
	"dijit/form/_FormValueMixin",
	"dijit/form/_TextBoxMixin",
	"dojo/has",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/TextBox"
], function(declare, domConstruct, WidgetBase, FormValueMixin, TextBoxMixin, has, BidiTextBox){

	var TextBox = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiTextBox" : "dojox.mobile.TextBox", [WidgetBase, FormValueMixin, TextBoxMixin],{
		// summary:
		//		A non-templated base class for textbox form inputs

		baseClass: "mblTextBox",

		// Override automatic assigning type --> node, it causes exception on IE8.
		// Instead, type must be specified as this.type when the node is created, as part of the original DOM
		_setTypeAttr: null,

		// Map widget attributes to DOMNode attributes.
		_setPlaceHolderAttr: function(/*String*/value){
			value = this._cv ? this._cv(value) : value;
			this._set("placeHolder", value);
			this.textbox.setAttribute("placeholder", value);
		},

		buildRendering: function(){
			if(!this.srcNodeRef){
				this.srcNodeRef = domConstruct.create("input", {"type":this.type});
			}
			this.inherited(arguments);
			this.textbox = this.focusNode = this.domNode;
		},

		postCreate: function(){
			this.inherited(arguments);
			this.connect(this.textbox, "onmouseup", function(){ this._mouseIsDown = false; });
			this.connect(this.textbox, "onmousedown", function(){ this._mouseIsDown = true; });
			this.connect(this.textbox, "onfocus", function(e){
				this._onFocus(this._mouseIsDown ? "mouse" : e);
				this._mouseIsDown = false;
			});
			this.connect(this.textbox, "onblur", "_onBlur");
		}
	});
	return has("dojo-bidi") ? declare("dojox.mobile.TextBox", [TextBox, BidiTextBox]) : TextBox;	
});
