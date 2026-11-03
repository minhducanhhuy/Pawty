// Vercel Serverless Function entry point for Pawty API Gateway
const { server } = require('../server/dist/server/src/main.js');

module.exports = (req, res) => {
  server.emit('request', req, res);
};

