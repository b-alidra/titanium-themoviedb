var __  = require('alloy/underscore'),
	api	= require('themoviedb/themoviedb');
api.common.api_key = '1b3785a9a5de9fd3452af6e32e092357';

$.nowTitle.text = L('now_movies');
$.upcomingTitle.text = L('upcoming_movies');
$.popularTitle.text = L('popular_movies');
$.searchTitle.text = L('search');

refreshAll();

function refreshNow(callback)      { if (OS_IOS) $.ptrNow.endRefreshing();      loadMovies('getNowPlaying', 'nowList',      callback); }
function refreshUpcoming(callback) { if (OS_IOS) $.ptrUpcoming.endRefreshing(); loadMovies('getUpcoming',   'upComingList', callback); }
function refreshPopular(callback)  { if (OS_IOS) $.ptrPopular.endRefreshing();  loadMovies('getPopular',    'popularList',  callback); }

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
	if (!__.isEmpty($.term.value))
		search();
};

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

function loadMovies(type, list, callback) {
	Alloy.Globals.loading.show(L('list_loading'), false);
	
	api.movies[type]({'language': 'fr', 'limit': 30, 'include_adult': false},
		function(response) {
			buildList(list, response);
			Alloy.Globals.loading.hide();
			__.isFunction(callback) && callback(null);
		},
		function(err) {
			Alloy.Globals.loading.hide();
			Alloy.createWidget("com.mcongrove.toast", null, {
		    	text: L('cant_connect'),
			    duration: 5000,
			    view: $.tableList
			});
			
			__.isFunction(callback) && callback({});
			
			return false;
		}
	);
}

function search() {
	Alloy.Globals.loading.show(L('list_loading'), false);
	
	api.search.getMovie({ query: $.term.value }, 
		function(response) {
			buildList('searchList', response);
			Alloy.Globals.loading.hide();
		},
		function(err) {
			Alloy.Globals.loading.hide();
			Alloy.createWidget("com.mcongrove.toast", null, {
		    	text: L('cant_connect'),
			    duration: 5000,
			    view: $.tableList
			});
			
			return false;
		}
	);
};

function buildList(list, response, append) {
	$[list].removeAllChildren();
	
	if (__.isEmpty(response))
		return false;
		
	response = JSON.parse(response);
	if (__.isEmpty(response.results))
		return false;
		
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
	/*__.each(response.results, function(m) {
		var row = Widget.createController('row', m).getView();
		if (append)
			$.tableList.appendRow(row);
		else
			rows.push(row);
	});*/
	
	!append && $[list].setData(rows);
}