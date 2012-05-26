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

    _content = [];

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
      _ui.setContent (_content.join("\n"));
      _ui.setCreatedAt (_created_at);
      _ui.setUpdatedAt (_updated_at);

      _is_saved = true;
    };

    this.authorHandler = function (data) {
      console.log ("new auther: " + data);
      _author = data;
      COTE.send (DOC.UPDATE, { type: "author", value : data });
    };

    this.titleHandler = function (data) {
      console.log ("new title: " + data);
      _title = data;
      COTE.send (DOC.UPDATE, { type: "title", value : data });
    };

    this.contentHandler = function (data, e) {

      var content = data.split ("\n");

      var len = _content.length > content.length ?
        _content.length : content.length;

      if (e.keyCode === 8 && _content.length !== content.length) {
        for (var i = 0; i < len; i++) {
          if (_content[i] !== content[i] && _content[i+1] === content[i]) {
            console.log ("del line " + i);
            _content.splice (i, 1);
            console.log ("_content: " + _content);
            return;
          }
        }
      }
      else if (e.keyCode === 13 && _content.length < content.length) {
        for (var i = 0; i < len; i++) {
          if (_content[i] !== "" && content[i] === "") {
            console.log ("new line: " + i);
          }
        }
      }

      for (var i = 0; i < len; i++) {
        if (_content[i] !== content[i]) {

          if (content[i] !== undefined) {
            _content[i] = content[i];
            console.log("line " + i + ": " + _content[i]);
          }
          else {
            _content.splice (i, 1);
            console.log("deleted line " + i);
            console.log (_content);
          }
        }
      }

    };

    this.saveButtonHandler = function () {
      if (!_is_saved) {
        COTE.send (DOC.CREATE, {
          title : _title,
          author : _author,
          content : _content,
        });
        _is_saved = true;
      } else {
        COTE.send (DOC.SAVE, { id : _id });
      }
    };

    this.setUI = function (ui) {
      _ui = ui;
    };

    this.serverUpdate = function (data) {

    };

  }

  return C;

}(COTE || {}));
