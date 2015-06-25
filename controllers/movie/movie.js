var moment		= require('alloy/moment'),
	api			= require('themoviedb/themoviedb'),
	config 		= require('t411/config'),
	t411		= new (require('t411/t411'))(
		Ti.App.Properties.getString('t411_username'),
		Ti.App.Properties.getString('t411_password')
	);
	
var TORRENTS_SLIDE_INDEX = 2;

api.common.api_key = '1b3785a9a5de9fd3452af6e32e092357';

var movie_id = arguments[0] || {};
var movie;

Alloy.Globals.loading.show(L('list_loading'), false);

$.votes.text				= L('votes').toUpperCase();
$.trailersTitle.text		= L('trailer');
$.synopsisTitle.text		= L('synopsis');
$.torrentsTitle.text		= L('torrents');

api.movies.getById({ 'id': movie_id, 'language': Titanium.Locale.getCurrentLanguage(), 'append_to_response': 'images,trailers,credits', 'include_image_language': Titanium.Locale.getCurrentLanguage() + ',en,null' },
	function(response) {
		if (_.isEmpty(response))
			return false;
		
		movie = JSON.parse(response);
		
		if (_.isEmpty(movie.backdrop_path)) {
			$.headerImage.image	= "backdrop.png";
			$.infosWrapper.backgroundColor = "#0D000000";
		}
		else
			$.headerImage.image	= api.common.getImage({'size': 'w500', 'file': movie.backdrop_path});
			
		$.poster.image		= api.common.getImage({'size': 'w300', 'file': movie.poster_path});
		$.title.text		= movie.title;
		$.runtime.text		= movie.runtime + ' min';
		$.year.text			= movie.release_date ? moment(movie.release_date).format(L('date_format')) : '';
		$.score.text		= movie.popularity ? parseInt(movie.popularity) + "%" : 0;
		$.nbVotes.text		= movie.vote_count ? movie.vote_count : 0;
		$.overview.value	= movie.overview;
		
		$.cast_images.width = 0;
		
		if (!_.isEmpty(movie.genres)) {
			var genres = [];
			_.each(movie.genres, function(g) {
				genres.push(g.name);
			});
			$.genres.text = genres.join(' - ');
		}
		
		setTimeout(function() {
			if (!_.isEmpty(movie.credits.cast)) {
				_.each(movie.credits.cast, function(c) {
					if (_.isEmpty(c["profile_path"]))
						return false;
					var cast = Ti.UI.createImageView({
						"class": "cast_image",
						"image" : api.common.getImage({'size': 'w150', 'file': c["profile_path"]}),
						"width": Titanium.UI.SIZE,
						"height": "80dp",
						"right": "5dp",
						"preventDefaultImage": true,
						"borderRadius": 3,
						"person_id": c.id,
						 "onClick": "showCast"
					});
					$.cast_images.add(cast);
					$.cast_images.width += 55;
					
					cast.addEventListener('click', function(e) {
						var person = Widget.createController('person/person', e.source.person_id).getView();
						person.open({ fullscreen: true });
					});
				});
			}
			else
				$.wrapper.bottom = 0;
		}, 1000);
				
		if (movie.trailers.youtube.length > 0) {
			_.each(movie.trailers.youtube, function(t) {
				$.trailer.add(Ti.UI.createWebView({
				    url: 'http://www.youtube.com/embed/' + t.source + '?autoplay=1&autohide=1&cc_load_policy=0&color=white&controls=0&fs=0&iv_load_policy=3&modestbranding=1&rel=0&showinfo=0',
				    enableZoomControls: false,
				    scalesPageToFit: true,
				    scrollsToTop: false,
				    showScrollbars: false,
				    backgroundColor: "#000000",
				    color: "#FFFFFF"
				}));
			});			
		}
		else {
			$.tabs.remove($.trailersWrapper);
		}
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
			if (err) {
				Ti.API.error(err);
				Alloy.Globals.loading.hide(); 
				return false;
			}
				
			if (_.isEmpty(response.torrents)) {
				Alloy.Globals.loading.hide();
				return false; 
			}
				
			/* Sort by seeders */
			var sorted_torrents = _.sortBy(response.torrents, function(t) { return - parseInt(t.seeders); });
			
			_.each(sorted_torrents, function(t) {
				/* We use appendRow and not setData so as to keep the list ordered ... */
				$.torrentsList.appendRow(Widget.createController('torrent/torrent', t).getView());
			});
			
			$.torrentsList.animate( { opacity: 1, duration: 1000 });
			Alloy.Globals.loading.hide(); 
		});
	}
});

$.backIcon.addEventListener('click', function() { $.win.close(); });