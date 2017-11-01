define(["dojo/base/declare", "dojo/Deferred", "dojo/store/util/QueryResults", "dojo/base/lang", "dojo/when"],
	function(declare, Deferred, QueryResults, lang, when){

	return declare(null, {
		// summary:
		//		This is a dojo/store wrapper for Cordova Contacts API.
		
		//databaseName: String
		//		The name of the database.
		databaseName : "luminetWorldDatabase",
		
		//dbTableName: String
		//		The name of the database table.
		dbTableName : "luminetWorldTable",
		
		//tableColumns: Array
		//		An array of table Columns names
		tableColumns : ["id unique", "displayName", "name", "sectorID", "parentID"],
		
		//version: float
		//		The Database Version
		version: 0.1,
		
		//databaseDisplayName: String
		//		The Database Display Name
		databaseDisplayName: "LuminetWorldDatabase",
		
		//size: integer
		//		The size of the database in bytes.
		size: 10485760,
		
		//database: Object
		//		This is a reference to the actual database on the device, we use this object to access it and run SQL queries
		database: new Object,
		
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		constructor: function(options){
			// summary:
			//		Creates a contacts object store.
			//declare.safeMixin(this, options);
			
			//Initialise the database by creating an Instance on the device
			declare.safeMixin(this, options);
			this.database = window.openDatabase(this.databaseName, this.version, this.databaseDisplayName, this.size);
			
			var context = this;
			
			this.database.transaction(function(tx){
				var columns = " (";
				for(var x in context.tableColumns){
					columns = columns + context.tableColumns[x];
					if(x < context.tableColumns.length - 1){
						columns = columns + ", ";
					}else{
						columns = columns + ")"
					}
				}
				tx.executeSql(("CREATE TABLE IF NOT EXISTS " + context.dbTableName + columns));
			},function(){lang.hitch(context, "sqlErrorCB")});
			
			console.log(this.database);
		},
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		get: function(id){
		//console.log("GET called with id : " + id);
			//	summary:
			//		Retrieves an object by its identity.
			//	id: String
			//		The identity to use to lookup the object
			//	returns: Object
			//		The object in the store that matches the given id.
			
			return when(this.query({"id":id}),
				function(results){
					// search is by keyword on all fields, so we need to double check
					// we did not get false positive results
					var i;
					for(i = 0; i < results.length; i++){
						// Cordova advertise String ids but at least sometimes we get Number...
						//console.log("Get ID results : " + results.length);
						//console.log(results);
						if(results[i].id == id){
							return results[i];
						}
					}
					return null;
				},function(error){console.log(error)});
		},
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		getIdentity: function(object){
			//	summary:
			//		Returns an object's identity
			//	object: Object
			//		The object to get the identity from
			//	returns: String
			return object.id;
		},
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		query: function(query, options){
			var temp = "";
			var context = this;
			for(x in query){temp += x + " : " + query[x]};
			//console.log("QUERY called with : " + temp + " !!!!!!!!!!");
			var def = new Deferred();
			var queryString = "SELECT * FROM " + this.dbTableName;
			var whereClause = "";
			var orderClause = "";
			
			for(element in query){
				if(whereClause != ""){whereClause += ", "}
				if(whereClause == ""){whereClause += " WHERE "}
				whereClause = whereClause + " " + element + ((query[element] instanceof String) ? "='" + query[element] + "'" : "=" + query[element]);
			}
			
			if(options){
				if(options.sort){
					orderClause = " ORDER BY "
					for(var x in options.sort){
						orderClause = orderClause + options.sort[x].attribute + " ";
						orderClause = orderClause + ((options.sort[x].descending) ? "DESC" : "ASC");
					}
				}
			}
			
			this.database.transaction(function(tx){
				tx.executeSql(queryString + whereClause + orderClause, [], function(tx, results){
					var rows = [];
					for(var x = 0 ; x <  results.rows.length; x++){
						rows.push(results.rows.item(x));					
					}
					def.resolve(rows);
				},lang.hitch(context, "sqlErrorCB", def));
			},
			lang.hitch(context, "sqlErrorCB", def));
			
			return QueryResults(def.promise);
		},
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		put: function(object, directives){
			
			var deferred = new Deferred(), self = this, elementExists = false;
			if(directives && directives.hasOwnProperty("id")){
				object.id = directives.id;
			}
			//console.log("ATTEMPTING TO WRITE DATA");
			//console.log("Object ID: " + object.id);
			this.get(object.id).then(function(result){
				if(result !== undefined && result !== null){
					//console.log("result ID: " + result.id);
					elementExists = true;				
				}

				if(directives && directives.overwrite === false && elementExists == true){
					deferred.reject(new Error("Element already Exists"));
					return;
				}
				var sql = "";
				var parameters = [];
				
				if(elementExists == true){
					var setString = "";
					
					for(var prop in object){
						if(prop != "id"){
							if(setString != ""){setString += ", "}
							setString += prop + "= ?";
							
							parameters.push(object[prop] || "");
						}
					}
					//console.log("UPDATING : " + self.dbTableName)
					sql = "UPDATE OR REPLACE " + self.dbTableName + " SET " + setString + " WHERE id=" + object.id;
				}else{
					var valueStringOne = "";
					var valueStringTwo = "";
					
					for(var prop in object){
						if(valueStringOne != ""){valueStringOne += ", "}
						if(valueStringTwo != ""){valueStringTwo += ", "}
						
						valueStringOne += prop;
						valueStringTwo += "?";
						parameters.push(object[prop] || "");
					}
					//console.log("INSERTING INTO : " + self.dbTableName)
					sql = "INSERT OR IGNORE INTO " + self.dbTableName + " (" + valueStringOne + ") VALUES (" + valueStringTwo + ")";
				}
				
				self.database.transaction(function(tx){
					tx.executeSql(sql, parameters);
				},
				lang.hitch(self, "sqlErrorCB", deferred, sql),
				function(){
					deferred.resolve(object);
				});
			});
			
			return deferred.promise;
		},
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		add: function(object, directives){
			(directives = directives || {}).overwrite = false;
			return this.put(object, directives);
		},
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		remove: function(id){
			var deferred = new Deferred();
			var context = this;
			
			this.database.transaction(function(tx){
					tx.executeSql("DELETE FROM " + context.dbTableName + " WHERE id='" + id + "';");
				},
				lang.hitch(this, "sqlErrorCB", deferred),
				function(){
					deferred.resolve();
				});
				
			return deferred.promise;
		},
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////		
		nuke: function(){
			var deferred = new Deferred();
			var context = this;
			
			this.database.transaction(function(tx){
					tx.executeSql("DELETE FROM " + context.dbTableName);
				},
				lang.hitch(this, "sqlErrorCB", deferred),
				function(){
					deferred.resolve();
				});
				
			return deferred.promise;
		},
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		sqlErrorCB: function(def, sql, err) {
			def.reject(err);
			console.log("Error processing SQL: " + err.code);
			console.log(err);
			console.log(sql);
		}
	
	});
});
