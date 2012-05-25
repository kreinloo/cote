  var cote = {

    url : "http://localhost",
    port : "8002",
    socket : null,
    doc : null,

    getDocParams : function () {
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
    },

    saveDocParams : function (id) {
      window.location.hash = id;
    },

    connect : function (args) {
      this.socket = io.connect(this.url + ":" + this.port);
      this.addListeners();
      this.socket.emit(CLIENT.CONNECT, args);
    },

    addListeners : function () {
      var self = this;

      this.socket.on (DOC.CREATE, function (data) {
        if (data.id !== undefined) {
          self.doc = data.id;
          self.saveDocParams(data.id);
        }
      });

      this.socket.on (DOC.UPDATE, function (data) {
        self.updateHandler(data);
      });
  /*
      this.socket.on (DOC.DELETE, function (data) {
        console.log(data);
      });
  */
      this.socket.on (DOC.SAVE, function (data) {
        self.saveHandler(data);
      });
    },

    createDoc : function (data) {
      this.socket.emit (DOC.CREATE, data);
    },

    init : function () {
      var params = this.getDocParams();
      console.log("connecting to server ...");
      this.connect(params);
      if (params !== null) {
        this.doc = params.id;
      }
    },

    saveButtonHandler : function (title, body) {
      if (this.doc === null) {
        this.socket.emit(DOC.CREATE, {
          title : title,
          body : body
        });
      }
      else {
        this.socket.emit(DOC.SAVE, {
          id : this.doc,
          title : title,
          body : body
        });
      }
    },

    keyEventHandler : function () {
      if (this.doc !== null) {
        this.socket.emit(DOC.UPDATE, {
          id : this.doc,
          title : $("#doc-title").val(),
          body : $("#doc-content").val()
        });
      }
    },

    updateHandler : function (data) {
      if (data.title !== undefined) {
        $("#doc-title").val(data.title);
      }
      if (data.body !== undefined) {
        var caretPos = $("#doc-content").caret();
        $("#doc-content").val(data.body);
        $("#doc-content").caret(caretPos);
      }
    },

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

  };

$(document).ready(function () {

  $("#doc-content").tabby();
  $("#btn-save").click(function () {
    cote.saveButtonHandler($("#doc-title").val(), $("#doc-content").val());
  });
  $("#doc-content").keyup(function () {
    cote.keyEventHandler()
  });
  cote.init();

  var doc = new Document ();
  var ui = new UI (doc);
  doc.setUI (ui);

});
