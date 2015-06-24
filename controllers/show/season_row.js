var moment  = require('alloy/moment'),
	api		= require('themoviedb/themoviedb');

var arg = arguments[0] || {};

$.row.show_name			= arg.show_name;
$.row.show_backdrop		= arg.show_backdrop;
$.row.show_id			= arg.show_id;
$.row.season_number		= arg.season_number;

$.poster.image			= api.common.getImage({'size': 'w300', 'file': arg.poster_path});
$.title.text			= L('season') + ' ' + arg.season_number;
$.nb_pisodes.text		= arg.episode_count + ' ' + L('episodes');
$.air_date.text			= moment(arg.air_date).format(L('date_format'));

$.poster.addEventListener('load', function() {
	this.animate({
		opacity : 1,
		duration : 200
	});
});

function selectedSeason(e) {
	var options = {
		"show_name": e.source.show_name,
		"id": e.source.show_id,
		"season_number": e.source.season_number,
		"show_backdrop": e.source.show_backdrop
	};

	Widget.createController('show/season', options)
		.getView()
		.open({ fullscreen: true });
}