define(["dojox/mobile/TransitionEvent","dojo/dom","dojo/dom-construct","dojo/dom-style",
		"dojo/fx","dojox/css3/fx","dojo/on","dojo/base/lang", "dijit/registry"],
		function(TransitionEvent, dom, domConstruct, style, fx, cssFx, on, lang, registry){

var transitioner = {
		
		initialize: function (screen){
			
		},
		/**
		This method is the actual transition handler it queues the View Elements and fires the TransitionEvent allowing Dojo to
		start the transition to the next View.
		@method move
		@param element {String, DOMObject} The element calling the transition event
		@param screen {String} then Screen to transition too.
		 */		
		move: function (element, screen) {

				try{
				var domElement = dom.byId(element);
				var parent;

				if(domElement.nodeName == "div"){
					parent = domElement;
				}else{
					parent = domElement.parentNode;

					while(parent != null && parent.nodeName == "div"){
						parent = parent.parentNode
					}

					console.log(displayList[parent.id]);
				}
				
				
				//fx.rotate({node:parent, duration:1000, startAngle:0, endAngle:-90}).play();
				
				domClass.add(parent.id, "animationTestOut");

				domClass.add(screen, "animationTestIn");

				function AnimationOneListener(){

					var opts = (moveTo && typeof(moveTo) === "object") ? moveTo : {moveTo: screen, href: "", url: "", scene: "", transition: "none", transitionDir: 1};

					new TransitionEvent(domElement, opts).dispatch();	
					domClass.remove(parent.id, "animationTestOut");
				}

				function AnimationTwoListener(){

					domClass.remove(screen, "animationTestIn");
				}

				var anim = document.getElementById(parent.id);
				anim.addEventListener("webkitAnimationEnd", AnimationOneListener, false);
				anim = document.getElementById(screen);
				anim.addEventListener("webkitAnimationEnd", AnimationTwoListener, false);
				}
				catch(error){ console.log(error);}

		},

		zoomTo: function (options, parentId, settings, filter){
		
			var domElement = dom.byId(options.element);
			var opts = {
				bubbles:true, 
				target: options.newScreen, 
				transition: options.transition || "slide", 
				transitionDir: options.direction || 1,
				params: {"parentid" : parentId, "settings" : settings || "feeds", "filter": filter || 0},
				/*postMixInProperties: function(){
            		this.inherited(arguments);
            		this.transitionOptions = {params: {"parentid" : "parentId"}};
				}*/
			};
			
			if(options.opts){
				lang.mixin(opts, options.opts);
			}
			
			new TransitionEvent(domElement, opts).dispatch();
		},
		
		/**
		This method is the actual transition handler it queues the View Elements and fires the TransitionEvent allowing Dojo to
		start the transition to the next View.
		@method rotate
		@param element {String, DOMObject} The element calling the transition event
		@param screen {String} then Screen to transition too.
		 */		
		rotate: function (options, parentId, settings) {
		
			var outStartAngle = "0deg";
			var outEndAngle = "-90deg";
			var inStartAngle = "90deg";
			var inEndAngle = "0deg";
		
			style.set(options.element, "-webkit-transform-origin" ,"50% 150%");
			style.set(options.element, "transform-origin" ,"50% 150%"); //For safety sake in case the web view we are running in is not webkit.
			
			
			if(options.direction > -1){
				outStartAngle = "0deg";
				outEndAngle = "90deg";
				inStartAngle = "-90deg";
				inEndAngle = "0deg";
			}
			
			var animationOneOnEnd = function(){
				var opts = {
					bubbles:true, 
					target: options.newScreen, 
					transition: "none", 
					params: {"parentid" : parentId, "settings" : settings || "c"},
				};
				
				if(options.opts){
					lang.mixin(opts, options.opts);
				}

				try{
					new TransitionEvent(options.event.target, opts).dispatch();
				}catch(e){
					console.log(e);
				}
				
				var rIn = cssFx.rotate(
				{
					node : options.element,
					duration: 250,
					startAngle: inStartAngle,
					endAngle: inEndAngle}
				).play();
			}
			
			var rOut = cssFx.rotate(
				{
				node : options.element,
				duration: 250,
				startAngle: outStartAngle,
				endAngle: outEndAngle,
				onEnd: animationOneOnEnd}
			).play();			

		}
}

return transitioner;
});
