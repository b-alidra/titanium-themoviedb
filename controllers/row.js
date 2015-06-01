var __  = require('alloy/underscore'),
	api	= require('themoviedb/themoviedb');

var args = arguments[0] || {};
for (var i = 0; i < args.length; i++) {
	var arg = args[i];
	var ban = $['banner' + (i+1)];
	ban.movie_id = arg.id;
	arg = arg.movie || arg.show || arg;

	if (__.isEmpty(arg.poster_path)) {
		ban.image = 'poster.png';
		/*$['bannerTitle' + (i+1)].text    = "Test";//args.original_title;
		$['bannerTitle' + (i+1)].opacity = 1;*/ 
	}
	else {
		ban.image = api.common.getImage({'size': 'w500', 'file': arg.poster_path});
	}
	ban.addEventListener('load', function() {
		this.animate({
			opacity : 1,
			duration : 200
		});
	});
}

function selectedMovie(e) {
	var movie = Widget.createController('movie', e.source.movie_id).getView();
	//movie.left = Ti.Platform.displayCaps.platformWidth;
	movie.open();
	movie.animate({ "left": 0, "duration" : 500 });
}