CLIENT = {
	CONNECT : 0x00006
};

DOC = {
	CREATE : 0x00001,
	UPDATE : 0x00002,
	DELETE : 0x00003,
	SAVE   : 0x00004,
	OPEN   : 0x00005
};

if (typeof module !== "undefined") {
	module.exports.DOC = DOC;
}