require(["dojox/app/build/buildControlApp"], function(){
});
 
var profile = {
    // relative to this file
    basePath: "../..",
    // relative to base path
    releaseDir: "./Lumi-release",
    action: "release",
    cssOptimize: "comments",
    mini: true,
    packages:[{
        name: "dojo",
        location: "./dojo"
    },{
        name: "dijit",
        location: "./dijit"
    },{
        name: "LuminetWorld",
        location: "./LuminetWorld"
    },{
        name: "dojox",
        location: "./dojox"
    }],
    selectorEngine: "acme",
    layers: {
        "dojo/dojo": {
            boot: true,
            customBase: true
        },
        "LuminetWorld/index": {
            include: ["LuminetWorld/index"]
        }
    }
};