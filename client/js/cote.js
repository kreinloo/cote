/*

  cote.js

*/

var COTE = (function (C) {

  C.url  = "http://cote.ahju.eu";
  C.port = "8002";
  C.socket = null;
  C.docID = null;
  C.editorName = null;

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
      console.log ("recv: DOC.CREATE " + JSON.stringify (data));
      self.docID = data._id;
      self.saveDocParams (data._id);
      self.ui.popupMessage ("Document created!");
      self.doc.init (data);
    });

    C.socket.on (DOC.INIT, function (data) {
      console.log ("recv: DOC.INIT " + JSON.stringify (data));
      self.doc.init (data);
    });

    C.socket.on (DOC.UPDATE, function (data) {
      console.log ("recv: DOC.UPDATE " + JSON.stringify (data));
      self.doc.serverUpdate (data);
    });

    C.socket.on (DOC.SAVE, function (data) {
      console.log ("recv: DOC.SAVE " + JSON.stringify (data));
      self.ui.popupMessage ("Document saved!");
      self.ui.setUpdatedAt ( data.timestamp );
    });

    C.socket.on (CLIENT.NAME, function (data) {
      console.log ("recv: " + CLIENT.NAME + " " + data);
      self.editorName = data;
    });

    C.socket.on (CHAT.MESSAGE, function (data) {
      console.log ("recv: " + CHAT.MESSAGE + " " + data);
      self.ui.addChatMessage (data);
    });

  };

  C.init = function () {
    var params = C.getDocParams();
    console.log("connecting to server ...");
    C.connect(params);
    if (params !== null) {
      C.docID = params.id;
    }
  };

  C.send = function (ev, data) {
    if (C.socket !== undefined && C.docID !== null) {
      data.id = C.docID;
      C.socket.emit (ev, data);
      console.log ("sent:" + JSON.stringify (data));
    } else {
      if (ev === DOC.CREATE) {
        C.socket.emit (ev, data);
        console.log ("sent: DOC.CREATE " + JSON.stringify(data));
      }
    }
  };

  C.sendChatMessage = function (data) {
    C.send (CHAT.MESSAGE, { author : C.editorName, msg : data });
    C.ui.addChatMessage ({ author : C.editorName, msg : data });
  }

  C.patcher = new diff_match_patch ();

  return C;

}(COTE || {}));

$(document).ready(function () {

  $("#doc-content").tabby();
  $("#doc-content").linedtextarea ();

  COTE.doc = new COTE.Document ();
  COTE.ui = new COTE.UI (COTE.doc);
  COTE.doc.setUI (COTE.ui);
  COTE.init();

});
