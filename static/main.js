window.addEventListener('load', function() {
	var main_table = document.getElementById('main_table');
	var $CURR = null;
	function send_to(url, method, o, cb) {
		url = url + '?t=' + Date.now()
		console.log(url);
		var req = new XMLHttpRequest();
		req.open(method, url, true);
		req.setRequestHeader('Content-type', 'application/json');
		req.onreadystatechange = function() {
			if (req.readyState != 4)
				return;
			switch (req.status) {
			case 200:
				cb(null, JSON.parse(req.responseText));
				break;
			case 204:
				cb(null, null);
				break;
			case 409:
				cb(req.responseText);
				break;
			case 0:
				cb('Request to server timed out');
				break;
			default:
				cb('Bad response from server: ' + req.status + ' ' + req.statusText);
			}
		};
		if (o) {
			req.send(JSON.stringify(o));
		} else {
			req.send();
		}
	}
	function kill(o) {
		while (o.firstChild) {
			o.removeChild(o.firstChild);
		}
	}
	function show_return_btn(okay) {
		var val = okay ? 'inline' : 'none';
		document.getElementById('return_btn').style.display = val;
	}
	function show_modify_btn(okay) {
		var val = okay ? 'inline' : 'none';
		document.getElementById('add_btn').style.display = val;
		document.getElementById('edit_btn').style.display = val;
	}
	function set_text(obj_id, msg) {
		var o = document.getElementById(obj_id);
		kill(o);
		o.appendChild(document.createTextNode(msg));
	}
	function errormsg(err) {
		var e = document.getElementById('error');
		kill(e);
		show_modify_btn(false);
		if (err) {
			e.style.display = 'block';
			show_return_btn(true);
			e.appendChild(document.createTextNode(err));
			set_text('subtitle', 'Error');
		} else {
			e.style.display = 'none';
			show_return_btn(false);
		}
	}
	function make_link_for(data) {
		var a = document.createElement('a');
		a.href = '#';
		a.appendChild(document.createTextNode('view'));
		a.addEventListener('click', function() {
			$CURR = data;
			load_flower(data.COMNAME);
		});
		return a;
	}
	function make_form_input(label, value) {
		var tr = document.createElement('tr');
		var td0 = document.createElement('td');
		var td1 = document.createElement('td');
		var input = document.createElement('input');
		input.value = value;
		input.style.width = '300px';
		td0.appendChild(document.createTextNode(label));
		td1.appendChild(input);
		tr.appendChild(td0);
		tr.appendChild(td1);
		main_table.appendChild(tr);
		return input;
	}
	function make_form_button(label, action) {
		var tr = document.createElement('tr');
		var td = document.createElement('td');
		var button = document.createElement('button');
		button.appendChild(document.createTextNode(label));
		button.addEventListener('click', action);
		td.appendChild(button);
		tr.appendChild(td);
		main_table.appendChild(tr);
		return button;
	}
	function load_edit() 
	{
		kill(main_table);
		var genus = make_form_input('Genus', $CURR.GENUS);
		var species = make_form_input('Species', $CURR.SPECIES);
		var comname = make_form_input('Common name', $CURR.COMNAME);
		make_form_button('Done', function() {
			send_to('/db/flowers/' + $CURR.COMNAME, 'PUT', {
				GENUS : genus.value,
				SPECIES : species.value,
				COMNAME : comname.value,
			}, function(err, data) {
				errormsg(err);
				if (err) {
					return;
				}
				load_list();
			});
		});
	}
	function load_add() {
		kill(main_table);
		var name = make_form_input('Flower\'s Common Name', $CURR.COMNAME);
		var person = make_form_input('Person Name', '');
		var location = make_form_input('Location', '');
		var sighted = make_form_input('Date', '');
		make_form_button('Done', function() {
			send_to('/db/sightings/' + $CURR.COMNAME, 'POST', {
				NAME : name.value,
				PERSON : person.value,
				LOCATION : location.value,
				SIGHTED : sighted.value,
			}, function(err, data) {
				errormsg(err);
				if (err) {
					return;
				}
				load_flower(name.value);
			});
		});
	}
	function load_flower(comname) {
		send_to('/db/sightings/' + comname, 'GET', null, function(err, data) {
			errormsg(err);
			kill(main_table);
			if (err) {
				return;
			}
			show_return_btn(true);
			show_modify_btn(true);
			set_text('subtitle', 'Recent Sightings for ' + comname);
			for (var i in data) {
				var who = data[i].PERSON;
				var where = data[i].LOCATION;
				var when = data[i].SIGHTED;
				var tr = document.createElement('tr');
				var td = document.createElement('td');
				var str = 'seen by ' + who + ' at ' + where + ' on ' + when;
				td.appendChild(document.createTextNode(str));
				tr.appendChild(td);
				main_table.appendChild(tr);
			}
		});
	}
	function load_list() {
		send_to('/db/flowers', 'GET', null, function(err, data) {
			errormsg(err);
			kill(main_table);
			if (err) {
				return;
			}
			show_return_btn(false);
			show_modify_btn(false);
			set_text('subtitle', 'Flowers in Database');
			for (var i in data) {
				var tr = document.createElement('tr');
				var td0 = document.createElement('td');
				var td1 = document.createElement('td');
				var flower_name = data[i].COMNAME + ' (' + data[i].GENUS + ' ' + data[i].SPECIES + ')';
				td0.appendChild(make_link_for(data[i]))
				td0.style.paddingRight = '10px';
				td0.style.paddingLeft = '10px';
				td1.appendChild(document.createTextNode(flower_name));
				tr.appendChild(td0);
				tr.appendChild(td1);
				main_table.appendChild(tr);
			}
		});
	}
	document.getElementById('return_btn').addEventListener('click', load_list);
	document.getElementById('add_btn').addEventListener('click', load_add);
	document.getElementById('edit_btn').addEventListener('click', load_edit);
	load_list();
});
