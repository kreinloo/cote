/*

  cote.js

*/

var COTE = (function (C) {

  "use strict";

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
      //console.log ("recv: DOC.CREATE " + JSON.stringify (data));
      self.docID = data._id;
      self.saveDocParams (data._id);
      self.ui.popupMessage ("Document created!");
      self.doc.init (data);
    });

    C.socket.on (DOC.INIT, function (data) {
      //console.log ("recv: DOC.INIT " + JSON.stringify (data));
      self.doc.init (data);
    });

    C.socket.on (DOC.UPDATE, function (data) {
      //console.log ("recv: DOC.UPDATE " + JSON.stringify (data));
      self.doc.serverUpdate (data);
    });

    C.socket.on (DOC.SAVE, function (data) {
      //console.log ("recv: DOC.SAVE " + JSON.stringify (data));
      self.ui.popupMessage ("Document saved!");
      self.ui.setUpdatedAt (data.timestamp);
    });

    C.socket.on (CLIENT.NAME, function (data) {
      //console.log ("recv: " + CLIENT.NAME + " " + data);
      self.editorName = data;
      self.ui.setEditorName (data);
    });

    C.socket.on (CHAT.MESSAGE, function (data) {
      //console.log ("recv: " + CHAT.MESSAGE + " " + JSON.stringify (data));
      self.ui.addChatMessage (data);
    });

    C.socket.on (DOC.REV_INFO, function (data) {
      //console.log ("recv: " + DOC.REV_INFO + " " + JSON.stringify (data));
      self.revisionResponseHandler (data);
    });

    C.socket.on (DOC.REV_DIFF, function (data) {
      //console.log ("recv: " + DOC.REV_DIFF + " " + JSON.stringify (data));
      self.revDiffResponseHandler (data);
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
        //console.log ("sent: DOC.CREATE " + JSON.stringify(data));
      }
    }
  };

  C.sendChatMessage = function (data) {
    C.send (CHAT.MESSAGE, { author : C.editorName, msg : data });
    C.ui.addChatMessage ({ author : C.editorName, msg : data });
  };

  C.revisionHandler = function () {
    if (C.docID === null) { return; }
    C.requestRevInfo ();
  };

  C.requestRevInfo = function () {
    if (C.docID === null) { return; }
    C.send (DOC.REV_INFO, {});
  };

  C.revisionResponseHandler = function (data) {
    var revisions = data;
    var options = [];
    for (var r in revisions) {
      options.push (revisions[r].rev);
    }
    console.log (options);
    C.ui.revisionDialog (options);
  };

  C.compareButtonHandler = function (revs) {
    C.send (DOC.REV_DIFF, revs);
  };

  C.revDiffResponseHandler = function (data) {
    C.ui.displayDiff (data);
  };

  C.changeEditorName = function (name) {
    C.editorName = name;
    C.ui.popupMessage ("Your name is now " + name);
  };

  C.rowCommentHandler = function (row_id) {
    var rowComment = C.doc.getCommentByRowId (row_id);
    C.ui.showCommentDialog (row_id, rowComment);
  };

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
