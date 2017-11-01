define("test/Module", ["dijit","dojo","dojox","dojo/require!dijit/TemplatedMixin"], function(dijit,dojo,dojox){
	console.log('MODULE loaded');

	dojo.provide('test.Module');

	dojo.require('dijit.TemplatedMixin');

	dojo.declare('test.Module', [ dijit.TemplatedMixin ], { foo : null });
});
