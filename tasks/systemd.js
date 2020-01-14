module.exports = function(grunt) {
  var os = require("os");
  var path = require("path");

  grunt.registerTask("systemd", "Generate a valid systemd service file", function() {

    var template = grunt.file.read("tasks/lib/liveblog.service.template");
    var env = {
      GOOGLE_OAUTH_CLIENT_ID: null,
      GOOGLE_OAUTH_CONSUMER_SECRET: null,
      NODE_VERSION: 12
    }
    for (var v in env) {
      if (env[v] === null) {
        env[v] = process.env[v];
      }
    }

    var home = os.homedir();
    var here = process.cwd();

    template = template.replace(/%HOME%/g, home);
    template = template.replace(/%HERE%/g, home);
    var envString = Object.keys(env).map(k => `Environment=${k}="${env[k]}"`).join("\n");
    template = template.replace("%ENV%", envString);

    grunt.file.write("liveblog.service", template);

  });
};