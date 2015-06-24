var api			= new (require('t411/t411'))(),
	filesize	= require('ext/filesize');

var args				= arguments[0] || {};
$.torrent_title.text	= args.name || '';
$.torrent_size.text		= filesize(args.size);
$.torrent_seeders.text	= args.seeders + " Seeders";
$.torrent_leechers.text	= args.leechers + " Leechers";
$.torrent_date.text		= L('added_on') + ' ' + args.added;
$.fa.add($.icon, "fa-download");

$.row.addEventListener('click', function() {
	Alloy.Globals.loading.show(L('list_loading'), false);
	
	api.download(args.id, function(err, response) {
		Alloy.Globals.loading.hide();
		if(err)
			alert('Impossible de télécharger ce torrent');
		else {
			var add_view = Alloy.createWidget('com.b-alidra.transmission', 'add', { data: response }).getView();
			add_view.top				= "25%";
			add_view.right				= "10dp";
			add_view.bottom				= "25%";
			add_view.left				= "10dp";

			add_view.open({ fullscreen: true });
		}
	});
});