define([
	"dojo",
	"dijit",
	"dojox",
	"dijit/_Widget",
	"dijit/TemplatedMixin",
	"dijit/_PaletteMixin",
	"dojo/base/connect",
	"dojo/base/declare",
	"dojo/i18n",
	"dojo/i18n!dojox/editor/plugins/nls/Smiley"
], function(dojo, dijit, dojox, _Widget, TemplatedMixin, _PaletteMixin) {

	dojo.experimental("dojox.editor.plugins._SmileyPalette");

	var Emoticon = dojo.declare("dojox.editor.plugins.Emoticon",
		null,
		{
			// summary:
			//		JS Object representing an emoticon

			constructor: function(/*String*/ id){
				// summary:
				//	 Create emoticon object from an id (like "smile")
				// value: String
				//		alias name 'smile', 'cool' ..
				this.id = id;
			},

			getValue: function(){
				// summary:
				//		Returns a emoticon string in ascii representation, ex: :-)
				return Emoticon.ascii[this.id];
			},

			imgHtml: function(/*String*/ clazz){
				// summary:
				//		Return the HTML string for an `<img>` node that shows this smiley
				var eId = "emoticon" + this.id.substr(0,1).toUpperCase() + this.id.substr(1),
					src = dojo.moduleUrl("dojox.editor.plugins", "resources/emoticons/" + eId + ".gif"),
					label = dojo.i18n.getLocalization("dojox.editor.plugins", "Smiley")[eId],
						html = ['<img src=\"',
						src,
						'\" class=\"',
						clazz,
						'\" alt=\"',
						this.getValue(),
						'\" title=\"',
						label,
						'\">'];
				return html.join("");
			},

			fillCell: function(/*DOMNode*/cell, /*String*/ blankGif){
				dojo.place(this.imgHtml("dijitPaletteImg"), cell);
			}
	});

	Emoticon.ascii = {
		smile: ":-)",
		laughing: "lol",
		wink: ";-)",
		grin: ":-D",
		cool: "8-)",
		angry: ":-@",
		half: ":-/",
		eyebrow: "/:)",
		frown: ":-(",
		shy: ":-$",
		goofy: ":-S",
		oops: ":-O",
		tongue: ":-P",
		idea: "(i)",
		yes: "(y)",
		no: "(n)",
		angel: "0:-)",
		crying: ":'(",
		happy: "=)"
	};

	Emoticon.fromAscii = function(/*String*/str){
		// summary:
		//		Factory to create Emoticon object based on string like ":-)" rather than id like "smile"
		var ascii = Emoticon.ascii;
		for(var i in ascii){
			if(str == ascii[i]){
				return new Emoticon(i);
			}
		}
		return null;
	};

	var SmileyPalette = dojo.declare("dojox.editor.plugins._SmileyPalette", [_Widget, TemplatedMixin, _PaletteMixin], {
		// summary:
		//		A keyboard accessible emoticon-picking widget (for inserting smiley characters)
		// description:
		//		Grid showing various emoticons.
		//		Can be used standalone, or as a popup.

		// templateString:
		//		The template of this widget.
		templateString:
			'<table class="dijitInline dijitEditorSmileyPalette dijitPaletteTable"' +
				' cellSpacing=0 cellPadding=0><tbody dojoAttachPoint="gridNode"></tbody></table>',

		baseClass: "dijitEditorSmileyPalette",

		_palette: [
			["smile", "laughing", "wink", "grin"],
			["cool", "angry", "half", "eyebrow"],
			["frown", "shy", "goofy", "oops"],
			["tongue", "idea", "angel", "happy"],
			["yes", "no", "crying", ""]
		],

		dyeClass: Emoticon,

		buildRendering: function(){
			// Instantiate the template, which makes a skeleton into which we'll insert a bunch of
			// <img> nodes
			this.inherited(arguments);

			var i18n = dojo.i18n.getLocalization("dojox.editor.plugins", "Smiley");

			// Generate hash from emoticon standard name (like "smile") to translation
			var emoticonI18n = {};
			for(var name in i18n){
				if(name.substr(0,8) == "emoticon"){
					emoticonI18n[name.substr(8).toLowerCase()] = i18n[name];
				}
			}
			this._preparePalette(
				this._palette,
				emoticonI18n
			);
		}
	});

	// For monkey-patching
	SmileyPalette.Emoticon = Emoticon;

	return SmileyPalette;
});
