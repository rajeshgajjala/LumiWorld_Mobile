define(["dojo/dom", "../widget/tabNavigation/tabNavigation", "../widget/headerBar/headerBar", "dijit/layout/ContentPane",
	"dijit/registry", "dojox/mobile/ListItem", "dojox/gesture/tap", "dojo/date",
	"dojo/base/lang", "dojo/on", "dojo/dom-style", "../js/Transitioner",
	"../js/RemoteUpdateModule", "dojo/dom-construct", "dojo/aspect", "dojo/query",
	"dojo/promise/all", "dojo/Deferred"],
	function(dom, navigationHUDWidget, headerBar, ContentPane, registry, ListItem, tap, date, lang, on, style, Transitioner, RUM, Construct, aspect, query, all, Deferred){

	var feedsScreen = {

		navigationWidget: new Object,
		
		headerWidget: new Object,
		
		refresherView: new Object,
		
		page : 0,
		
		feedCount : 0,
		
		parameters : new Object,
		
		messageIds : new Array,
		
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
		init: function(){
	
			feedsScreen.navigationWidget = new navigationHUDWidget();
			
			feedsScreen.headerWidget = new headerBar();
			
			feedsScreen.refresherView = registry.byId("RefreshView");
			
			feedsScreen.refresherView.onPulled = lang.hitch(this,"_refresh");
			
			feedsScreen.refresherView.onBottomedOut = lang.hitch(this,"_getPagedNewsFeeds");
			
			feedsScreen.refresherView.set("scrollType", 2);
			
			registry.byId("NotificationList").set("pageSize", 5);
			registry.byId("NotificationList").set("maxPages", 6);
			
			aspect.after(window, "onNotificationGCM", lang.hitch(this, "updateUnreadBadge"), true);
		
		},
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////		
		beforeActivate: function(){	
            document.getElementById('pushMessageBox').style.visibility = "visible";	
			feedsScreen._changeDisplayMessage("Fetching Messages", true);
            //alert('here .....');
			this.page = 0;
			if(this.params.settings == "login"){
				this._destroyAllNewsFeedItems();
				this.updateNewsFeeds();
			}else if(this.params.settings == "filter" || (this.params.settings == "enterprise" && parseInt(this.params.filter) == 2)){
				this._destroyAllNewsFeedItems();
				//feedsScreen.refresherView.slideTo({y:65}, false);
				this.updateNewsFeeds();
			}else if(this.params.settings == "walkthrough"){
				//feedsScreen.refresherView.slideTo({y:65}, false);
				//this.afterFeedsAreLoaded({"query":[null], "filter":{sort:[{attribute:"publishedTime", descending: true}]}},[]).then(lang.hitch(this, "_afterNewsFeedsDisplayed"));
				this.updateNewsFeeds();
			}else{
				this.afterFeedsAreLoaded({"query":[null], "filter":{sort:[{attribute:"publishedTime", descending: true}]}},[]).then(lang.hitch(this, "_afterNewsFeedsDisplayed"));

                //alert('here 222222.....');
				if(this.feedCount == 0){
					this.updateNewsFeeds();
					feedsScreen._changeDisplayMessage("Fetching Messages", true);
				}
			}
			
			var naviPlaceHolder = dom.byId("HUD");
			var headerPlaceHolder = dom.byId("header");
			
			feedsScreen.headerWidget.backButtonOnTap = lang.hitch(this, "_settingsButtonTap", this);
			feedsScreen.headerWidget.set("backButtonImgVisible", false);
			
			feedsScreen.navigationWidget.homeButtonOnTap = lang.hitch(this, "_homeButtonTap");
			feedsScreen.navigationWidget.profileButtonOnTap = lang.hitch(this, "_profileButtonTap");
			
			feedsScreen.navigationWidget.set("connectButtonImageURL", "./images/ConnectLogo_fill.png");
			feedsScreen.navigationWidget.set("connectButtonBadgeValue", Number(window.unreadCount));
			
			registry.byId("RefreshView").set("height", "83%");
			
			//style.set(view, "height", (parseInt(style.get(view, "height")) - 48) + "px")
			
			feedsScreen.navigationWidget.placeAt(naviPlaceHolder);
			feedsScreen.headerWidget.placeAt(headerPlaceHolder);
			
		},
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////		
		afterDeactivate: function(){

		},
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////		
		updateNewsFeeds:function(){
			var filterCode = parseInt(this.params.filter) || 0;
			
			var rum = new RUM(this);
			
			var newsFeeds;
			
			switch(filterCode){
				/*case 1: //Sort Alphabetically
					filter = {sort:[{attribute:"NewsFeedHeader", descending: true}]}; //Confusing at face value this seems to be the same as sort by Enterprise
					newsFeeds = rum.getAllFeeds(this.page).then(lang.hitch(this,"afterFeedsAreLoaded",filter));
				break;*/
				case 2: //Sort By Enterprise
					var context = this;
					this.parameters.filter = {sort:[{attribute:"publishedTime", descending: true}]};
					var enterprise = this.loadedStores.Enterprises.get(this.params.parentid).then(function(enterprise){
						context.parameters.query = [{enterpriseID:  enterprise.id}];
						context.afterFeedsAreLoaded(context.parameters,[]).then(lang.hitch(context, "_afterNewsFeedsDisplayed"));
					});
				break;
				case 3: //Sort By Category
					//this.parameters.filter = {sort:[{attribute:"publishedTime", descending: true}]};
					//newsFeeds = rum.getFeedsByCategory(this.params.parentid).then(lang.hitch(this,"afterFeedsAreLoaded",this.parameters));
				break;
				case 4: //Sort By Sector
					var context = this;
					this.parameters.filter = {sort:[{attribute:"publishedTime", descending: true}]};
					var ids = this.loadedStores.Enterprises.query({parentid: this.params.parentid}).map(function(enterprise){return enterprise.id});
					ids.then(function(idList){
						context.parameters.query = [];
						for(var x in idList){
							context.parameters.query.push({enterpriseID: idList[x]});
						}
						//newsFeeds = rum.getFeedsBySector(this.params.parentid).then(lang.hitch(this,"afterFeedsAreLoaded",this.parameters));
						context.afterFeedsAreLoaded(context.parameters,[]).then(lang.hitch(context, "_afterNewsFeedsDisplayed"));
					});
				break;
				default: //Sort By Newest
					this.parameters.filter = {sort:[{attribute:"publishedTime", descending: true}]};
					this.parameters.query = [null];
					newsFeeds = rum.getAllFeeds(this.page).then((lang.hitch(this,"afterFeedsAreLoaded",this.parameters)));
					newsFeeds.then(lang.hitch(this, "_afterNewsFeedsDisplayed"));
				break;
			}
		},
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		afterFeedsAreLoaded: function(parameters,newMessages){
			var def = new Deferred(), context = this, promises = [], feedPromises = [];
			
			for(var x in parameters.query){
				promises.push(this.loadedStores.NewsFeeds.query(parameters.query[x], parameters.filter));
			}
			
			all(promises).then(function(results){
				//context._destroyAllNewsFeedItems();
				if(results[0]){
					for(var x in results){
						var result = results[x];
						for(var y in newMessages){
							var messageNotInArray = true;
							for(var j in result){
								if(newMessages[y].id == result[j].id){messageNotInArray = false}
							}
							if(messageNotInArray){result.push(newMessages[y])}
						}
						result.forEach(function(value){if(value){feedPromises.push(context._addNewNewsElement(value))}});
						
					}
				}else{
					feedsScreen._changeDisplayMessage("There are no messages to display", false);
				}
				all(feedPromises).then(function(){
					def.resolve();
				});
			});
			
			return def.promise;
			
		},
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		_afterNewsFeedsDisplayed: function(){
            //alert('Feeds displayed ..... Rajesh');

            document.getElementById('pushMessageBox').style.visibility = "hidden";
			var rum = new RUM(this);
			
			if(this.feedCount < 1){
				feedsScreen._changeDisplayMessage("There are no messages to display", false);
			}/*else{
				feedsScreen._changeDisplayMessage("Fetching Messages", true);
			}*/
			
			if(this.page < 1){
				feedsScreen.refresherView.slideTo({y:0}, 0.3, "ease-out");
			}else{
				//feedsScreen.refresherView.slideTo({y:feedsScreen.refresherView.bottomPos()}, 0.3, "ease-out");
			}
			
			//rum.getAllFeeds(this.page + 1);
		},
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		_addNewNewsElement: function(NewsElement){
			var def = new Deferred(), context = this;
			
			var notDisplayed;
			
			for(var x in context.messageIds){
				if(context.messageIds[x].id == NewsElement.id){
					notDisplayed = false;
					break;
				}
				notDisplayed = true;				
			}
			
			if(context.messageIds.length < 1){
				notDisplayed = true;
			}
			
			if(notDisplayed){
				var publishedTime = new Date(parseInt(NewsElement.publishedTime));
						
				var timeStamp = date.difference(publishedTime, null, "day");
				if(timeStamp < 1){
				
				timeStamp = date.difference(publishedTime, null, "hour");
					if(timeStamp < 1){
						timeStamp = date.difference(publishedTime, null, "minute");
							if(timeStamp < 1){
								timeStamp = date.difference(publishedTime, null, "minute") + "s";
							}else{timeStamp += "m";}
					}else{timeStamp += "h";}
				}else{
					if(timeStamp > 7){
						timeStamp = publishedTime.getDate() + "/" + (publishedTime.getMonth()+1) + "/" + publishedTime.getFullYear();
					}else{
						timeStamp += "D";
					}
					
				}
				
				this.loadedStores.Enterprises.get(NewsElement.enterpriseID).then(function(enterprise){
				
					enterprise = enterprise || {};
					
					var titleListItem = new ListItem({id:NewsElement.id + "_title", icon: enterprise.enterpriseLogo || NewsElement.ImageURL || "images/logos/"+ (NewsElement.enterpriseID || 59) +".png", moveTo:"#", label: unescape(NewsElement.NewsFeedHeader), rightText:timeStamp, style:{height:"43px",background:"white", borderTopWidth:"0px", borderBottomWidth:"0px", color:"black", textShadow:"none"}});
					var bodyListItem = new ListItem({id:NewsElement.id + "_body", style:{background:"white", height: "51px", font:"0.8em arial,sans-serif", color:"grey", wordWrap:"none",}});
						
					bodyListItem.set("variableHeight", false);
					
					var content = Construct.toDom(NewsElement.NewsFeedBody);
					
					//Remove all dom node other then the first 5, this is just to optimise the screen slightly
					if (content instanceof DocumentFragment){ 
						if(content.childNodes.length > 5){
							var content2 = new query.NodeList(content.childNodes);
							content2.splice(4,(content.childNodes.length-5));
							content = content2;
						}
					}
					
					var bodyContent = new ContentPane({style:{height:"auto", paddingTop:"0px"}});
					//var title = Construct.create("div", {innerHTML:NewsElement.NewsFeedHeader, style:{marginTop:"2%", marginRight:"2%", fontWeight:"bold", fontSize:"1.2em"}}, bodyListItem.domNode, "first");
				
					bodyContent.set("content",content);
				
					bodyListItem.addChild(bodyContent);
				
					if(NewsElement.publishedTime > (context.messageIds[0] ? context.messageIds[0].time : 1)){				
						registry.byId("NotificationList").addChild(titleListItem, 0);
						registry.byId("NotificationList").addChild(bodyListItem, 1);
						//console.log(registry.byId("NotificationList"));
					}else{
						registry.byId("NotificationList").addChild(titleListItem, "last");
						registry.byId("NotificationList").addChild(bodyListItem, "last");
						//console.log(registry.byId("NotificationList"));
					}
					
					var flag = true;
					
					bodyListItem.own(
						on(bodyListItem, tap, lang.hitch(feedsScreen, "_delegateTap", NewsElement,flag)),
						on(titleListItem, tap, lang.hitch(feedsScreen, "_delegateTap", NewsElement,flag))
					);
					
					context.feedCount++;
					context.messageIds.push({id : NewsElement.id, time: NewsElement.publishedTime})
					
					var compare = function(a,b){
						if(a.time < b.time){return -1;}
						if(a.time > b.time){return 1;}
						return 0;
					}
					
					context.messageIds.sort(compare);
					
					def.resolve();
				});
			}else{
				def.resolve();
			}
				
			return def.promise;
		},
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////		
		/*_newsFeedElementDropAnimation: function(event){
		
			var animHeight = 0;
			
			if(event.currentTarget.clientHeight > (feedsScreen.standardNewsFeedHeight + 1)){
				animHeight = feedsScreen.standardNewsFeedHeight;
				registry.byNode(event.currentTarget).set("rightIcon","images/down-arrow-icon.png");
			}else{
				var item = registry.byNode(event.currentTarget);
				if(item.domNode.childNodes[3].clientHeight < feedsScreen.standardNewsFeedHeight){
					animHeight = feedsScreen.standardNewsFeedHeight;
				}else{
					animHeight = item.domNode.childNodes[3].clientHeight;
				}
				item.set("rightIcon","images/up-arrow-icon.png");
			}
			
			fx.animateProperty({
        		node: dom.byId(event.currentTarget),
        		properties: { height: animHeight }
    		}).play();

		},*/
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
		_changeDisplayMessage: function(message, displayProgIndicator){
			dom.byId("displayMessage").innerHTML = message;
			style.set(dom.byId("messageProgIndicator"), "display", (displayProgIndicator ? "block" : "none")); 
		},
		
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
		_getPagedNewsFeeds:function(){
		
			
			this.page = Math.round(this.feedCount / 12);
			this.updateNewsFeeds();
			//feedsScreen._destroyAllNewsFeedItems();
			//this.afterFeedsAreLoaded(this.parameters,[]).then(lang.hitch(this, "_afterNewsFeedsDisplayed"));
			//feedsScreen.refresherView.slideTo({y:0}, 0.3, "ease-out");
			//feedsScreen.refresherView.scrollTo({y:feedsScreen.refresherView.bottomPos()}, false);
		
		},
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
		_delegateTap: function(newsFeed,flag,event){
		
			if((event.target.nodeName == "IMG" && event.target.className == "mblImageIcon mblListItemIcon")){
				Transitioner.zoomTo({element:event.target, newScreen:"enterprise", event:event},newsFeed.enterpriseID, "feeds");
			}else if(flag){
				Transitioner.zoomTo({element:event.target, newScreen:"feedsView", event:event},newsFeed.id, "feeds");
			}
		
		},
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
		_refresh: function(){
			
			this.page = 0;
			this.updateNewsFeeds();
			window.unreadCount = 0;
			feedsScreen.navigationWidget.set("connectButtonBadgeValue", 0);
			//feedsScreen.refresherView.slideTo({y:0}, 0.3, "ease-out");
			
		},
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
		_settingsButtonTap: function(context, e){
			Transitioner.zoomTo({element:context.domNode, newScreen:"filter", event:e, direction: -1},context.params.parentid, "feeds", 0);
		},
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////		
		_homeButtonTap: function(e){
			Transitioner.zoomTo({element:e.currentTarget, newScreen:"home", transition:"none", event:e},1,"feeds", 0);
		},
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////		
		_profileButtonTap: function(e){
			Transitioner.zoomTo({element:e.currentTarget, newScreen:"profile", transition:"none", event:e},1,"feeds", 0);
		},
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		_destroyAllNewsFeedItems: function(){
		
			this.feedCount = 0;
			this.messageIds = new Array;
			var messages = registry.byId("NotificationList").getChildren();
			for(var x in messages){
				registry.byId("NotificationList").removeChild(messages[x]);
				messages[x].destroyRecursive();
			}
			
		},
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		updateUnreadBadge: function(){
			feedsScreen.navigationWidget.set("connectButtonBadgeValue", Number(window.unreadCount));
			//alert("Notification processed in Feeds Screen");
			//feedsScreen._refresh();
		}
	
	};

return feedsScreen;
});