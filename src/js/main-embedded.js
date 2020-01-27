require("./liveblog");
var events = require("./events");

var Sidechain = require("@nprapps/sidechain");

var guest = Sidechain.registerGuest({
  sentinel: "npr-liveblog"
});

events.on("unseen-posts", function(unseen) {
  // update the host page
  guest.sendMessage({ unseen });
  // update Pym parents
  // the loader keeps a running total, which is dumb, so we send two
  guest.sendLegacy("update-parent-title", 0);
  guest.sendLegacy("update-parent-title", unseen);
});