var underscore  = require('alloy/underscore'),
	api			= require('themoviedb/themoviedb'),
	t411		= new (require('t411/t411'))();
	
var TORRENTS_SLIDE_INDEX = 1;

api.common.api_key = '1b3785a9a5de9fd3452af6e32e092357';

var movie_id = arguments[0] || {};
var movie;

Alloy.Globals.loading.show(L('list_loading'), false);

$.downloadButtonText.text	= L('download');
$.votes.text				= L('votes').toUpperCase();
$.synopsisTitle.text		= L('synopsis');
$.torrentsTitle.text		= L('torrents');

api.movies.getById({ 'id': movie_id, 'language': 'fr', 'append_to_response': 'images,list,credits', 'include_image_language': 'fr' },
	function(response) {
		if (underscore.isEmpty(response))
			return false;
		
		movie = JSON.parse(response);
		
		$.headerImage.image	= api.common.getImage({'size': 'w500', 'file': movie.backdrop_path});
		$.poster.image		= api.common.getImage({'size': 'w500', 'file': movie.poster_path});
		$.title.text		= movie.title;
		$.year.text			= movie.release_date ? movie.release_date.substring(0, 4) : '';
		$.score.text		= movie.popularity ? parseInt(movie.popularity) + "%" : 0;
		$.nbVotes.text		= movie.vote_count ? movie.vote_count : 0;
		$.overview.value	= movie.overview;
		
		$.cast_images.width = 0;
		
		if (!underscore.isEmpty(movie.genres)) {
			var genres = [];
			underscore.each(movie.genres, function(g) {
				genres.push(g.name);
			});
			$.genres.text = genres.join(' - ');
		}
		$.headerImage.image = api.common.getImage({'size': 'w500', 'file': movie.backdrop_path});
		
		setTimeout(function() {
			underscore.each(movie.credits.cast, function(c) {
				if (underscore.isEmpty(c["profile_path"]))
					return false;
				$.cast_images.add(Ti.UI.createImageView({
					"class": "cast_image",
					"image" : api.common.getImage({'size': 'w500', 'file': c["profile_path"]}),
					"width": "50dp",
					"height": "80dp",
					"right": "5dp",
					"preventDefaultImage": true,
					"borderRadius": 3,
				}));
				$.cast_images.width += 55;
			});
		}, 1000);
				
		Alloy.Globals.loading.hide();
	},
	function() {
		Alloy.Globals.loading.hide();
		Alloy.createWidget("com.mcongrove.toast", null, {
	    	text: L('cant_connect'),
		    duration: 5000,
		    view: $.tableList
		});
		
		return false;
	}
);

$.tabs.addEventListener('scrollend', function(e) {
	if (e.currentPage == TORRENTS_SLIDE_INDEX && !$.torrentsWrapper.hasLoadedTorrents) {
		$.torrentsWrapper.hasLoadedTorrents = true;
		Alloy.Globals.loading.show(L('list_loading'), false);
		
		t411.search({ term: movie.title, category: 631 }, function(err, response) {
			if (err)
				return false;
				
			var rows = [];
			underscore.each(response.torrents, function(t) {
				rows.push(Widget.createController('torrent', t).getView());
			});
			$.torrentsList.setData(rows);
			Alloy.Globals.loading.hide(); 
		});
	}
});

$.backIcon.addEventListener('click', function() { $.win.close(); });