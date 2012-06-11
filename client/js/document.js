/*

  document.js

*/

var COTE = (function (C) {

  "use strict";

  C.Document = function () {

    var _id
      , _rev
      , _title
      , _author
      , _content
      , _created_at
      , _updated_at;

    var _ui;
    var _is_saved = false;

    var _content2 = [];
    var _old_content = null;

    var _temp_diffs = null;

    this.init = function (params) {
      _id         = params._id;
      _rev        = params._rev;
      _title      = params.title;
      _author     = params.author;
      _content    = params.content;
      _old_content = params.content;
      _created_at = params.created_at;
      _updated_at = params.updated_at;

      _ui.setID (_id);
      //_ui.setRev (_rev);
      _ui.setTitle (_title);
      _ui.setAuthor (_author);
      _ui.setContent (_content);
      _ui.setCreatedAt (_created_at);
      _ui.setUpdatedAt (_updated_at);

      _is_saved = true;
    };

    this.authorHandler = function (data) {
      _author = data;
      COTE.send (DOC.UPDATE, { type: "author", value : data });
    };

    this.titleHandler = function (data) {
      _title = data;
      COTE.send (DOC.UPDATE, { type: "title", value : data });
    };

    this.contentHandler = function () {
      var data = _ui.getContent ();
      if (_old_content === data) { return; }
      if (COTE.docID === null) {
        _old_content = data;
        return;
      }
      var patches = COTE.patcher.patch_make (_old_content, data);
      _old_content = data;

      if (_temp_diffs !== null) {
        COTE.send (DOC.UPDATE, { type : "content", value : _temp_diffs });
        _temp_diffs = null;
      }
      COTE.send (DOC.UPDATE, { type : "content", value : patches });
    };

    this.saveButtonHandler = function () {
      if (COTE.docID === null) {
        COTE.send (DOC.CREATE, {
          title : _title,
          author : _author,
          content : _content
        });
      } else {
        COTE.send (DOC.SAVE, { id : _id });
      }
    };

    this.setUI = function (ui) {
      _ui = ui;
    };

    this.serverUpdate = function (data) {
      if (data.type === "title") {
        _ui.setTitle (data.value);
      }
      else if (data.type === "author") {
        _ui.setAuthor (data.value);
      }
      else if (data.type === "content") {

        var content = _ui.getContent ();
        if (_old_content !== content) {
          _temp_diffs = COTE.patcher.patch_make (_old_content, content);
          console.log("\nmaking temp diffs!\n");
        }
        else {
          _temp_diffs = null;
        }

        var newContent = COTE.patcher.patch_apply (data.value, _ui.getContent ())[0];
        _content = newContent;
        _ui.setContent (newContent);
        _old_content = _content;
      }
    };

    this.contentHandler2 = function (data, e) {
      /*
      var i;
      var content2 = data.split ("\n");
      var len = content2.length > _content2.length ?
        content2.length : _content2.length;
      if (e.keyCode === 13 && _content2.length !== content2.length) {
        for (i = 0; i < len; i++) {
          if (_content2[i] !== content2[i] && content2[i] === "" &&
              _content2[i] === content2[i+1]) {
            console.log ("new line: " + i);
            break;
          }
        }
      }

      else if (e.keyCode === 8 && _content2.length !== content2.length) {
        for (i = 0; i < len; i++) {

        }
      }
      _content2 = content2;
      */
    };

    this.getCommentByRowId = function (row_id) {
      // TODO
      return null;
    };

  };

  return C;

}(COTE || {}));
