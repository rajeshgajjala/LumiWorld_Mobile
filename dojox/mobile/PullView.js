define([
	"dojo/base/declare",
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dojo/topic",
	"./ScrollablePane"
], function(declare, domConstruct, domGeometry, domStyle, topic, ScrollablePane){

	// module:
	//		dojox/mobile/PullView

	return declare("dojox.mobile.PullView", ScrollablePane, {
		// summary:
		//		A scrollable view that can be pulled to invoke an action.
		// description:
		//		The PullView widget is a subclass of ScrollableView. It can have
		//		a message box at the top (or bottom) of the view, which is
		//		revealed when you scroll to the top (or bottom) and pull down
		//		(or up) the view. This widget is intended to be used for
		//		implementing the "Pull Down to Refresh" feature or something
		//		similar.
		//
		//		This widget takes the first child node as a root node of the
		//		message box.

		// reveal: Boolean
		//		If true, the message box is kept showing when it is entirely
		//		pulled down and released. If false, the message box is hidden
		//		immediately without animation.
		reveal: true,

		// pullDir: String
		//		If "down", the message box appears at the top of the view
		//		when you scroll to the top and pull down the view.
		//		If "up", the message box appears at the bottom of the view
		//		when you scroll to the bottom and pull up the view.
		pullDir: "down",

		// enabled: Boolean
		//		If false, the message box never appears.
		enabled: true,

		// weight: Number
		//		Overrides scrollable.weight
		weight: 0.4,
		
		height: "auto",

		buildRendering: function(){
			this.inherited(arguments);
			var child = this.domNode.childNodes[0];
			var children = child.childNodes;
			for(var i = 0; i < children.length; i++){
				if(children[i].nodeType === 1){
					this.pullBoxNode = children[i];
					break;
				}
			}
		},

		startup: function(){
			if(this._started){ return; }
			this.inherited(arguments);

			var height = 320; // enough height for any devices
			this.areaNode = domConstruct.create("div", {
				className: "mblPullViewArea",
				style: {
					position: "absolute",
					width: "100%",
					height: height + "px" //IVAN: overriding original height value for our purpose.
				}
			}, this.containerNode, this.pullDir == "down" && "first");
			domStyle.set(this.pullBoxNode, {
				position: "absolute",
				width: "100%",
				bottom: "0"
			});
			this.areaNode.appendChild(this.pullBoxNode);
			if(this.pullDir == "up"){
				domStyle.set(this.areaNode, {
					bottom: -this.pullBoxNode.offsetHeight + "px",
					height: this.pullBoxNode.offsetHeight + "px"
				});
			}else{
				this.areaNode.style.top = -height + "px";
			}
			this.areaNode.style.visibility = "hidden";
		},

		bottomPos: function(){
			// summary:
			//		Returns the bottom position.
			var vfh = this.isLocalFooter && this.fixedFooterHeight || 0;
			return this.domNode.offsetHeight - domGeometry.getMarginBox(this.containerNode).h - vfh;
		},

		adjustDestination: function(/*Object*/ to, /*Object*/ pos, /*Object*/ dim){
			// summary:
			//		Overrides scrollable.adjustDestination()
			this.inherited(arguments);
			if(!this.enabled){ return true; }
			var h = this.pullBoxNode.offsetHeight,
				y = this.getPos().y,
				b = this.bottomPos(),
				disp, home;
				
			if(this.pullDir == "down" && y >= h){
				disp = h;
				home = 0;
				this.slideTo({y:disp}, 0.3, "ease-out");
				topic.publish("/dojox/mobile/onPulled", [this]);
				this._onPulled(this);
			}else if(/*this.pullDir == "up" && */y < b - (h)){
				disp = b >= 0 ? y : b - h;
				home = b;
				this.slideTo({y:disp}, 0.3, "ease-out");
				topic.publish("/dojox/mobile/onBottomedOut", [this]);
				this._onBottomedOut(this);
			}else{
				return true;
			}

			/*if(this.reveal){
				// keeps the message box showing
				this.slideTo({y:disp}, 0.3, "ease-out");
			}else{
				// returns immediately to the normal position
				this.scrollTo({y:home}, false);
				this.onFlickAnimationEnd({target:null});
			}*/
			return false;
		},

		scrollTo: function(/*Object*/ to, /*Boolean?*/ doNotMoveScrollBar, /*DomNode?*/ node){
			// summary:
			//		Overrides scrollable.scrollTo()
			this.inherited(arguments); // scrollable#scrollTo() will be called
			if(!this.enabled){ return; }
			var h = this.pullBoxNode.offsetHeight;
			if(!h){ return; } // maybe I am hidden
			var b = this.bottomPos();
			if(this.pullDir == "down" && to.y <= 0 ||
			   this.pullDir == "up" && to.y >= b){
				this.areaNode.style.visbility = "hidden";
			}else{
				this.areaNode.style.visibility = "";
				topic.publish("/dojox/mobile/onPull", [this, to.y, h]);
				this._onPull(this, to.y, h);
			}
		},

		_onPull: function(/*Widget*/ view, /*Number*/ y, /*Number*/ h){
			// summary:
			//		Internal handler.
			// tags:
			//		protected
			this.onPull.apply(this, arguments);
		},

		onPull: function(/*Widget*/ view, /*Number*/ y, /*Number*/ h){
			// summary:
			//		A stub function to override or connect to from your application.
			// view:
			//		This widget.
			// y:
			//		The vertical scroll position (in pixels).
			// h:
			//		The height of the message box (in pixels).
			// description:
			//		Called while the message box is being pulled.
		},

		_onPulled: function(/*Widget*/ view){
			// summary:
			//		Internal handler.
			// tags:
			//		protected
			this.onPulled.apply(this, arguments);
		},

		onPulled: function(/*Widget*/ view){
			// summary:
			//		A stub function to override or connect to from your application.
			// view:
			//		This widget.
			// description:
			//		Called when the message box is entirely pulled down and then
			//		released.
		},
		
		_onBottomedOut: function(/*Widget*/ view){
			// summary:
			//		Internal handler.
			// tags:
			//		protected
			console.log("Bottom Fired");
			this.onBottomedOut.apply(this, arguments);
		},

		onBottomedOut: function(/*Widget*/ view){
			// summary:
			//		A stub function to override or connect to from your application.
			// view:
			//		This widget.
			// description:
			//		Called when the message box is entirely pulled down and then
			//		released.
		},

		_setEnabledAttr: function(/*Boolean*/ value){
			// summary:
			//		Enable or disable the message box.
			if(this.enabled != value){
				this.areaNode.style.display = value ? "" : "none";
				this._set("enabled", value);
			}
		}
	});
});
