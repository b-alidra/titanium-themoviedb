var __  	= require('alloy/underscore'),
	moment	= require('alloy/moment'),
	api		= require('themoviedb/themoviedb');

var arg = arguments[0] || {};
			
$.row.show_name			= arg.show_name;
$.row.show_id			= arg.show_id;
$.row.season_number		= arg.season_number;
$.row.season_poster		= arg.season_poster;
$.row.episode_number	= arg.episode_number;

$.poster.image			= api.common.getImage({'size': 'w150', 'file': arg.still_path});
$.title.text			= arg.name;
$.episode_number.text	= L('episode') + ' ' + arg.episode_number;
$.air_date.text			= moment(arg.air_date).format(L('date_format'));
$.overview.text			= arg.overview;

function selectedEpisode(e) {
	Ti.API.info(e.source);
	
	var options = {
		"show_name": e.source.show_name,
		"season_poster": e.source.season_poster,
		"id": e.source.show_id,
		"season_number": e.source.season_number,
		"episode_number": e.source.episode_number
	};
	Ti.API.info(options);
	setTimeout(function() {
		Widget.createController('episode', options)
			.getView()
			.open({ fullscreen: true });
	}, 1000);
}