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
      _id         = params.id;
      _rev        = params.rev;
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
    };

    this.authorHandler = function (data) {
      console.log ("new auther: " + data);
      COTE.send (DOC.AUTHOR, data);
      _author = data;
    };

    this.titleHandler = function (data) {
      console.log ("new title: " + data);
      COTE.send (DOC.TITLE, data);
      _title = data;
    };

    this.contentHandler = function (data) {
      var content = data.split ("\n");

      var len = _content.length > content.length ?
        _content.length : content.length;

      for (var i = 0; i < len; i++) {
        if (_content[i] !== content[i]) {

          if (content[i] !== undefined) {
            _content[i] = content[i];
            console.log("line (" + i + "): " + _content[i]);
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
          created_at : new Date ()
        });
        console.log ("created new document");
      } else {
        COTE.send (DOC.SAVE, {});
        console.log ("request document save");
      }
    }

    this.setUI = function (ui) {
      _ui = ui;
    }

  }

  return C;

}(COTE || {}));
