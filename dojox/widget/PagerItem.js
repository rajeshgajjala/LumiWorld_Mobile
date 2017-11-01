define(["dojo/base/declare", "dojo/dom-geometry", "dojo/dom-style", "dojo/parser", "dijit/WidgetBase", "dijit/TemplatedMixin"],
    function(declare, geometry, style, parser, WidgetBase, TemplatedMixin){

return declare("dojox.widget._PagerItem",
    [WidgetBase, TemplatedMixin],
    {

    templateString: '<li class="pagerItem" data-dojo-attach-point="containerNode"></li>',

    resizeChildren: function(){
        var box = geometry.getMarginBox(this.containerNode);
        style.set(this.containerNode.firstChild, {
            width: box.w +'px',
            height: box.h + 'px'
        });
    },

    parseChildren: function(){
        parser.parse(this.containerNode);
    }
});

});