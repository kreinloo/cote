/*

  document.js

*/
function Document () {

  "use strict";

  var _id
    , _rev
    , _title
    , _author
    , _content
    , _created_at
    , _updated_at;

  var _ui;

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
    console.log ("author handler called");
  };

  this.titleHandler = function (data) {
    console.log ("title handler called");
  };

  this.contentHandler = function (data) {
    var content = data.split ("\n");

    var len = _content.length > content.length ? _content.length : content.length;
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
    console.log ("save button handler called");
  }

  this.setUI = function (ui) {
    _ui = ui;
  }

}
