const path = require("path");

module.exports = {
  apps: [
    {
      name: "minrosh-next",
      cwd: path.join(__dirname, ".next", "standalone"),
      script: "server.js",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};
