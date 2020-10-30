// This is the server file which will enable the running of the server

const http = require("http");
const app = require("./app");

const port = process.env.port || 4000;

const server = http.createServer(app);
console.log(port)

server.listen(port);