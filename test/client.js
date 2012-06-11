var ioclient = require ("socket.io-client");
var gdiff = require ("googlediff");
var events = require("../client/js/events.js");
var io = ioclient.connect ("http://localhost:8002");

var docID = "bed10df5655b4c0fdb32bd2b870001e2";
var patcher = new gdiff ();

io.emit (CLIENT.CONNECT, { id : docID });

var content;
var editorRow = parseInt(process.argv[2]);
console.log ("Editor no: " + editorRow);

var letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

io.on (DOC.INIT, function (data) {
  content = data.content;
});

io.on (DOC.UPDATE, function (data) {
  //console.log("recv: DOC.UPDATE");
  if (data.type === "content") {
    var newContent = patcher.patch_apply (data.value, content)[0];
    content = newContent;
  }
});

setInterval (function () {

  if (content === undefined) { return; }
  var cntnt = content.split ("\n");
  if (cntnt[editorRow] === undefined) {
    cntnt[editorRow] = letters[editorRow];
  }
  else { cntnt[editorRow] = cntnt[editorRow] + letters[editorRow] };
  cntnt = cntnt.join ("\n");
  var patches = patcher.patch_make (content, cntnt);
  content = cntnt;
  io.emit (DOC.UPDATE, { type : "content", value : patches, id : docID });

}, 500 + (Math.random () * 500));
