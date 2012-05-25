/*

  cote.js

*/

var COTE = (function (C) {

  C.url  = "http://cote.ahju.eu";
  C.port = "8002";
  C.socket = null;
  C.doc = null;

  C.getDocParams = function () {
    var hash = window.location.hash;
    if (!hash) {
      return null;
    }
    else {
      var docID;
      var attrs = hash.split("#");
      if (attrs[1]) {
        docID = attrs[1];
      }
      return { id : docID };
    }
    return null;
  };

  C.saveDocParams = function (id) {
    window.location.hash = id;
  };

  C.connect = function (args) {
    if (window.location.host !== "localhost") {
      C.socket = io.connect(C.url + ":" + C.port);
    } else {
      C.socket = io.connect("http://localhost" + ":" + C.port);
    }
    C.addListeners();
    C.socket.emit(CLIENT.CONNECT, args);
  };

  C.addListeners = function () {
    var self = C;

    C.socket.on (DOC.CREATE, function (data) {
      console.log ("recv: DOC.CREATE" + JSON.stringify (data));
      self.doc = data.id;
      self.saveDocParams (data.id);
    });

    C.socket.on (DOC.UPDATE, function (data) {
      //self.updateHandler(data);
    });

    C.socket.on (DOC.SAVE, function (data) {
      //self.saveHandler(data);
    });
  };

  C.createDoc = function (data) {
    C.socket.emit (DOC.CREATE, data);
  };

  C.init = function () {
    var params = C.getDocParams();
    console.log("connecting to server ...");
    C.connect(params);
    if (params !== null) {
      C.doc = params.id;
    }
  };

  C.send = function (ev, data) {
    if (C.socket !== undefined && C.doc !== null) {
      C.socket.emit (ev, data);
      console.log ("sent: " + ev + " " + data);
    } else {
      if (ev === DOC.CREATE) {
        C.socket.emit (ev, data);
        console.log ("sent: DOC.CREATE " + JSON.stringify(data));
      }
    }
  };

/*
    saveHandler : function (data) {
      var msg_id = Math.random().toString().slice(2);
      $(".msg-area").append(
        $("<div>")
          .addClass("alert")
          .addClass("alert-success")
          .attr("id", msg_id)
          .append("<b>Document saved!</b>")
      );
      setTimeout(function () { $("#" + msg_id).remove() }, 3000);
    }
*/

  return C;

}(COTE || {}));

$(document).ready(function () {

  $("#doc-content").tabby();
  $("#doc-content").linedtextarea ();

  var doc = new COTE.Document ();
  var ui = new COTE.UI (doc);
  doc.setUI (ui);
  COTE.init();

});
