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
    //console.log ("content handler called");
    var content = data.split ("\n");

    if (_content)

    if (_content.length !== content.length) {
      console.log ("we have changes " + _content.length + " " + content.length);
    }
    _content = content;

  };

  this.saveButtonHandler = function () {
    console.log ("save button handler called");
  }

  this.setUI = function (ui) {
    _ui = ui;
  }

}
