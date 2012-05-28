CLIENT = {
  CONNECT : "CLIENT_CONNECT",
  NAME    : "CLIENT_NAME",
};

CHAT = {
  MESSAGE : "CHAT_MESSAGE"
}

DOC = {
  INIT     : "DOC_INIT",
  CREATE   : "DOC_CREATE",
  UPDATE   : "DOC_UPDATE",
  SAVE     : "DOC_SAVE",
  REV_INFO : "DOC_REV_INFO",
  REV_DIFF : "DOC_REV_DIFF",

  ADD_LINE : "DOC_ADD_LINE",
  DEL_LINE : "DOC_ADD_LINE",
  MOD_LINE : "DOC_MOD_LINE"
};

if (typeof module !== "undefined") {
  module.exports.CLIENT = CLIENT;
  module.exports.CHAT = CHAT;
  module.exports.DOC = DOC;
}
