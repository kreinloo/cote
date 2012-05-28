/*

  document.js

*/

var COTE = (function (C) {


  C.Document = function () {

    "use strict";

    var _id
      , _rev
      , _title
      , _author
      , _content
      , _created_at
      , _updated_at;

    var _ui;
    var _is_saved = false;

    this.init = function (params) {
      _id         = params._id;
      _rev        = params._rev;
      _title      = params.title;
      _author     = params.author;
      _content    = params.content;
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

    this.contentHandler = function (data, e) {
      if (_content === data) { return; }
      if (COTE.docID === null) {
        _content = data;
        return;
      }
      var patches = COTE.patcher.patch_make (_content, data);
      _content = data;
      COTE.send (DOC.UPDATE, { type : "content", value : patches });
    };

    this.saveButtonHandler = function () {
      if (COTE.docID === null) {
        COTE.send (DOC.CREATE, {
          title : _title,
          author : _author,
          content : _content,
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
        var newContent = COTE.patcher.patch_apply (data.value, _content)[0];
        _content = newContent;
        _ui.setContent (newContent);
      }
    };

  }

  return C;

}(COTE || {}));
