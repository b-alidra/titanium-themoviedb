var api	= require('themoviedb/themoviedb');	
api.common.api_key = '1b3785a9a5de9fd3452af6e32e092357';

/**
 * TheMovieDB API doesn't support custom pagination, it only answers with 20 results max.
 * As we show three movies per row, we fill the rows and store the pending for the next time.
 */
var pendingMovies = {
	'nowList': [],
	'upComingList': [],
	'popularList': [],
	'searchList': []
};

$.nowTitle.text			= L('now_movies');
$.upcomingTitle.text	= L('upcoming_movies');
$.popularTitle.text		= L('popular_movies');

refreshAll();

function refreshNow(callback)      { if (OS_IOS) $.ptrNow.endRefreshing();      pendingMovies.nowList = [];      loadMovies('getNowPlaying', 'nowList',      callback); }
function refreshUpcoming(callback) { if (OS_IOS) $.ptrUpcoming.endRefreshing(); pendingMovies.upComingList = []; loadMovies('getUpcoming',   'upComingList', callback); }
function refreshPopular(callback)  { if (OS_IOS) $.ptrPopular.endRefreshing();  pendingMovies.popularList = [];  loadMovies('getPopular',    'popularList',  callback); }

function refreshAll() {
	refreshNow(function(err) {
		if (err)
			return false;
		refreshUpcoming(function(err) {
			if (err)
				return false;
			refreshPopular();
		});
	});
}

function refreshSearch() {
	if (!_.isEmpty($.term.value))
		search();
};
var nowPage		 = 1,
	upcomingPage = 1,
	popularPage  = 1,
	searchPage	 = 1;

$.isNow.init($.nowList);
$.isUpcoming.init($.upComingList);
$.isPopular.init($.popularList);
$.isSearch.init($.searchList);

function loadMoreNow(e) { loadMovies('getNowPlaying', 'nowList', function(err) { (e[err ? 'error' : 'success'])(); }, ++nowPage); }
function loadMoreUpcoming(e) { loadMovies('getUpcoming', 'upComingList', function(err) { (e[err ? 'error' : 'success'])(); }, ++upcomingPage); }
function loadMorePopular(e) { loadMovies('getPopular', 'popularList', function(err) { (e[err ? 'error' : 'success'])(); }, ++popularPage); }
function loadMoreSearch(e) { search(++searchPage, function(err) { (e[err ? 'error' : 'success'])(); }); }

function next() {
	tkt_api.next(function(err, response) {
		
		if (err) {
			Alloy.Globals.loading.hide();
			Alloy.createWidget("com.mcongrove.toast", null, {
		    	text: L('cant_connect'),
			    duration: 5000,
			    view: $.tableList
			});
			
			return false;
		}
		
		buildList(response, true);
		
		Alloy.Globals.loading.hide();
	});
}

function loadMovies(type, list, callback, page) {
	Alloy.Globals.loading.show(L('list_loading'), false);
	
	page = page || 1;
	
	api.movies[type]({'language': 'fr', 'include_adult': false, 'page': page, 'include_image_language': 'fr, en,null'},
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
	
	page		= page || 1;
	searchPage	= page;
	
	api.search.getMovie({ query: $.term.value, page: page }, 
		function(response) {
			buildList('searchList', response, page > 1);
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
};

function buildList(list, response, append) {
	$[list].removeAllChildren();
	
	if (_.isEmpty(response))
		return false;
		
	response = JSON.parse(response);
	if (_.isEmpty(response.results))
		return false;
		
	if (!_.isEmpty(pendingMovies[list])) {
		response.results = pendingMovies[list].concat(response.results);
	} 
	
	pendingMovies[list] = [];
	
	if (response.results.length % 3 > 0) {
		pendingMovies[list] = _.rest(response.results, response.results.length - response.results.length % 3);
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
		
		var row = Widget.createController('row', results).getView();
		
		if (append)
			$[list].appendRow(row);
		else
			rows.push(row);
	}
	
	!append && $[list].setData(rows);
}