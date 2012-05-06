var cote = {

	url : "http://localhost",
	port : "8001",
	socket : null,
	doc : null,
	caretPos : null,

	getDocParams : function () {
		var hash = window.location.hash;
		if (!hash) {
			return null;
		}
		else {
			var docID, docRev;
			docID = docRev = null;
			var attrs = hash.split("#");
			if (attrs[1]) {
				var idList = attrs[1].split("=");
				if (idList.length == 2) {
					docID = idList[1];
				}
			}
			if (attrs[2]) {
				var revList = attrs[2].split("=");
				if (revList.length == 2) {
					docRev = revList[1];
				}
			}
		}
		if (docID && docRev) {
			return { id : docID, rev : docRev };
		}
		else {
			return null;
		}
	},

	saveDocParams : function (id, rev) {
		window.location.hash = "id=" + id + "#rev=" + rev;
	},

	connect : function (args) {
		this.socket = io.connect(this.url + ":" + this.port);
		this.addListeners();
		this.socket.emit(CLIENT.CONNECT, args);
	},

	addListeners : function () {
		var self = this;
		this.socket.on (DOC.CREATE, function (data) {
			console.log(data);
			if (data.id !== undefined) {
				self.doc = data.id;
				self.saveDocParams(data.id, data.rev);
			}
		});

		this.socket.on (DOC.UPDATE, function (data) {
			console.log(data);
			self.updateHandler(data);
		});

		this.socket.on (DOC.DELETE, function (data) {
			console.log(data);
		});

		this.socket.on (DOC.SAVE, function (data) {
			console.log(data);
		});
	},

	createDoc : function (data) {
		this.socket.emit (DOC.CREATE, data);
	},

	init : function () {
		var params = this.getDocParams();
		console.log("connecting ...");
		this.connect(params);
		if (params !== null) {
			this.doc = params.id;
		}
	},

	saveButtonHandler : function (title, body) {
		console.log("saveButtonHandler called");
		if (this.doc === null) {
			this.socket.emit(DOC.CREATE, {
				title : title,
				body : body
			});
		}
		else {
			this.socket.emit(DOC.SAVE, {
				id : doc,
				title : title,
				body : body
			});
		}
	},

	keyEventHandler : function () {
		console.log("keyEventHandler called");
		if (this.doc !== null) {
			this.socket.emit(DOC.UPDATE, {
				id : this.doc,
				title : $("#doc-title").val(),
				body : $("#doc-body").val()
			});
		}
	},

	updateHandler : function (data) {
		if (data.title !== undefined) {
			$("#doc-title").val(data.title);
		}
		if (data.body !== undefined) {
			this.caretPos = $("#doc-body").caret();
			$("#doc-body").val(data.body);
			$("#doc-body").caret(this.caretPos);
		}
	}

};

$(document).ready(function () {

	$("#doc-body").tabby();
	$("#btn-save").click(function () {
		cote.saveButtonHandler($("#doc-title").val(), $("#doc-body").val());
	});
	$("#doc-body").keyup(function () { cote.keyEventHandler() });
	cote.init();

});

