CLIENT = {
  CONNECT : 0x00006,
  NAME    : "CLIENT_NAME",
};

CHAT = {
  MESSAGE : "CHAT_MESSAGE"
}

DOC = {
  INIT   : 0x00008,
  CREATE : 0x00001,
  UPDATE : 0x00002,
  DELETE : 0x00003,
  SAVE   : 0x00004,
  OPEN   : 0x00005,
  AUTHOR : 0x00007,
};

if (typeof module !== "undefined") {
  module.exports.CLIENT = CLIENT;
  module.exports.CHAT = CHAT;
  module.exports.DOC = DOC;
}
