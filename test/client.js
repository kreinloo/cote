var ioclient = require ("socket.io-client");
var gdiff = require ("googlediff");
var events = require("../client/js/events.js");
var io = ioclient.connect ("http://localhost:8002");

var docID = "bed10df5655b4c0fdb32bd2b870001e2";
var patcher = new gdiff ();

io.emit (CLIENT.CONNECT, { id : docID });

var content;

io.on (DOC.INIT, function (data) {
  content = data.content;
  console.log (content);
});

io.on (DOC.UPDATE, function (data) {
  console.log("recv: DOC.UPDATE");
  if (data.type === "content") {
    var newContent = patcher.patch_apply (data.value, content)[0];
    content = newContent;
    console.log (content);
  }
});

setInterval (function () {

  if (content === undefined) { return; }
  var cntnt = content.split ("\n");
  if (cntnt[0] === undefined) {
    cntnt[0] = "foo ";
  }
  else { cntnt[0] = cntnt[0] + "f" };
  cntnt = cntnt.join ("\n");
  var patches = patcher.patch_make (content, cntnt);
  content = cntnt;
  io.emit (DOC.UPDATE, { type : "content", value : patches, id : docID });

}, 500);
