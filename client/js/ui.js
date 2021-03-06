/*

  ui.js

*/

var COTE = (function (C) {

  "use strict";

  C.UI = function (doc) {

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
    var _rev_history = $("#doc-rev-history");

    var _doc = doc;
    var _caret_line = null;
    var _ctrl_down = false;

    var _rev_dialog_base = null;
    var _change_nick_base = null;
    var _row_comment_base = null;

    var _interval_id = null;
    var _keyCode = null;
    var _is_focused = false;

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
        _content.val (content);
        if (_is_focused) {
          _content.caret (caret);
        }
      }
      else {
        var diff = _content.val().length - content.length;
        _content.val (content);
        if (_is_focused) {
          _content.caret (caret - diff);
        }
      }
      self.highlightLine ();
    };

    this.getContent = function () {
      return _content.val ();
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
      setTimeout(function () {
        $("#" + msg_id).fadeOut (1500, function () {
          $("#" + msg_id).remove();
        });
      }, 2000);
    };

    this.addChatMessage = function (data) {
      var msg = $("<p>")
        .addClass("chat-history-msg")
        .append("<i>" + new Date().toLocaleString().split(" ")[4] +
          "</i> <b>" + data.author + ": </b>" + data.msg);
      msg.hide ();
      $(".chat-history").append(msg);
      msg.fadeIn (500, function () {
        $(".chat-history").scrollTop($(".chat-history").
          prop("scrollHeight"));
      });
    };

    this.highlightLine = function () {
      if (!_is_focused) { return; }
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
      if (_caret_line !== null) {
        _caret_line.toggleClass("selected-line");
        _caret_line.toggleClass("lineno");
      }
      _caret_line = $( $(".lineno")[i-1] );
      _caret_line.toggleClass("selected-line");
      _caret_line.toggleClass("lineno");
    };

    this.revisionDialog = function (revs) {
      var div = _rev_dialog_base;
      div.dialog ({
        title : "Revision history",
        height : 500,
        width : 700,
        resizable : false,
        modal : true,
        close : function () {
          $("#dialog-header").children().remove();
          $("#dialog-select-old").children().remove();
          $("#dialog-select-new").children().remove();
          $("#dialog-diff").children().remove();
          $("#dialog-btn-compare").off ("click");
        }
      });

      $("#dialog-header").append (
        "<p>Revision history for document <b>" + COTE.docID +"</b></p>"
      );
      for (var i = 0; i < revs.length; i++) {
        $("#dialog-select-old").append(
          $("<option>").append(revs[i])
        );
        $("#dialog-select-new").append(
          $("<option>").append(revs[i])
        );
      }
      $("#dialog-btn-compare").click (function () {
        var old_rev = $("#dialog-select-old option:selected").val();
        var new_rev = $("#dialog-select-new option:selected").val();
        COTE.compareButtonHandler ({old_rev : old_rev, new_rev : new_rev});
      });
    };

    this.displayDiff = function (data) {
      $("#dialog-diff").children().remove();
      $("#dialog-diff").append (data);
    };

    _author.keyup (function (e) {
      _doc.authorHandler (_author.val ());
    });

    _title.keyup (function (e) {
      _doc.titleHandler (_title.val ());
    });

    _content.keyup (function (e) {
      if (e.keyCode === 17) { _ctrl_down = false; }
      _doc.contentHandler ();
      self.highlightLine ();
      return false;
    });

    _content.keydown (function (e) {
      if (e.keyCode === 17) { _ctrl_down = true; }
      else if (e.keyCode === 83 && _ctrl_down) {
        _doc.saveButtonHandler ();
        e.preventDefault ();
        return;
      }
      _doc.contentHandler ();
    });

    _content.click (function () {
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
      var msg = $.trim (_chat_input.val ());
      if (msg !== "") {
        COTE.sendChatMessage (msg);
      }
      _chat_input.val ("");
    });

    _chat_clear_history.click (function (e) {
      $(".chat-history").children().remove();
      self.popupMessage ("Chat history cleared!");
    });

    _rev_history.click (function (e) {
      COTE.revisionHandler ();
    });

    _content.focusin (function (e) {
      _is_focused = true;
    });

    _content.focusout (function (e) {
      _is_focused = false;
    })

    $("#chat-change-nick").click (function (e) {
      var div = _change_nick_base;
      div.dialog({
        title : "Change nick",
        width : 400,
        height : 250,
        resizable : false,
        modal : true,
        buttons : [
          {
            text : "OK",
            click : function () {
              var name = $.trim ($("#change-nick-value").val ());
              if (name !== "") {
                COTE.changeEditorName (name);
                $("#change-nick-value").val ("");
                $("#chat-nick").text (name);
                $(this).dialog ("close");
              }
            }
          },
          {
            text : "Cancel",
            click : function () {
              $(this).dialog ("close");
              $("#change-nick-value").val ("");
            }
          }
        ]
      });
    });

    this.loadDialogBases = function () {
      $.get ("/dialog.html", function (data) {
        _rev_dialog_base = $(data);
      });
      $.get ("/change_nick.html", function (data) {
        _change_nick_base = $(data);
      });
      $.get ("/row_comment.html", function (data) {
        _row_comment_base = $(data);
      });
    }();

    this.showCommentDialog = function (row_id, rowComment) {
      var div = _row_comment_base;
      div.dialog({
        title : "Row comment",
        width : 500,
        height : 330,
        resizable : false,
        modal : true,
        close : function () {
        }
      });
      $("#dialog-header").text("");
      $("#dialog-header")
        .append("Add / edit comment for row <b>#" + row_id + "</b>.");
      if (rowComment !== null) { $("#row-comment").val (rowComment); }
      $("#comment-btn-cancel").click (function () { div.dialog ("close"); });
    };

    this.setEditorName = function (name) {
      $("#chat-nick").text (name);
    };

  };

  return C;

}(COTE || {}));
