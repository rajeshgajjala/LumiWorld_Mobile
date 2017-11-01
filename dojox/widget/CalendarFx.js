define([
	"dojo/base/kernel",
	"dojo/base/declare",
	"./CalendarFisheye",
	"./_FisheyeFX"
], function(kernel, declare, CalendarFisheye, _FisheyeFX){
	kernel.experimental("dojox/widget/CalendarFx");

	return declare("dojox.widget.CalendarFx", [CalendarFisheye, _FisheyeFX], {
		// summary:
		//		The visual effects extensions for dojox/widget/Calendar.
	});
});
