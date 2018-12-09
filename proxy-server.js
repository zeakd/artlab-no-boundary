
const fs = require('fs')
const net = require('net');
const client = new net.Socket();

function connect(client, port) {
	return new Promise(resolve => client.connect(port, '127.0.0.1', () => {
		console.log('Connected with the Processing server');
	}))
}

connect(client, 5204);

client.on('data', function(data) {
	const buf = new Buffer(data)
	const str = buf.toString();

	if (str[0] === '[' && str[str.length - 1] === ']') {
		const arr = JSON.parse(str);
		io.sockets.emit('imageData', arr);
		// wstream.write(str + '\n');
	} else {
		if (str[0] === '[') {
			accumulator = ''
		}
	
		accumulator += str;
		
		if (str[str.length - 1] === ']') {
			const arr = JSON.parse(accumulator);
			socket.emit('imageData', arr);
		}
	}
}); 

const internalIp = require('internal-ip')
const server = require('http').createServer();
const io = require('socket.io')(server, {
	origins: [`http://${internalIp.v4.sync()}:1234`],
  serveClient: false,
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});

io.on('connection', (socket) => {
	console.log('client connected');
})

server.listen(4000);


// let accumulator = '';
// let parsing = true;






// io.origins((origin, callback) => {
//   callback(null, true);
// });
	

// 	var client = new net.Socket();
// 	client.connect(5204, '127.0.0.1', function() {
// 		console.log('Connected');
// 		client.write('Hello, server! Love, Client.');
// 	});

// 	client.on('data', function(data) {
// 		// const buf = new Buffer(data)
// 		console.log('Received: ' + data);
// 		// client.destroy(); // kill client after server's response
// 		socket.emit('imageData', data);
// 	}); 

// });



