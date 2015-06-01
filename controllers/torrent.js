var api			= new (require('t411/t411'))(),
	filesize	= require('ext/filesize');

var args				= arguments[0] || {};
$.torrent_title.text	= args.name || '';
$.torrent_size.text		= filesize(args.size);
$.torrent_seeders.text	= args.seeders + " Seeders";
$.torrent_leechers.text	= args.leechers + " Leechers";
$.torrent_date.text		= L('added_on') + ' ' + args.added;
$.fa.add($.icon, "fa-download");

$.icon.addEventListener('click', function() {
	api.download(args.id, function(err, response) {
		if(err)
			alert('Impossible de télécharger ce torrent');
		else {
			Ti.API.info(response);
			var add_view = Alloy.createWidget('com.b-alidra.transmission', 'add', { data: response }).getView();
			add_view.open();
			add_view.top	= "-52dp";
			add_view.right	= "10dp";
			add_view.bottom	= "10dp";
			add_view.left	= "10dp";
		}
	});
});