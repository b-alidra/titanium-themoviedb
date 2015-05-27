var __  = require('alloy/underscore'),
	api	= require('themoviedb/themoviedb');
api.common.api_key = '1b3785a9a5de9fd3452af6e32e092357';

var movie_id = arguments[0] || {};

Alloy.Globals.loading.show(L('list_loading'), false);

$.downloadButtonText.text	= L('download');
$.votes.text				= L('votes').toUpperCase();
$.synopsisTitle.text		= L('synopsis');
$.torrentsTitle.text		= L('torrents');

api.movies.getById({ 'id': movie_id, 'language': 'fr', 'append_to_response': 'images,list,credits', 'include_image_language': 'fr' },
	function(response) {
		if (__.isEmpty(response))
			return false;
		
		response = JSON.parse(response);
		Ti.API.info(response);
			
		$.headerImage.image	= api.common.getImage({'size': 'w500', 'file': response.backdrop_path});
		$.poster.image		= api.common.getImage({'size': 'w500', 'file': response.poster_path});
		$.title.text		= response.title;
		$.year.text			= response.release_date ? response.release_date.substring(0, 4) : '';
		$.score.text		= response.popularity ? parseInt(response.popularity) + "%" : 0;
		$.nbVotes.text		= response.vote_count ? response.vote_count : 0;
		$.overview.value	= response.overview;
		
		$.cast_images.width = 0;
		__.each(response.credits.cast, function(c) {
			if (__.isEmpty(c["profile_path"]))
				return false;
			Ti.API.info(c);
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
		
		if (!__.isEmpty(response.genres)) {
			var genres = [];
			__.each(response.genres, function(g) {
				genres.push(g.name);
			});
			$.genres.text = genres.join(' - ');
		}
		$.headerImage.image = api.common.getImage({'size': 'w500', 'file': response.backdrop_path});
		
		$.headerImage.addEventListener('load', function() {
			$.wrapper.animate({
				opacity : 1,
				duration : 200
			});
		});
	
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

$.backIcon.addEventListener('click', function() { $.win.close(); });