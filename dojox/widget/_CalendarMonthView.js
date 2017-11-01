define([
	"dojo/base/declare",
	"./_CalendarView",
	"dijit/TemplatedMixin",
	"./_CalendarMonthYearView",
	"dojo/dom-class",
	"dojo/base/event",
	"dojo/text!./Calendar/CalendarMonth.html"
], function(declare, _CalendarView, TemplatedMixin, _CalendarMonthYearView, domClass, event, template){
	return declare("dojox.widget._CalendarMonthView", [_CalendarView, TemplatedMixin], {
		// summary:
		//		A Calendar view listing the 12 months of the year

		// templateString: String
		//		The template to be used to construct the widget.
		templateString: template,

		// datePart: String
		//		Specifies how much to increment the displayed date when the user
		//		clicks the array button to increment of decrement the view.
		datePart: "year",

		// headerClass: String
		//		Specifies the CSS class to apply to the header node for this view.
		headerClass: "dojoxCalendarMonthHeader",

		// displayedYear: String 
		//              The current year being displayed 
		displayedYear: "", 

		postCreate: function(){
			// summary:
			//		Constructs the view
			this.cloneClass(".dojoxCalendarMonthTemplate", 3);
			this.cloneClass(".dojoxCalendarMonthGroupTemplate", 2);
			this._populateMonths();

			// Add visual effects to the view, if any have been mixed in
			this.addFx(".dojoxCalendarMonthLabel", this.domNode);
		},

		_setValueAttr: function(value){
			var year = this.header.innerHTML = value.getFullYear(); 
			// We should be keeping this info around, might as well expose it too. 
			// Added while patching http://bugs.dojotoolkit.org/ticket/15520 
			this.set("displayedYear", year); 
			this._populateMonths(); 
		},

		_getMonthNames: _CalendarMonthYearView.prototype._getMonthNames,

		_populateMonths: _CalendarMonthYearView.prototype._populateMonths,

		onClick: function(evt){
			// summary:
			//		Handles clicks on month names
			if(!domClass.contains(evt.target, "dojoxCalendarMonthLabel")){event.stop(evt); return;}
			var parentNode = evt.target.parentNode;
			var month = parentNode.cellIndex + (parentNode.parentNode.rowIndex * 4);
			var date = this.get("value");
			// Seeing a really strange bug in FF3.6 where this has to be called twice
			// in order to take affect
			date.setMonth(month);
			date.setMonth(month);
			date.setYear(this.displayedYear);
			this.onValueSelected(date, month);
		}
	});
});