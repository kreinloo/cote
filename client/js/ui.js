/*

  ui.js

*/

var COTE = (function (C) {

  C.UI = function (doc) {

    "use strict";

    var _id = $("#doc-id");
    var _rev = $("#doc-rev");
    var _title = $("#doc-title");
    var _author = $("#doc-author");
    var _content = $("#doc-content");
    var _created_at = $("#doc-created_at");
    var _updated_at = $("#doc-updated_at");
    var _save_button = $("#btn-save");

    var _chat_input = $("#chat-input");
    var _chat_send = $("#chat-send");
    var _chat_clear_history = $("#chat-clear-history");

    var _doc = doc;
    var _caret_line = null;

    var self = this;

    this.setID = function (id) {
      _id.val (id);
    };

    this.setRev = function (rev) {
      _rev.val (rev);
    };

    this.setTitle = function (title) {
      _title.val (title);
    };

    this.setAuthor = function (author) {
      _author.val (author);
    };

    this.setContent = function (content) {
      var caret = _content.caret ();
      var substr1 = _content.val().substr (0, caret);
      var substr2 = content.substr (0, caret);
      if (substr1 === substr2) {
        //console.log("s1 eq s2");
        _content.val (content);
        _content.caret (caret);
      }
      else {
        var diff = _content.val().length - content.length;
        //console.log("diff: " + Math.abs(diff));
        _content.val (content);
        _content.caret (caret - diff);
      }

    };

    this.setCreatedAt = function (created_at) {
      _created_at.val (created_at);
    };

    this.setUpdatedAt = function (updated_at) {
      _updated_at.val (updated_at);
    };

    this.popupMessage = function (msg) {
      var msg_id = Math.random().toString().slice(2);
      $("html").append(
        $("<div>")
          .addClass("alert")
          .addClass("alert-success")
          .addClass("popup")
          .attr("id", msg_id)
          .append("<b>" + msg + "</b>")
      );
      setTimeout(function () { $("#" + msg_id).remove() }, 3000);
    };

    this.addChatMessage = function (data) {
      $(".chat-history").append(
        $("<p>")
          .addClass("chat-history-msg")
          .append("<i>" + new Date().toLocaleString().split(" ")[4] +
            "</i> <b>" + data.author + ": </b>" + data.msg)
      );
    $(".chat-history").scrollTop($(".chat-history").
      prop("scrollHeight"));
    };

    this.highlightLine = function () {
      var caret = _content.caret ();
      var slices = _content.val().split("\n");
      var count = 0;
      var i = 0;
      while (count <= caret) {
        if (slices[i] === "") {
          count += 1;
        }
        else {
          count += slices[i].length+1;
        }
        i++;
        if (slices[i] === undefined) { break; }
      }
      if (_caret_line != null) {
        _caret_line.toggleClass("selected-line");
        _caret_line.toggleClass("lineno");
      }
      _caret_line = $( $(".lineno")[i-1] );
      _caret_line.toggleClass("selected-line");
      _caret_line.toggleClass("lineno");
    };

    _author.keyup (function (e) {
      _doc.authorHandler (_author.val ());
    });

    _title.keyup (function (e) {
      _doc.titleHandler (_title.val ());
    });

    _content.keyup (function (e) {
      _doc.contentHandler (_content.val (), e);
      self.highlightLine ();
    });

    _save_button.click (function (e) {
      _doc.saveButtonHandler ();
    });

    _chat_input.keyup (function (e) {
      if (e.keyCode === 13 && _chat_input.val () !== "") {
        COTE.sendChatMessage (_chat_input.val ());
        _chat_input.val ("");
      }
    });

    _chat_send.click (function (e) {
      if (_chat_input.val () !== "") {
        COTE.sendChatMessage (_chat_input.val ());
        _chat_input.val ("");
      }
    });

    _chat_clear_history.click (function (e) {
      $(".chat-history").children().remove();
      self.popupMessage ("Chat history cleared!");
    });

  }

  return C;

}(COTE || {}));
