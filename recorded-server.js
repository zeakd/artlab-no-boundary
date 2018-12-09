const server = require('http').createServer();
const io = require('socket.io')(server, {
	origins: "http://localhost:1234",
  serveClient: false,
  // below are engine.IO options
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});


const fs = require('fs')
var readline = require('readline');
var readStream = fs.createReadStream('record.txt');
var rl = readline.createInterface({
  input: readStream,
});



io.on('connection', (socket) => {
  const buf = fs.readFileSync('record.txt');
  // console.log(buf.toString())
  const recorded = buf.toString().split('\n');

  let i = 0;
  setInterval(() => {
    const arr = JSON.parse(recorded[i]);
    socket.emit('imageData', arr);
    i++;
  }, 10)
})


server.listen(4000);
