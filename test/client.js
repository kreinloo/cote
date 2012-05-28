var io_lib = require ("socket.io-client");
var events = require("../client/js/events.js");
var io = io_lib.connect ("http://localhost:8002");

var docID = "828cc04c1dacbdf7323bdb7043000e9c";

io.emit (CLIENT.CONNECT, { id : docID });

var content;

io.on (DOC.INIT, function (data) {
  var res = JSON.stringify (data);
  content = res.content;
  console.log (JSON.stringify (data));
});

setInterval (function () {

  io.emit (CHAT.MESSAGE, {
    author : "bot",
    msg : new Date().toLocaleString(),
    id : docID
  });

}, 500);
