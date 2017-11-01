define([
	"dojo/base/declare",
	"dojo/base/sniff",
	"dojo/dom",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/topic",
	"./ProgressIndicator",
	"./PullView",
	"require"
], function(declare, has, dom, domConstruct, domStyle, topic, ProgressIndicator, PullView, require){

	// module:
	//		dojox/mobile/CustomPullView

	return declare("dojox.mobile.CustomPullView", PullView, {
		// summary:
		//		PullView with pre-defined message boxes.
		// description:
		//		The CustomPullView widget is a subclass of PullView.
		//		For convenience, this widget provides the following three
		//		pre-defined message boxes that appear when you pull down/up the
		//		view content.
		//
		//		1. Pull Down to Refresh
		//		2. Pull Down to Go Back
		//		3. Pull Up to Load More
		//
		//		If you want to customize the behavior or appearance of those
		//		pre-defined message boxes, you should use the base PullView
		//		class directly.

		// type: String
		//		The value must be either "refresh", "back", or "more".
		//		"refresh": Pull Down to Refresh
		//		"back": Pull Down to Go Back
		//		"more": Pull Up to Load More
		type: "refresh",

		// icon: String
		//		A path for an arrow icon to be shown in the message box.
		icon: require.toUrl("./themes/common/images/refresh-arrow.png"),

		_messages: { // TODO: i18n
			loading: "Loading...",
			newItem: "Check for new items",
			moreItem: "Check for more items",
			pullDownToGoBack: "Pull down to go back",
			goBack: "Go back",
			pullUpToLoadMore: "Pull up to load more...",
			releaseToLoadMore: "Release to load more...",
			pullDownToRefresh: "Pull down to refresh...",
			releaseToRefresh: "Release to refresh..."
		},

		buildRendering: function(){
			if(this.type == "back"){
				this.reveal = false;
			}else if(this.type == "more"){
				this.pullDir = "up";
			}
			this.inherited(arguments);
			this.pullBoxNode = domConstruct.create("div", {
				className: "mblCustomPullViewPullBox"
			}, this.containerNode, "first");
			if(this.type == "back"){
				this.msg0Node = domConstruct.create("div", {
					className: "mblCustomPullViewMsg0"
				}, this.pullBoxNode);
				this.knobWrapperNode = domConstruct.create("div", {
					className: "mblCustomPullViewKnobWrapper"
				}, this.pullBoxNode);
				this.knobNode = domConstruct.create("div", {
					className: "mblCustomPullViewKnob"
				}, this.knobWrapperNode);
			}else{
				this.progNode = domConstruct.create("div", {
					className: "mblCustomPullViewProg"
				}, this.pullBoxNode);
				this.imgNode = domConstruct.create("img", {
					className: "mblCustomPullViewIcon",
					src: this.icon
				}, this.pullBoxNode);
				this.msg1Node = domConstruct.create("div", {
					className: "mblCustomPullViewMsg1"
				}, this.pullBoxNode);
				this.msg2Node = domConstruct.create("div", {
					className: "mblCustomPullViewMsg2",
					innerHTML: this._messages[this.pullDir == "up" ? "moreItem" : "newItem"]
				}, this.pullBoxNode);
			}
		},

		_rotate: function(/*Number*/ deg){
			// summary:
			//		Rotate the icon node.
			if(has("webkit")){
				this.imgNode.style.webkitTransform = "rotate("+deg+"deg)";
			}else if(has("ff")){
				this.imgNode.style.MozTransform = "rotate("+deg+"deg)";
			}
		},

		_onPull: function(/*Widget*/view, /*Number*/y, /*Number*/h){
			// summary:
			//		Internal handler.
			// tags:
			//		private
			var percent;
			if(this.type == "back"){
				y = y > h ? h : y;
				percent = Math.round(y / h * 100);
				this.knobNode.style.left = (100 - percent) + "px";
				this.msg0Node.innerHTML = this._messages[y < h ? "pullDownToGoBack" : "goBack"];
			}else if(this.pullDir == "up"){
				var b = view.bottomPos();
				y = y <= b - h ? h : b - y;
				percent = y / h * 100;
				this._rotate(-1.8 * percent + 180);
				this.msg1Node.innerHTML = this._messages[percent < 100 ? "pullUpToLoadMore" : "releaseToLoadMore"];
			}else{
				y = y > h ? h : y;
				percent = y / h * 100;
				this._rotate(-1.8 * percent + 360);
				this.msg1Node.innerHTML = this._messages[percent < 100 ? "pullDownToRefresh" : "releaseToRefresh"];
			}
			this.inherited(arguments);
		},

		_onPulled: function(/*Widget*/view){
			// summary:
			//		Internal handler.
			// tags:
			//		private
			if(this.type != "back"){
				if(!this._prog){
					this._prog = new ProgressIndicator({size:20, center:false});
				}
				if(this.isBusy()){ return; }
				this.imgNode.style.visibility = "hidden";
				this.msg1Node.innerHTML = this._messages["loading"];
				this.progNode.appendChild(this._prog.domNode);
				this._prog.start();
			}
			this.inherited(arguments);
		},

		isBusy: function(){
			// summary:
			//		Returns true if the progress indicator is spinning.
			return !!(this._prog && this._prog.timer);
		},

		closeMessageBox: function(){
			// summary:
			//		Closes the message box and stops the progress indicator.
			if(this.isBusy()){
				if(this.pullDir == "down"){
					this.slideTo({y:0}, 0.3, "ease-out");
				}
				this._prog.stop();
				this.imgNode.style.visibility = "visible";
			}
		}
	});
});
