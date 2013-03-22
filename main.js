$(document).ready(function() {
	var ready = true;
	var queuedMessages = new Array();
	
	$(function() {
		$("#terminal").draggable();
		$("#chatTerminal").draggable();
	});
	
	function htmlEntities(str) {
	    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}
	
	var socket = io.connect();
	socket.on('connect', function() {
		$('#status').text('Connected');
	});
	
	document.getElementById('command').focus();

	$('#sendButton').bind('click', function() {
		var message = $('#command').val();
		socket.send(message);
		$('#command').val('');
	});

	socket.on('message', function(m) {
		$('#messages').text('');
		m = m.split(',');
		for ( var index = 0; index < Math.min(m.length,15); index++) {
			$('#messages').append("<div>"+htmlEntities(m[index+Math.max(0,m.length-15)])+"</div>");
		}
	});
	
	socket.on('leader', function(m) {
		$('#chatTerminal #content #leader').text(m);
	});

	socket.on('disconnect', function() {
		$('#status').text('Disconnected');
	});

	socket.on('gameInfo', function(message) {
		if(message != 'clear') {
			if(ready) {
				var entries = $('div#info').get().length;
				if(entries < 15) {
					$('#gameInfo').append("<div id=\"info\">"+message+"</div>");
				}
				else {
					while($('div#info').get().length > 14){
						$('div#info').slice(0,1).remove();
					}
					$('#gameInfo').append("<div id=\"info\">"+message+"</div>");
				}
			} else {
				queuedMessages.push(message);
				setTimeout(function() {update();}, 100);
			}
		} else {
			$('div#info').slice(0,$('div#info').get().length).remove();
		}
	});
	
	socket.on('sleep', function(time) {
		ready = false;
		setTimeout(function() {
			ready = true;
		}, parseInt(time));
	});
	
	socket.on('starwars', function() {
		$('#terminal').append("<div id=\"screen\"></div>");
		$('#root').remove();
		$('#gameInfo').remove();
		$('#command').remove();
		$('#terminal').css("width","41em");
		var cssObj = {
			      'width' : '41em',
			      'height' : '67px'
		}
		$('#terminal #banner').css(cssObj);
		Start();
	});
	
	function update() {
		if(ready) {
			for ( var index = 0; index < queuedMessages.length; index++) {
				var message = queuedMessages[index];
				var entries = $('div#info').get().length;
				if(entries < 15) {
					$('#gameInfo').append("<div id=\"info\">"+message+"</div>");
				}
				else {
					while($('div#info').get().length > 14){
						$('div#info').slice(0,1).remove();
					}
					$('#gameInfo').append("<div id=\"info\">"+message+"</div>");
				}
			}
			queuedMessages = new Array();
		} else {
			//Call back so deal with irrulegular sleeps
			setTimeout(function() {update();}, 100);
		}
	}
});
