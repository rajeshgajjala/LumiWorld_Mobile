define(["dojo/dom", "dijit/registry", "dojox/gesture/tap", "dojo/base/lang", "dojo/on",
		"../js/Transitioner", "dojo/request/xhr", "dijit/Dialog", "dojox/mobile/Button",
		"../js/RemoteUpdateModule", "dojo/query", "dojo/dom-style"],
	function (dom, registry, tap, lang, on, Transitioner, xhr, Dialog, Button, RUM, query, style) {

	    var walkthrough = {

	        sectors: new Object,

	        init: function () {

	        },

	        beforeActivate: function () {

	            var loginBtn = dom.byId("LogInBtn");
	            var registerBtn = dom.byId("RegisterBtn");

	            console.log('loginBtn : ' + loginBtn + ' & registerBtn : ' + registerBtn)

	            if ((window.localStorage.getItem("userId") || window.localStorage.getItem("userId") != null) && (window.localStorage.getItem("status") == 3)) {
	                this.autoLogin();
	            } else {
	                console.log('User id not found in local storage ....');

	                this.carryOn();
	            }

	            console.log('Reached here ....');

	            on(loginBtn, tap, lang.hitch(this, "_loginTapped"));
	            on(registerBtn, tap, lang.hitch(this, "_registerTapped"));

	        },

	        afterActivate: function () {

	        },

	        autoLogin: function (dialog) {
	            if (dialog) { dialog.hide() }
	            var context = this;
	            var Rum = new RUM(this);
	            var loginDetails = {};
	            loginDetails.cell = window.localStorage.getItem("userId");
	            loginDetails.password = window.localStorage.getItem("pWord");
	            Rum.userLogin(loginDetails).then(function (result) {
	                if (result == "3") {
	                    walkthrough.sectors = Rum.initialize(["enterprises", "services", "enterpriseservices"]); //Commented out interested in because its not being used currently
	                    Rum.loginUpdate(loginDetails.cell);
	                    walkthrough.sectors.then(function () {
	                        Transitioner.zoomTo({ element: context.domNode, newScreen: "feeds" }, 1, "walkthrough");
	                        if (navigator.splashscreen) {
	                            window.setTimeout(function () { navigator.splashscreen.hide(); }, 3000);
	                        }
	                    }, function (error) {
	                        walkthrough._createDialog("Unable to connect to Luminet World. </br> Please check your Internet connectivity and retry.", lang.hitch(context, context.autoLogin), "Retry");
	                    });
	                } else {
	                    context.carryOn();
	                }

	            }, function (error) {
	                walkthrough._createDialog("Unable to connect to Luminet World. </br> Please check your Internet connectivity and retry.", lang.hitch(context, context.autoLogin), "Retry");
	            });
	        },

	        carryOn: function (dialog) {
	            if (dialog) { dialog.hide() }
	            var context = this;
	            var Rum = new RUM(this);
	            walkthrough.sectors = Rum.initialize(["enterprises", "services", "enterpriseservices"]); //Commented out interested in because its not being used currently
	            walkthrough.sectors.then(function () {
	                if (navigator.splashscreen) {
	                    window.setTimeout(navigator.splashscreen.hide(), 3000);
	                }
	            }, function (error) {
	                walkthrough._createDialog("Unable to connect to Luminet World. </br> Please check your Internet connectivity and retry.", lang.hitch(context, context.carryOn), "Retry");
	            });
	        },

	        _loginTapped: function (event) {
	            console.log('Login Button Tapped ....');
                event.preventDefault();

	            Transitioner.zoomTo({ element: event.currentTarget, newScreen: "login", transition: "none", event: event }, null, "l");
	        },

	        _registerTapped: function (event) {
	            console.log('Register Button Tapped ....');
                event.preventDefault();

	            Transitioner.zoomTo({ element: event.currentTarget, newScreen: "login", transition: "none", event: event }, null, "r");
	        },

	        _createDialog: function (text, funct, btnOk) {
	            var dialog = new Dialog({ title: "Error", content: text + "<br />", class: "claro", daggable: false, style: { color: "black", border: "black 2px solid", textAlign: "center"} });
	            var btnOk = new Button({ label: btnOk, onClick: lang.hitch(this, funct, dialog), style: { color: "black", backgroundColor: "rgba(0,0,0,0)", border: "black 2px solid", width: "35%", height: "30%", backgroundImage: "none", borderRadius: "0px", margin: "5%", fontSize: "1.1em"} }).placeAt(dialog);
	            dialog.show();
	            query(".dijitDialogTitleBar").forEach(function (node) {
	                style.set(node, { backgroundColor: "black", border: "none", backgroundImage: "none", color: "white", textAlign: "left" });
	            });
	            query(".dijitDialogTitle").forEach(function (node) {
	                style.set(node, { color: "white" });
	            });

	        }
	    }

	    return walkthrough;
	});