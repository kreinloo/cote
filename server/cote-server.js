var io = require("socket.io").listen(8001);
var util = require("util");
var nano = require("nano")("http://localhost:5984");
require("../client/js/events.js");

io.configure(function () {
	io.set ("log level", 2);
});

var docs = {};
var db = nano.use("cote");

function Cote () {

	var docs = {};
	var self = this;

	this.connectHandler = function (socket, data) {
		util.log("connect: " + JSON.stringify(data));
		var id;
		if (data !== null && data.id !== null) {
			id = data.id;
		}
		if (id) {
			var doc = docs[id];
			if (doc === undefined) {
				docs[id] = new Array();
			}
			docs[id].push(socket);
			util.log("added " + socket.id + " to listeners' array");

			db.get(id, function (err, res) {
				if (!err) {
					socket.emit(DOC.UPDATE, {
						title : res.title,
						body : res.body
					});
					util.log("sent doc to " + socket.id);
				}
			});

		}
	};

	this.disconnectHandler = function (socket) {
		var i, j, doc;
		for (i in docs) {
			doc = docs[i];
			for (j in doc) {
				if (socket === doc[j]) {
					doc.splice(j, 1);
					util.log("removed " + socket.id + " from array");
					return;
				}
			}
		}
	};

	this.createHandler = function (socket, data) {
		if (data.body === undefined || data.body === "") {
			return;
		}
		if (data.title === undefined) {
			data.title = "";
		}
		db.insert({
			title : data.title,
			body : data.body
		}, function (err, body) {
			if (!err) {
				util.log(socket.id + " created new document" + " (id = " + body.id +
					" rev = " + body.rev + ")");
				docs[body.id] = new Array();
				docs[body.id].push(socket);
				socket.emit (DOC.CREATE, body);
			}
			else {
				console.log(JSON.stringify(err));
			}
		})
	};

	this.updateHandler = function (socket, data) {
		util.log("update from " + socket.id);
		util.log(JSON.stringify(data));
		if (data.id === undefined) {
			util.log("data id is undefined");
			return;
		}
		var editors = docs[data.id];
		if (editors === undefined || editors instanceof Array !== true) {
			util.log("no editors");
			return;
		}
		var editor;
		for (var i = 0; i < editors.length; i++) {
			editor = editors[i];
			editor.emit(DOC.UPDATE, data);
			util.log("sending update to " + editor.id);
		}
	};

	this.openHandler = function (socket, data) {
		if (data.id === undefined) {
			return;
		}
		if (docs[data.id] === undefined) {
			docs[data.id] = new Array();
		}
		docs[data.id].push(socket);
	};

	this.saveHandler = function (socket, data) {
		if (data.id === undefined) {
			return;
		}
		util.log("saveHandler called");
		db.get(data.id, function (err, res) {
			if (!err) {
				db.insert({
					_id : res._id,
					_rev : res._rev,
					title : data.title,
					body : data.body
				}, function (err, res) {
					if (!err) {
						console.log(JSON.stringify(res));
					}
				});
				var editors = docs[res._id];
				for (var i = 0; i < editors.length; i++) {
					editors[i].emit(DOC.SAVE, {});
				}
			}
		});
	};

};

var cote = new Cote();

io.sockets.on ("connection", function (socket) {

	socket.on (CLIENT.CONNECT, function (data) {
		cote.connectHandler(socket, data);
	});

	socket.on (DOC.CREATE, function (data) {
		cote.createHandler(socket, data);
	});

	socket.on (DOC.UPDATE, function (data) {
		cote.updateHandler(socket, data);
	});

	socket.on (DOC.DELETE, function (data) {
	});

	socket.on (DOC.SAVE, function (data) {
		cote.saveHandler(socket, data);
	});

	socket.on (DOC.OPEN, function (data) {
		cote.openHandler(socket, data);
	});

	socket.on ("disconnect", function () {
		cote.disconnectHandler(socket);
	});

});

