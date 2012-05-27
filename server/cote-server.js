/*

  - if title is edited, nothing happens
  - if user uses arrows, updates are sent

*/
var io     = require("socket.io").listen(8002);
var util   = require("util");
var gdiff  = require("googlediff");
var nano   = require("nano")("http://localhost:5984");
var events = require("../client/js/events.js");

var db     = nano.use("cote");

io.configure(function () {
  io.set ("log level", 2);
});

function Cote () {

  var docs = {};
  var self = this;
  var patcher = new gdiff ();

  this.connectHandler = function (socket, data) {
    util.log("CLIENT.CONNECT from " + socket.id + " " + JSON.stringify(data));
    socket.emit (CLIENT.NAME, "editor-" + String(socket.id).substr(0, 5));
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
    }
  };

  this.disconnectHandler = function (socket) {
    for (var i in docs) {
      for (var j in docs[i].editors) {
        if (socket === docs[i].editors[j]) {
          docs[i].editors.splice (j, 1);
          util.log("CLIENT.DISCONNECT from " + socket.id);
          return;
        }
      }
    }
  };

  this.createHandler = function (socket, data) {
    console.log ("DOC.CREATE from " + socket.id + " " + JSON.stringify (data));
    if (data.content === undefined) {
      return;
    }
    data.created_at = new Date ().toString ();
    db.insert(data, function (err, body) {
      if (!err) {
        db.get (body.id, function (err, res) {
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
    util.log("DOC.UPDATE from " + socket.id);
    if (data.id === undefined) {
      util.log("data id is undefined");
      return;
    }

    var i, editors;
    editors = docs[data.id].editors;

    if (data.type === "title") {
      docs[data.id].doc.title = data.value;
    }
    else if (data.type === "author") {
      docs[data.id].doc.author = data.value;
    }
    else if (data.type === "content") {
      var content = docs[data.id].doc.content;
      content = patcher.patch_apply (data.value, content)[0];
      docs[data.id].doc.content = content;
    }
    for (i = 0; i < editors.length; i++) {
      if (editors[i] === socket) { continue; }
      editors[i].emit (DOC.UPDATE, data);
    }
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
        util.log ("DOC.SAVE request from " + socket.id);
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

  this.chatHandler = function (socket, data) {
    util.log ("CHAT.MESSAGE from " + socket.id);
    //console.log (JSON.stringify (data));
    var id = data.id;
    if (docs[id] === undefined) { return; }
    var editors = docs[id].editors;
    for (var i = 0; i < editors.length; i++) {
      if (socket.id === editors[i].id) { continue; }
      editors[i].emit (CHAT.MESSAGE, data);
    }
  };

  this.revInfoHandler = function (socket, data) {
    var id = data.id;
    if (id === null || id === undefined) { return; }
    db.get (id, { revs_info : true }, function (err, res) {
      if (!err) {
        socket.emit (DOC.REV_INFO,  res._revs_info);
        util.log ("DOC.REV_INFO sent to " + socket.id);
      }
      else {
        util.error (err);
      }
    });
  };

  this.revDiffHandler = function (socket, data) {
    var id = data.id;
    if (id === null || id === undefined) { return; }
    if (data.old_rev === undefined || data.new_rev === undefined) { return; }
    db.get (id, { rev : data.old_rev }, function (err1, res1) {
      if (err1) { return; }
      db.get (id, { rev: data.new_rev }, function (err2, res2) {
        if (err2) { return; }
        var text1 = res1.content;
        var text2 = res2.content;
        var diffs = patcher.diff_main (text1, text2);
        patcher.diff_cleanupSemantic (diffs);
        var response = patcher.diff_prettyHtml (diffs);
        socket.emit (DOC.REV_DIFF, response);
        util.log ("DOC.REV_DIFF sent to " + socket.id);
      })
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

  socket.on (DOC.REV_INFO, function (data) {
    cote.revInfoHandler (socket, data);
  });

  socket.on (DOC.REV_DIFF, function (data) {
    cote.revDiffHandler (socket, data);
  });

  socket.on (CHAT.MESSAGE, function (data) {
    cote.chatHandler (socket, data);
  });

  socket.on ("disconnect", function () {
    cote.disconnectHandler(socket);
  });

});

