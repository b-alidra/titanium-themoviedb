var __  = require('alloy/underscore'),
	api	= require('themoviedb/themoviedb');

var arg = arguments[0] || {};

$.poster.image		= api.common.getImage({'size': 'w300', 'file': arg.poster_path});
$.poster.show_id	= arg.id;
$.title.text		= L('season') + ' ' + arg.season_number;
$.nb_pisodes.text	= arg.episode_count + ' ' + L('episodes');
$.air_date.text		= L('since') + ' ' + arg.air_date;

$.poster.addEventListener('load', function() {
	this.animate({
		opacity : 1,
		duration : 200
	});
});

function selectedSeason(e) {
	var movie = Widget.createController('season', e.source.show_id).getView();
	movie.open({ fullscreen: true });
}