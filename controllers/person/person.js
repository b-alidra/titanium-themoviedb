var moment		= require('alloy/moment'),
	api			= require('themoviedb/themoviedb');
	
api.common.api_key = '1b3785a9a5de9fd3452af6e32e092357';

var person_id = arguments[0] || {};
var person;

Alloy.Globals.loading.show(L('list_loading'), false);

$.bioTitle.text		= L('bio');
$.moviesTitle.text	= L('movies');
$.showsTitle.text	= L('shows');

api.people.getById({ 'id': person_id, 'language': Titanium.Locale.getCurrentLanguage(), 'append_to_response': 'images,movie_credits,tv_credits', 'include_image_language': Titanium.Locale.getCurrentLanguage() + ',en,null' },
	function(response) {
		if (_.isEmpty(response))
			return false;
		
		person = JSON.parse(response);
			
		$.poster.image		= api.common.getImage({'size': 'w300', 'file': person.profile_path});
		$.name.text			= person.name;
		$.birth.text		= moment(person.birthday).format(L('date_format'));
		$.birth_place.text	= person.place_of_birth;
		$.score.text		= person.popularity ? parseInt(person.popularity) + "%" : 0;
		$.bio.value			= person.biography;
		
		if (!_.isEmpty(person.movie_credits.cast)) {
			
			/* Sort by release date */
			var movies = _.sortBy(person.movie_credits.cast, function(c) { return c.release_date; });
			var rows = [];
			
			for (var i = movies.length - 1; i >= 0; i -= 3) {
				var results = [movies[i]];
				if (movies[i - 1]) {
					results.push(movies[i - 1]);
					if (movies[i - 2])
						results.push(movies[i - 2]);
				}
				
				var row = Widget.createController('movie/movie_row', results).getView();
				
				rows.push(row);
			}
			$.moviesList.setData(rows);
		}
		
		if (!_.isEmpty(person.tv_credits.cast)) {
			
			/* Sort by first air date */
			var shows = _.sortBy(person.tv_credits.cast, function(c) { return c.first_air_date; });
			var rows = [];
			
			for (var i = shows.length - 1; i >= 0; i -= 3) {
				var results = [shows[i]];
				if (shows[i - 1]) {
					results.push(shows[i - 1]);
					if (shows[i - 2])
						results.push(shows[i - 2]);
				}
				
				var row = Widget.createController('show/show_row', results).getView();
				
				rows.push(row);
			}
			$.showsList.setData(rows);
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

$.backIcon.addEventListener('click', function() { $.win.close(); });