var api	= require('themoviedb/themoviedb');	
api.common.api_key = '1b3785a9a5de9fd3452af6e32e092357';

/**
 * TheMovieDB API doesn't support custom pagination, it only answers with 20 results max.
 * As we show three shows per row, we fill the rows and store the pending for the next time.
 */
var pendingShows = {
	'todayList': [],
	'nowList': [],
	'popularList': [],
	'searchList': []
};

$.todayTitle.text	= L('today_shows');
$.nowTitle.text		= L('now_shows');
$.popularTitle.text	= L('popular_shows');

refreshAll();

function refreshToday(callback) { if (OS_IOS) $.ptrToday.endRefreshing(); pendingShows.todayList = []; loadShows('getAiringToday',   'todayList', callback); }
function refreshNow(callback)      { if (OS_IOS) $.ptrNow.endRefreshing();      pendingShows.nowList = [];      loadShows('getOnTheAir', 'nowList',      callback); }
function refreshPopular(callback)  { if (OS_IOS) $.ptrPopular.endRefreshing();  pendingShows.popularList = [];  loadShows('getPopular',    'popularList',  callback); }

function refreshAll() {
	refreshToday(function(err) {
		if (err)
			return false;
		refreshNow(function(err) {
			if (err)
				return false;
			refreshPopular();
		});
	});
}

function refreshSearch() {
	pendingShows.searchList = [];
	if (!_.isEmpty($.term.value))
		search(1);
};
var nowPage		 = 1,
	todayPage 	 = 1,
	popularPage  = 1,
	searchPage	 = 1;

$.isNow.init($.nowList);
$.isToday.init($.todayList);
$.isPopular.init($.popularList);
$.isSearch.init($.searchList);

function loadMoreNow(e) { loadShows('getOnTheAir', 'nowList', function(err) { (e[err ? 'error' : 'success'])(); }, ++nowPage); }
function loadMoreToday(e) { loadShows('getAiringToday', 'todayList', function(err) { (e[err ? 'error' : 'success'])(); }, ++todayPage); }
function loadMorePopular(e) { loadShows('getPopular', 'popularList', function(err) { (e[err ? 'error' : 'success'])(); }, ++popularPage); }
function loadMoreSearch(e) { search(++searchPage, function(err) { (e[err ? 'error' : 'success'])(); }); }

function loadShows(type, list, callback, page) {
	Alloy.Globals.loading.show(L('list_loading'), false);
	
	page = page || 1;
	
	api.tv[type]({'language': 'fr', 'include_adult': false, 'page': page, 'include_image_language': 'fr, en,null'},
		function(response) {
			buildList(list, response, page > 1);
			Alloy.Globals.loading.hide();
			_.isFunction(callback) && callback(null);
		},
		function(err) {
			Alloy.Globals.loading.hide();
			Alloy.createWidget("com.mcongrove.toast", null, {
		    	text: L('cant_connect'),
			    duration: 5000,
			    view: $.tableList
			});
			
			_.isFunction(callback) && callback({});
			
			return false;
		}
	);
}

function search(page, callback) {
	Alloy.Globals.loading.show(L('list_loading'), false);
	
	page		= parseInt(page) || 1;
	searchPage	= page;
	
	api.search.getTv({ query: $.term.value, page: page }, 
		function(response) {
			buildList('searchList', response, page > 1);
			Alloy.Globals.loading.hide();
			_.isFunction(callback) && callback(null);
		},
		function(err) {
			Ti.API.info(err);
			Alloy.Globals.loading.hide();
			Alloy.createWidget("com.mcongrove.toast", $.search_wrapper, {
		    	text: L('cant_connect'),
			    duration: 5000,
			    view: $.tableList
			});
			
			_.isFunction(callback) && callback({});
			
			return false;
		}
	);
};

function buildList(list, response, append) {
	$[list].removeAllChildren();
	
	if (_.isEmpty(response))
		return false;
		
	response = JSON.parse(response);
	if (_.isEmpty(response.results))
		return false;
		
	if (!_.isEmpty(pendingShows[list])) {
		response.results = pendingShows[list].concat(response.results);
	} 
	
	pendingShows[list] = [];
	
	if (response.results.length % 3 > 0) {
		pendingShows[list] = _.rest(response.results, response.results.length - response.results.length % 3);
		response.results = _.first(response.results, response.results.length - response.results.length % 3);
	}
	var rows = [];
	for (var i = 0; i < response.results.length; i += 3) {
		var results = [response.results[i]];
		if (response.results[i + 1]) {
			results.push(response.results[i + 1]);
			if (response.results[i + 2])
				results.push(response.results[i + 2]);
		}
		
		var row = Widget.createController('show_row', results).getView();
		
		if (append)
			$[list].appendRow(row);
		else
			rows.push(row);
	}
	
	!append && $[list].setData(rows);
}