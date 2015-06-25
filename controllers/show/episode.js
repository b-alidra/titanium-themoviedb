var moment  	= require('alloy/moment'),
	api			= require('themoviedb/themoviedb'),
	config 		= require('t411/config'),
	t411		= new (require('t411/t411'))(
		Ti.App.Properties.getString('t411_username'),
		Ti.App.Properties.getString('t411_password')
	);
	
var TORRENTS_SLIDE_INDEX = 1;

api.common.api_key = '1b3785a9a5de9fd3452af6e32e092357';

var options = arguments[0] || {};
_.extend(options, { 'language': Titanium.Locale.getCurrentLanguage(), 'append_to_response': 'images,videos,credits', 'include_image_language': Titanium.Locale.getCurrentLanguage() + ',en,null' });

var episode;

Alloy.Globals.loading.show(L('list_loading'), false);

$.synopsisTitle.text		= L('synopsis');
$.torrentsTitle.text		= L('torrents');

api.tvEpisodes.getById(options,
	function(response) {
		if (_.isEmpty(response))
			return false;
		
		episode = JSON.parse(response);
		if (_.isEmpty(episode.still_path)) {
			$.headerImage.image	= "backdrop.png";
			$.infosWrapper.backgroundColor = "#0D000000";
		}
		else
			$.headerImage.image	= api.common.getImage({'size': 'w500', 'file': episode.still_path});
			
		$.poster.image			= api.common.getImage({'size': 'w300', 'file': options.season_poster});
		$.show_name.text		= options.show_name;
		$.season_episode.text	= L('season') + ' ' + options.season_number + ' ' + L('episode') + ' ' + episode.episode_number;
		$.episode_name.text		= episode.name;
		$.overview.value		= episode.overview;
		$.episode_date.text		= moment(episode.air_date).format(L('date_format'));
		
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

		var term =	options.show_name + ' ' +
					'S' + (options.season_number < 10 ? '0' : '') + options.season_number +
					'E' + (options.episode_number < 10 ? '0' : '') + options.episode_number ;
					
		t411.search({ term: term, category: 433 }, function(err, response) {

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