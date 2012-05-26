/*

  - if title is edited, nothing happens
  - if user uses arrows, updates are sent

*/
var io     = require("socket.io").listen(8002);
var util   = require("util");
var nano   = require("nano")("http://localhost:5984");
var events = require("../client/js/events.js");

var db     = nano.use("cote");

io.configure(function () {
  io.set ("log level", 2);
});

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
        docs[id] = {};
        docs[id].editors = new Array ();
      }
      docs[id].editors.push(socket);
      util.log("added " + socket.id + " to editors' array");

      if (docs[id].doc === undefined) {
        db.get(id, function (err, res) {
          if (!err) {
            socket.emit(DOC.INIT, res);
            docs[id].doc = res;
          }
        });
      }
      else {
        socket.emit (DOC.INIT, docs[id].doc);
      }
      util.log("sent doc to " + socket.id);
    }
  };

  this.disconnectHandler = function (socket) {
    for (var i in docs) {
      for (var j in docs[i].editors) {
        if (socket === docs[i].editors[j]) {
          docs[i].editors.splice (j, 1);
          util.log(socket.id + " disconnected");
          return;
        }
      }
    }
  };

  this.createHandler = function (socket, data) {
    console.log ("DOC.CREATE: " + JSON.stringify (data));
    if (data.content === undefined) {
      return;
    }
    data.created_at = new Date ().toString ();
    db.insert(data, function (err, body) {
      if (!err) {
        db.get (body.id, function (err, res) {
          util.log (socket.id + " created new doc" + " (id = " + body.id + ")");
          docs[body.id] = {};
          docs[body.id].editors = new Array ();
          docs[body.id].editors.push (socket);
          docs[body.id].doc = res;
          socket.emit (DOC.CREATE, res);
        });
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

    if (data.type === "title") {
      docs[data.id].doc.title = data.value;
    }
    else if (data.type === "author") {
      docs[data.id].doc.author = data.value;
    }
    else if (data.type === "content") {

    }

    /*
    var editors = docs[data.id];
    if (editors === undefined || editors instanceof Array !== true) {
      util.log("no editors");
      return;
    }
    var editor;
    for (var i = 0; i < editors.length; i++) {
      editor = editors[i];
      if (editor === socket) { continue; }
      editor.emit(DOC.UPDATE, data);
      util.log("sent update to " + editor.id);
    }
    */
  };

  this.saveHandler = function (socket, data) {
    if (data.id === undefined) {
      return;
    }
    if (docs[data.id] === undefined) { return; }
    var timestamp = new Date ().toString ();
    docs[data.id].doc.updated_at = timestamp;
    db.insert (docs[data.id].doc, function (err, res) {
      if (!err) {
        util.log ("DOC.SAVE: " + socket.id);
        docs[data.id].doc._rev = res.rev;
        var editors = docs[data.id].editors;
        for (var i = 0; i < editors.length; i++) {
          editors[i].emit (DOC.SAVE, { timestamp : timestamp });
        }
      }
      else {
        console.log (err);
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

  socket.on (DOC.SAVE, function (data) {
    cote.saveHandler(socket, data);
  });

  socket.on ("disconnect", function () {
    cote.disconnectHandler(socket);
  });

});

