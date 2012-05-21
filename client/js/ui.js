/*

  ui.js

*/

function UI (doc) {

  "use strict";

  var _id = $("#doc-id");
  var _rev = $("#doc-rev");
  var _title = $("#doc-title");
  var _author = $("#doc-author");
  var _content = $("#doc-content");
  var _created_at = $("#doc-created_at");
  var _updated_at = $("#doc-updated_at");
  var _save_button = $("#btn-save");

  var _doc = doc;

  this.setID = function (id) {
    _id.val (id);
  };

  this.setRev = function (rev) {
    _rev.val (rev);
  };

  this.setTitle = function (title) {
    _title.val (title);
  }

  this.setAuthor = function (author) {
    _author.val (author);
  };

  this.setContent = function (content) {
    _content.val (content);
  };

  this.setCreatedAt = function (created_at) {
    _created_at.val (created_at);
  };

  this.setUpdatedAt = function (updated_at) {
    _updated_at.val (updated_at);
  };

  _author.keyup (function (e) {
    _doc.authorHandler (_author.val ());
  });

  _title.keyup (function (e) {
    _doc.titleHandler (_title.val ());
  });

  _content.keyup (function (e) {
    _doc.contentHandler (_content.val ());
  });

  _save_button.click (function (e) {
    _doc.saveButtonHandler ();
  });

}
