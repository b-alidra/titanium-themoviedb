var api			= require('themoviedb/themoviedb'),
	config 		= require('t411/config'),
	t411		= new (require('t411/t411'))(
		Ti.App.Properties.getString('t411_username'),
		Ti.App.Properties.getString('t411_password')
	);
	
var TORRENTS_SLIDE_INDEX = 2;

api.common.api_key = '1b3785a9a5de9fd3452af6e32e092357';

var options = arguments[0] || {};
_.extend(options, { 'language': Titanium.Locale.getCurrentLanguage(), 'append_to_response': 'images,videos,credits', 'include_image_language': Titanium.Locale.getCurrentLanguage() + ',en,null' });

var season;

Alloy.Globals.loading.show(L('list_loading'), false);

$.votes.text				= L('votes').toUpperCase();
$.episodesTitle.text		= L('episodes');
$.synopsisTitle.text		= L('synopsis');
$.torrentsTitle.text		= L('torrents');

api.tvSeasons.getById(options,
	function(response) {
		if (_.isEmpty(response))
			return false;
		
		season = JSON.parse(response);
		if (_.isEmpty(options.show_backdrop)) {
			$.headerImage.image	= "backdrop.png";
			$.infosWrapper.backgroundColor = "#0D000000";
		}
		else
			$.headerImage.image	= api.common.getImage({'size': 'w500', 'file': options.show_backdrop});
			
		$.poster.image		= api.common.getImage({'size': 'w300', 'file': season.poster_path});
		$.title.text		= options.show_name;
		$.year.text			= season.name;
		$.score.text		= season.popularity ? parseInt(season.popularity) + "%" : 0;
		$.nbVotes.text		= season.vote_count ? season.vote_count : 0;
		$.overview.value	= season.overview;
		
		if (!_.isEmpty(season.genres)) {
			var genres = [];
			_.each(season.genres, function(g) {
				genres.push(g.name);
			});
			$.genres.text = genres.join(' - ');
		}
		
		_.each(season.episodes, function(e) {
			e.show_name		= options.show_name;
			e.show_id		= options.id;
			e.show_backdrop = options.show_backdrop;
			e.season_number	= season.season_number;
			e.season_poster	= season.poster_path;
			$.episodes.appendRow(Widget.createController('show/episode_row', e).getView());
		});
		
		Alloy.Globals.loading.hide();
		
		/* Load english overview if empty in local language */
		if (_.isEmpty($.overview.value) && Titanium.Locale.getCurrentLanguage() != 'en') {
			Alloy.Globals.loading.show(L('list_loading'), false);
			api.tvSeasons.getById({ 'id': options.id,  'season_number': options.season_number },
				function(response) {
					if (_.isEmpty(response))
						return false;
					$.overview.value = JSON.parse(response).overview;
					Alloy.Globals.loading.hide();
				},
				function() {
					Alloy.Globals.loading.hide();
					Alloy.createWidget("com.mcongrove.toast", null, {
				    	text: L('cant_connect'),
					    duration: 5000,
					    view: $.wrapper
					});
					
					return false;
				}
			);
		}
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

		t411.search({ term: options.show_name + ' ' + season.name, category: 631 }, function(err, response) {

			if (err) {
				Ti.API.error(err);
				Alloy.Globals.loading.hide(); 
				return false;
			}
				
			if (_.isEmpty(response.torrents))
				return false;
				
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