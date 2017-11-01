define(["dojo/dom", "dijit/registry", "dojox/gesture/tap", "dojo/base/lang",
		"dojo/on", "../js/Transitioner", "dojo/request/xhr", "dijit/Dialog",
		"dojox/mobile/Button", "../js/RemoteUpdateModule", "dijit/form/ValidationTextBox", "dojo/json",
		"dojo/dom-construct", "../widget/headerBar/headerBar", "dojo/dom-style", "dojo/query"],
	function (dom, registry, tap, lang, on, Transitioner, xhr, Dialog, Button, RUM, validationTextBox, json, domConstruct, HeaderBar, style, query) {

	    var logIn = {

	        loginForm: {},

	        headerWidget: new Object,

	        dialog: new Object,

	        eventHandler: new Object,

	        init: function () {
	            logIn.headerWidget = new HeaderBar();
	            logIn.headerWidget.backButtonOnTap = lang.hitch(this, "_settingsButtonTap", this);
	            on(dom.byId("T&CLink"), 'click', lang.hitch(this, "_TsAndCsClick"));
	        },

	        beforeActivate: function () {

	            var headerPlaceHolder = dom.byId("loginHeader");

	            logIn.headerWidget.set('backButtonText', 'Cancel');
	            logIn.headerWidget.set('backButtonImgVisible', false);

	            this.loginForm = registry.byId("loginForm");

	            switch (this.params.settings) {
	                case 'l':
	                    logIn.headerWidget.set('title', 'Login');
	                    logIn.headerWidget.set('contextButtonText', 'Log In');
	                    style.set(dom.byId("T&CDiv"), "display", "block");
	                    style.set(dom.byId("mobileNumberText"), "display", "none");
	                    var password = registry.byId("SignUp.password")
	                    password.set("pattern", "(?=.*[a-z])[0-9a-zA-Z]{6,}");
	                    password.set("disabled", false);
	                    style.set(password.domNode, "display", "");
	                    var btnLostPassword = dom.byId("btnLostPassword");
	                    if (btnLostPassword == null) {
	                        btnLostPassword = domConstruct.create("button", { innerHTML: "Forgotten Your Password?", id: "btnLostPassword", style: { color: "black", backgroundColor: "rgba(0,0,0,0)", borderColor: "white", borderWidth: "2px", borderStyle: "solid", width: "95%", height: "6%", marginRight: "5%", marginTop: "5%" }, baseClass: "" });
	                        domConstruct.place(btnLostPassword, this.loginForm.domNode, "last");
	                        on(btnLostPassword, tap, lang.hitch(this, "_resetPassword"));
	                    } else {
	                        btnLostPassword.style.display = "";
	                    }
	                    this.own(
						on(this.loginForm, 'submit', function (event) { event.preventDefault(); return false; })
					);

	                    logIn.headerWidget.contextButtonOnTap = lang.hitch(this, "_LoginBtnTapped");

	                    break;
	                default:
	                    logIn.headerWidget.set('title', 'Step 1/4');
	                    logIn.headerWidget.set('contextButtonText', 'Next');
	                    var btnLostPassword = dom.byId("btnLostPassword");
	                    if (btnLostPassword) {
	                        btnLostPassword.style.display = "none";
	                    }
	                    var password = registry.byId("SignUp.password");
	                    password.set("disabled", true);
	                    style.set(password.domNode, "display", "none");
	                    style.set(dom.byId("mobileNumberText"), "display", "block");
	                    this.loginForm.connectChildren();

	                    this.own(
						on(this.loginForm, 'submit', function (event) { event.preventDefault(); return false; })
					);

	                    logIn.headerWidget.contextButtonOnTap = lang.hitch(this, "_RegisterBtnTapped");
	                    break;
	            }

	            logIn.headerWidget.placeAt(headerPlaceHolder);

	            var context = this;
	            logIn.eventHandler = lang.hitch(context, "_settingsButtonTap", context);

	            document.addEventListener('backbutton', logIn.eventHandler, false);

	        },

	        beforeDeactivate: function () {
	            document.removeEventListener('backbutton', logIn.eventHandler, false);
	            registry.byId("SignUp.cell").reset();
	            registry.byId("SignUp.password").reset();
	        },

	        afterDeactivate: function () {
	            registry.byId("SignUp.cell").reset();
	            registry.byId("SignUp.password").reset();
	            style.set(dom.byId("T&CDiv"), "display", "none");
	        },

	        _LoginBtnTapped: function (event) {

	            event.preventDefault();
	            event.cancelBubble = true;

	            this.loginForm.connectChildren();
	            this.loginForm.validate();

	            var test = this.loginForm.get("state");

	            //if((test == "")){

	            var formData = this.loginForm.get('value');
	            var Rum = new RUM(this);

	            if (formData.cell.charAt(0) == "0") {
	                formData.cell = formData.cell.replace("0", "27");
	            } else {
	                formData.cell = "27" + formData.cell;
	            }
	            var promise = Rum.userLogin(formData);

	            promise.then(function (result) {

	                switch (result) {
	                    case "2":
	                        logIn._createDialog("Please take the time to complete the registration process", "OK", "Incomplete Registration");
	                        Transitioner.zoomTo({ element: dom.byId("loginForm"), newScreen: "editProfile" }, 1, "editPassword");
	                        break;
	                    case "3":
	                        Rum.loginUpdate(formData.cell);
	                        Transitioner.zoomTo({ element: dom.byId("loginForm"), newScreen: "feeds" }, 1, "login");
	                        break;
	                    default:
	                        logIn._createDialog("Your Mobile Number or Password is incorrect. Please try again.", "OK");
	                        logIn.headerWidget.set("contextButtonText", "Log In");
	                        logIn.headerWidget.set("contextButtonImgVisible", false);
	                        break;
	                }

	            }, function (error) {
	                console.log(error);
	                logIn._createDialog("We could not connect to Luminet World please check you internet connectivity and try again.", "OK");
	                logIn.headerWidget.set("contextButtonText", "Log In");
	                logIn.headerWidget.set("contextButtonImgVisible", false);
	            });

	            //}else{
	            //	logIn._createDialog("Please correct all the fields marked in red.","OK");
	            //}

	            return false;
	        },

	        _RegisterBtnTapped: function (event) {
	            console.log('Clicked on Register button ... : ' + event)

	            event.preventDefault();
	            event.cancelBubble = true;

	            this.loginForm.validate();

	            console.log('State : ' + this.loginForm.get("state"));

	            if ((this.loginForm.get("state") == "")) {
	                this._register();
	            } else {
	                logIn._createDialog("Please correct all the fields marked in red.", "OK", "Register");
	            }

	            return false;
	        },


	        _createDialog: function (text, btnOk, dlgTitle) {
	            var dialog = new Dialog({ title: dlgTitle || "Login", content: text + "<br />", class: "claro", daggable: false, style: { color: "black", border: "black 2px solid", textAlign: "center"} });
	            var btnOk = new Button({ label: btnOk, onClick: function () { dialog.hide(); }, style: { color: "black", backgroundColor: "rgba(0,0,0,0)", border: "black 2px solid", width: "35%", height: "40%", backgroundImage: "none", borderRadius: "0px"} }).placeAt(dialog);
	            dialog.show();
	            query(".dijitDialogTitleBar").forEach(function (node) {
	                style.set(node, { backgroundColor: "black", border: "none", backgroundImage: "none", color: "white", textAlign: "left" });
	            });
	            query(".dijitDialogTitle").forEach(function (node) {
	                style.set(node, { color: "white" });
	            });

	        },

	        _settingsButtonTap: function (context, e) {
	            Transitioner.zoomTo({ element: context.domNode, newScreen: "walkthrough", transition: "none", event: e, direction: -1 }, 0, "login", 0);
	        },

	        _TsAndCsClick: function (e) {
	            Transitioner.zoomTo({ element: e.currentTarget, newScreen: "termsAndConditions", event: e, direction: -1 }, this.params.settings, "login", 0);
	        },

	        _resetPassword: function (e) {
	            Transitioner.zoomTo({ element: e.currentTarget, newScreen: "resetPassword", transition: "none", event: e, direction: -1 }, this.params.settings, "login", 0);
	        },

	        _register: function (dialog) {
	            //dialog.hide();
	            logIn.headerWidget.set("contextButtonText", " ");
	            logIn.headerWidget.set("contextButtonImageURL", "./images/icons/ajax-loader-header.gif");
	            logIn.headerWidget.set("contextButtonImgVisible", true);
	            var formData = this.loginForm.get('value');
	            var Rum = new RUM(this);

	            var userData = {};
	            userData.properties = {};

	            if (formData.cell.charAt(0) == "0") {
	                formData.cell = formData.cell.replace("0", "27");
	            } else {
	                formData.cell = "27" + formData.cell;
	            }

	            try {

	                if (device.name) { userData.properties.Model = device.name };
	                if (device.model) { userData.properties.Model = device.model };
	                if (window.device.platform) { userData.properties.Platform = window.device.platform };
	                if (window.device.version) { userData.properties.Version = window.device.version };
	                if (window.device.uuid) { userData.properties.uuid = window.device.uuid };

	            } catch (e) {
	                console.log(e);
	                console.log("cordova is probably not working");
	            }

	            userData.label = "Consumer";
	            userData.key = "cell";
	            userData.properties.id = formData.cell;
	            userData.properties.cell = formData.cell;
	            userData.properties.status = 1;
	            userData.properties.createDate = Rum.formatDate(new Date);
	            //userData.properties.gcmId = window.localStorage.getItem("gcmId") || "";
	            userData.properties.appVersion = window.localStorage.getItem("version");

	            var promise = Rum.createNewUser(userData);
	            var context = this;

	            promise.then(function (result) {
	                if (result == 0) {
	                    logIn._createDialog("The number you are trying to register is already registered", "OK", "Register");
	                    logIn.headerWidget.set("contextButtonText", "Register");
	                    logIn.headerWidget.set("contextButtonImgVisible", false);
	                } else {

	                    var dialog = new Dialog({ title: "Mobile Number Confirmation", content: "An SMS with your verification code will be sent to:" + "<br />" + "+" + userData.properties.cell + "<br />", class: "claro", daggable: false, style: { color: "black", border: "black 2px solid", textAlign: "center"} });
	                    var btnOk = new Button({ label: "OK", onClick: lang.hitch(context, "sendSmsValidation", userData, dialog), style: { color: "black", backgroundColor: "rgba(0,0,0,0)", border: "black 2px solid", height: "30%", backgroundImage: "none", borderRadius: "0px", margin: "5%"} }).placeAt(dialog);
	                    var btnCancel = new Button({ label: "Cancel", onClick: function () { dialog.hide() }, style: { color: "black", backgroundColor: "rgba(0,0,0,0)", border: "black 2px solid", height: "30%", backgroundImage: "none", borderRadius: "0px", margin: "5%"} }).placeAt(dialog);
	                    query(".dijitDialogTitleBar").forEach(function (node) {
	                        style.set(node, { backgroundColor: "black", border: "none", backgroundImage: "none", color: "white", textAlign: "left" });
	                    });
	                    query(".dijitDialogTitle").forEach(function (node) {
	                        style.set(node, { color: "white" });
	                    });
	                    dialog.show();
	                    query(".dijitDialogPaneContent").forEach(function (node) {
	                        style.set(node, { height: "auto" });
	                    });
	                }

	            }, function (error) {
	                console.log(error);
	                logIn._createDialog("We could not connect to Luminet World please check you internet connectivity and try again.", "OK", "Register");
	                logIn.headerWidget.set("contextButtonText", "Register");
	                logIn.headerWidget.set("contextButtonImgVisible", false);
	            });
	        },

	        sendSmsValidation: function (userData, dialog) {
	            dialog.hide();
	            var Rum = new RUM(this);
	            window.localStorage.setItem("userId", userData.properties.cell);
	            //window.localStorage.setItem("pWord", userData.properties.password);
	            Rum.requestSmsValidation(window.localStorage.getItem("userId")).then(function () {
	                Transitioner.zoomTo({ element: dom.byId("loginForm"), newScreen: "smsValidation" }, 1, "login");
	                logIn.headerWidget.set("contextButtonText", "Register");
	                logIn.headerWidget.set("contextButtonImgVisible", false);
	            });
	        }

	    };

	    return logIn;
	});