/**
 * This is the Remote Update Module (or RUM for short... Arrhh) Class it uses the Dojo Declare Syntax, as a result it must be instantiated as an Object
 * even though a constructor is not defined. In other words, none of the functions in this class can be seen as static.
 * @class RemoteUpdateModule 
 */
define(["dojo/base/declare","dojo/Deferred", "dojo/promise/all" ,"dojo/request", "dojo/base/lang", "dojo/json"],function(declare,Deferred,all,request,lang,json){
	return declare(null,{
		
		constructor: function(context){
			this.context = context;
		},
		
		//serverAddress: "http://197.96.19.118",
		serverAddress: "http://196.223.97.152",
		
		context: new Object(),
		/**
		 * This is the get method it is essentially the main entrance into the RUM, (This is where we crack her open and pour all
		 * her refreshing goodness out.) The get function is used to retrieve 'categories, enterprises, sectors and services from
		 * the the internal cache, for testing purposes the cache is forced renewed on every call.
		 * @method get
		 * @param name {String} The information one is looking for, eg: categories, sectors
		 * @param parentId {String} This is the Index of the Parent node, in other words, its the sector id for categories.
		 * @return Dojo Promise. If the Query is successful the results object is passed to the Promises then() call back
		 */
		get: function(name, parentId){
			var def = new Deferred();

			var RUM = this;
			
			var content = RUM.update(name);
			
			content.then(function(results){
				def.resolve(results.data);
			});


			return def.promise;
		},
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		/**
		 * This is the initialize method it is used to retrieve categories, enterprises, sectors and services from
		 * the POP. It also handles the caching and checking for updates. It does not however handle User Specific information.
		 * @method initialize
		 * @param name {String} The information one is looking for, eg: categories, sectors
		 * @return Dojo Promise. If the Query is successful the results object is passed to the Promises then() call back
		 */
		initialize:function(names){
		
			var def = new Deferred;

			var RUM = this;
			
			var requests = [];
			
			for(x in names){
				var updater = RUM.update(names[x]);
				requests.push(updater);
			}
			
			all(requests).then(
				function(results){
					def.resolve(true)
				},
				function(error){
					def.reject(error)
				});
			
			return def.promise;

		},
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////		
		/**
		 * This function polls the server for all the names of the decided collection (name).
		 * @method update
		 * @param name {String} The information one is looking for, eg: categories, sectors
		 * @return Dojo Promise. If the Query is successful the results object is passed to the Promises then() call back. The Results are a JavaScript Object containing the newest collection of string values and other info.
		 */
		update: function(name){

			var def = new Deferred();
			var RUM = this;
			var address;
			
			var promise;
			
			if(name != "connected"){
				this.context.loadedStores.ports.query({name : name}).forEach(function(result){address = RUM._buildServerURL(result,name)});
			
				promise = request.get(address, {handleAs:"json", preventCache: true, headers : {"X-Requested-With": ""}});
			}else{
				var user = {};

				user.cell = window.localStorage.getItem("userId");
				
				this.context.loadedStores.ports.query({name : name}).forEach(function(result){address = RUM.serverAddress + result.port + "getnodebyrelationship"});
				
				promise = request.post(address, {data: "params="+json.stringify(user), handleAs:"json", preventCache: true, headers : {"X-Requested-With": ""}});
			}
			
			
			promise.response.then(
					function(response){
						console.log("Got: " + response + " for " + name);
						switch(name){
						case "sectors" :
							for(x in response.data){
								RUM.context.loadedStores.Sectors.put(response.data[x]);
							}
						break;
						case "categories":
							for(x in response.data){
								RUM.context.loadedStores.Categories.put(response.data[x]);
							}
						break;
						case "enterprises":
							for(x in response.data){
								RUM.context.loadedStores.Enterprises.put(response.data[x]);
							}
						break;
						case "services":
							for(x in response.data){
								RUM.context.loadedStores.Services.put(response.data[x]);
							}
						break;
						case "interestedin":
							for(x in response.data){
								RUM.context.loadedStores.InterestedIn.put(response.data[x]);
							}
						break;
						case "enterpriseservices":
							for(x in response.data){
								RUM.context.loadedStores.ServiceLookup.put(response.data[x]);
							}
						break;
						case "connected":
							console.log(response.data);
							for(x in response.data){
								try{
									RUM.context.loadedStores.ConnectedEnterprises.add(response.data[x]);
								}catch(e){
									console.log(e);
								}
							}
						};
						def.resolve(true);
					},
					function(error){
						console.log(error);
						def.reject(error);
					});


			return def.promise;

		},
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		getAllFeeds: function(page,limit){
		
			var RUM = this;		
			var port = "";
			var data = {};
			var query = {};
			query.limit = limit || 12;			
			query.page = page || 0;
			data.searchkey = 'cell';
			data.searchKeyValue = window.localStorage.getItem("userId");
		
		
			var def = new Deferred();			
			RUM.context.loadedStores.ports.query({name : "newsfeeds"}).forEach(function(result){port = result.port});
			
			var promise = request.post(RUM.serverAddress + ":11106/getlatestnewsfeedbyconsumer", 
					{data: "params=" + json.stringify(data),
					query:query,
					handleAs: "json",
					preventCache: true,
					headers : {"X-Requested-With": ""}});
			
			promise.response.then(function(results){
				for(var x in results.data){				
					RUM.context.loadedStores.NewsFeeds.put(results.data[x]);
				}
				def.resolve(results.data);
			},
			function(error){
				console.log(error);
				def.reject(error);
			});
			
			return def.promise;
			
		},
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////		
		getFeedsByEnterprise: function(regNumber,id,page,count){
		
			var RUM = this;		
			var port = "";
			var query = {};
			var data = {};			
			query.limit = count || 12;			
			query.page = page || 0;
			query.id = id || 59;
			data.enterpriseID = id || 59;
			data.enterpriseRegistrationNumber = regNumber;
			data.searchKey = 'cell';
			data.searchKeyValue = window.localStorage.getItem("userId");
		
		
			var def = new Deferred();
			
			var promise = request.post(RUM.serverAddress  + ":11014/getNewsfeedByEnterpriseID?limit=" + query.limit + "&page=" + query.page + "&id=" + query.id,
				{data: "params=" + json.stringify(data),
				handleAs:"json",
				preventCache: true,
				headers:{"X-Requested-With": ""}
				});
			
			promise.response.then(function(results){
				console.log(results);
	
				RUM.context.loadedStores.NewsFeeds.setData(results.data);
				
				def.resolve(results.data.length);
			},
			function(error){
				console.log(error);
				def.reject(error);
			});
			
			return def.promise;
			
		},
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////		
		getFeedsBySector: function(id,page,count){
		
			var RUM = this;		
			var port = "";
			var query = {};
			var data = {};			
			query.limit = count || 12;			
			query.page = page || 0;
			query.id = id || 4;
			data.enterpriseID = 59;
			data.enterpriseRegistrationNumber = 0;
			data.searchKey = 'cell';
			data.searchKeyValue = window.localStorage.getItem("userId");
			data.sectorID = id || 3;
			
			var def = new Deferred();
			
			var promise = request.post(RUM.serverAddress + ":11014/getNewsfeedBySectorID?limit=" + query.limit + "&page=" + query.page + "&id=" + query.id, {
				data: "params=" + json.stringify(data),
				handleAs:"json",
				preventCache:true,
				headers:{"X-Requested-With": ""}
				});
			
			promise.response.then(function(results){
				console.log(results);
				RUM.context.loadedStores.NewsFeeds.setData(results.data);
				def.resolve(results.data.length);
			},
			function(error){
				console.log(error);
				def.reject(error);
			});
			
			return def.promise;
			
		},
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////		
		pushDisplayedFeed: function(id){
			var RUM = this;
			var date = new Date();
			var promise = {};
			var def = new Deferred();
			var userId = window.localStorage.getItem("userId");
			
			var date = RUM.formatDate(new Date);
			
			var viewRelationship = {};
			
			viewRelationship.uniqueKey = 'ID',
			viewRelationship.uniqueKeyValue = userId + "_" + id,
			
			viewRelationship.fromNodeLabel = 'Consumer',
			viewRelationship.fromNodeKey = 'cell',
			viewRelationship.fromNodeKeyValue = userId,
        
			viewRelationship.toNodeLabel = 'Newsfeed',
			viewRelationship.toNodeKey = 'guid',
			viewRelationship.toNodeKeyValue = id,
			viewRelationship.relationshipType = 'Viewed',
			viewRelationship.properties = {};
			viewRelationship.properties.date = date;
			viewRelationship.properties.status = 1;
			viewRelationship.properties.ID = userId + "_" + id;

			
			if (navigator.geolocation){
				navigator.geolocation.getCurrentPosition(
					function(pos){
						viewRelationship.properties.lat = pos.coords.latitude;
						viewRelationship.properties.lon = pos.coords.longitude;
						viewRelationship.properties.posAccu = pos.coords.accuracy;
						
						promise = request.post(RUM.serverAddress + ":11103/createRelationship", {
							data:"params=" + json.stringify(viewRelationship), 
							handleAs:"json",
							preventCache: true,
							headers : {"X-Requested-With": ""}
							});
						
						promise.response.then(function(results){
							console.log(results);
							def.resolve(results);
						},
						function(error){
							console.log(error);
							def.reject(error);
						});
			
						return def.promise;
					},
					function(error){
						viewRelationship.properties.posError = error.code;
						
						promise = request.post(RUM.serverAddress + ":11103/createRelationship", {data:"params=" + json.stringify(viewRelationship), handleAs:"json",headers : {"X-Requested-With": ""}});
						
						promise.response.then(function(results){
							console.log(results);
							def.resolve(results);
						},
						function(error){
							console.log(error);
							def.reject(error);
						});
			
						return def.promise;
					});
			}else{
				viewRelationship.properties.posError = 2;
				
				promise = request.post(RUM.serverAddress + ":11103/createRelationship", {data:"params=" + json.stringify(viewRelationship), handleAs:"json",headers : {"X-Requested-With": ""}});
						
				promise.response.then(function(results){
					console.log(results);
					def.resolve(results);
				},
				function(error){
					console.log(error);
					def.reject(error);
				});
			
				return def.promise;
			}
			
		},
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////		
		createEnterpriseRelationship: function(userId,enterpriseId,status){
		
			var RUM = this;
			var date = new Date();
			var stat = status || 1;
		
			var def = new Deferred();			
		
			var createOptInRelationship = {};
			
			createOptInRelationship.uniqueKey = 'ID',
			createOptInRelationship.uniqueKeyValue = userId + "_" + enterpriseId,
			
			createOptInRelationship.fromNodeLabel = 'Consumer',
			createOptInRelationship.fromNodeKey = 'cell',
			createOptInRelationship.fromNodeKeyValue = userId,
        
			createOptInRelationship.toNodeLabel = 'Enterprise',
			createOptInRelationship.toNodeKey = 'companyregistrationnumber',
			createOptInRelationship.toNodeKeyValue = enterpriseId,
			createOptInRelationship.relationshipType = 'Connected',
			createOptInRelationship.properties = {};
			createOptInRelationship.properties.date = date.toString();
			createOptInRelationship.properties.status = stat;
			createOptInRelationship.properties.ID = userId + "_" + enterpriseId;
				
			var params = "params=" + json.stringify(createOptInRelationship);
				
			var promise = request.post(RUM.serverAddress + ":11103/createRelationship",
					{data: params,
					handleAs: "json",
					preventCache: true,
					headers : {"X-Requested-With": ""}});
			
			promise.response.then(function(results){
				console.log(results);
				def.resolve(results);
			},
			function(error){
				console.log(error);
				def.reject(error);
			});
			
			return def.promise;
		},
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////		
		changeEnterpriseRelationship: function(userId,enterpriseId,status){
			var RUM = this;
			var date = new Date();
			var stat = status;
		
			var def = new Deferred();			
		
			var createOptInRelationship = {};
			
			createOptInRelationship.uniqueKey = 'ID',
			createOptInRelationship.uniqueKeyValue = userId + "_" + enterpriseId,
			
			createOptInRelationship.relationshipType = 'Connected',
			createOptInRelationship.properties = {};
			createOptInRelationship.properties.date = date.toString();
			createOptInRelationship.properties.status = stat;
			createOptInRelationship.properties.ID = userId + "_" + enterpriseId;
				
			var params = "params=" + json.stringify(createOptInRelationship);
			
			console.log(params);
			
			var promise = request.post(RUM.serverAddress + ":11108/addrelationshippropertiesbyid",
					{data: params,
					handleAs: "json",
					preventCache: true,
					headers : {"X-Requested-With": ""}});
			
			promise.response.then(function(results){
				console.log(results);
				def.resolve(results);
			},
			function(error){
				console.log(error);
				def.reject(error);
			});
			
			return def.promise;
		},
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////		
		userLogin: function(formData){
			var RUM = this;
			var def = new Deferred();
			var formDataString = "";
				
			for(var x in formData){
				if(formDataString != ""){formDataString += "&"};
				formDataString += x + "=" + formData[x];
			}
			
			var promise = request.post(RUM.serverAddress + ":13001/getnodebyindex",
				{data: formDataString,
				handleAs: "json",
				preventCache: true,
				headers : {"X-Requested-With": ""}});
			
			var context = this;
			
			promise.then(function(result){
				if(result == "2" || result == "3"){
					window.localStorage.setItem("userId",formData.cell);
					window.localStorage.setItem("pWord", formData.password);
					RUM.initialize(["connected"]);
					//RUM.loginUpdate(window.localStorage.userId);
					def.resolve(result);
				}else{
					def.resolve(result);
				}
			},function(error){
				def.reject(error);
			});
			
			return def.promise;
			
		},
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
		loginUpdate:function(userId,update){
			var RUM = this;
			var userData = {};
			var def = new Deferred();
			userData.properties = {};			
			try{
			
				if(device.name) {userData.properties.Model = device.name};
				if(device.model) {userData.properties.Model = device.model};
				if(window.device.platform) {userData.properties.Platform = window.device.platform};
				if(window.device.version) {userData.properties.Version = window.device.version};
				if(window.device.uuid) {userData.properties.uuid = window.device.uuid};
			
			}catch(e){
				console.log(e);
				console.log("cordova is probably not working");
			}		
			
			userData.nodeLabel = "Consumer";
			userData.nodeKey = "cell";
			userData.nodeKeyValue = userId;
			
			if(window.localStorage.getItem("gcmId")){
				userData.properties.gcmId = window.localStorage.getItem("gcmId");
			} else {
				userData.properties.gcmId = "";
			}
			userData.properties.appVersion = window.localStorage.getItem("version");
			userData.properties.status = 3 || update.status;
			userData.properties.updateDate = RUM.formatDate(new Date);
			
			if(update){
				if(update.newPassword){
					userData.properties.password = update.newPassword;
				}
				for(var x in update){
					if((x != "newPassword") && (x != "confirmPassword") && (x != "cell") && (x != "password")){
						userData.properties[x] = update[x];
					}
				}
			}
			
			for(var y in userData.properties){
				window.localStorage.setItem(y, userData.properties[y]); 
			}
			
			var params = "params=" + json.stringify(userData);

			var promise = request.post(RUM.serverAddress + ":11101/addnodeproperties",
				{data: params,
				handleAs: "json",
				preventCache: true,
				headers : {"X-Requested-With": ""}});
	
			promise.then(function(result){
				if(result == 0){
					console.log("Fail");
				}else{
					try{
						var data = result[0].data;
						if(!window.localStorage.getItem("firstName")){
							window.localStorage.setItem("firstName", data.firstName);
						}
						if(!window.localStorage.getItem("lastName")){
							window.localStorage.setItem("lastName", data.lastName);
						}
						if(!window.localStorage.getItem("displayName")){
							window.localStorage.setItem("displayName", data.displayName);
						}
					}catch(e){
						console.log(e);
					}
				}
				def.resolve(result)
			},function(error){
				console.log(error);
				def.reject(error)
			});
			
			return def.promise;
			
		},
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
		createNewUser: function(userData){
			var RUM = this;
			var def = new Deferred();
			var params = "params=" + json.stringify(userData);
				
			var promise = request.post(RUM.serverAddress + ":11013/createuniquenode",
				{data: params,
				handleAs: "json",
				preventCache: true,
				headers : {"X-Requested-With": ""}});
	
			promise.then(function(result){
				def.resolve(result);
			},function(error){
				def.reject(error);
			});
			
			return def.promise;
			
		},
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		requestPasswordReset: function(cellNumber){
			var RUM = this;
			var def = new Deferred();
			var dataEmail= {};
			
			dataEmail.uniqueKey = "cell";
			dataEmail.cellphoneNumber = cellNumber;

			var params = "params=" + json.stringify(dataEmail);
				
			var promise = request.post(RUM.serverAddress + ":11051/retrievepassword",
				{data: params,
				handleAs: "json",
				preventCache: true,
				headers : {"X-Requested-With": ""}});
	
			promise.then(function(result){
				def.resolve(result);
			},function(error){
				def.reject(error);
			});
			
			return def.promise;
		},
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////		
		logGSMCallBreakOut: function(userId, enterpriseId, enterpriseNumber){
			var RUM = this;
			var def = new Deferred();
			var date = new Date();
			var dataEngageCall = {};
						
			dataEngageCall.key = 'insertEngageCall';
			dataEngageCall.userID = userId;
			dataEngageCall.enterpriseID = enterpriseId;
			dataEngageCall.enterpriseContactNumber = enterpriseNumber;
			dataEngageCall.time = date;
			dataEngageCall.status = 1;
			dataEngageCall.userIDToChange = userId;

			var params = {};
			
			//var params = "{params=" + json.stringify(dataEngageCall) + "}";
				
			var promise = request.post(RUM.serverAddress + ":11052/engagecall",
				{data: {params:json.stringify(dataEngageCall)},
				handleAs: "json",
				//preventCache: true,
				headers : {"X-Requested-With": ""}});
	
			promise.then(function(result){
				def.resolve(result);
			},function(error){
				def.reject(error);
			});
			
			return def.promise;
		},
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		requestSmsValidation: function(userMobileNumber){
			
			var RUM = this;
			var def = new Deferred();
			var smsData = {};
						
			smsData.cellPhoneNumber  = userMobileNumber;
			
			var params = "params=" + json.stringify(smsData);
			
			var promise = request.post(RUM.serverAddress + ":11057/sms",
				{data: params,
				handleAs: "json",
				headers : {"X-Requested-With": ""}});
	
			promise.then(function(result){
				def.resolve(result);
			},function(error){
				def.reject(error);
			});
			
			return def.promise;
		},
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
		_buildServerURL: function(port, name){
			return this.serverAddress + port.port + "getall" + name;
		},
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
		formatDate: function(date){
			
			var fullDate = new Object();
			fullDate.year = date.getFullYear();
			fullDate.month = date.getMonth() + 1;
			if (fullDate.month < 10) {
				fullDate.month = '0' + fullDate.month;
			}
			fullDate.day = date.getDate();
			if (fullDate.day < 10){
				fullDate.day = '0' + fullDate.day;
			}
			fullDate.hours = date.getHours();
			if (fullDate.hours < 10){
				fullDate.hours = '0' + fullDate.hours;
			}
			fullDate.min = date.getMinutes();
			if(fullDate.min < 10){
				fullDate.min = '0' + fullDate.min;
			}
			
			return fullDate.year + '-' + fullDate.month + '-' + fullDate.day + ' ' + fullDate.hours + ':' + fullDate.min;
		}
		

	});
});