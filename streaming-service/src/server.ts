import net from 'net';
import { WebSocket, WebSocketServer } from 'ws';
import { addToLog } from './incident-log';

const TCP_PORT = parseInt(process.env.TCP_PORT || '12000', 10);

const tcpServer = net.createServer();
const websocketServer = new WebSocketServer({ port: 8080 });

tcpServer.on('connection', (socket) => {
	console.log('TCP client connected');
    
	socket.on('data', (msg) => {
		console.log(msg.toString());
		// HINT: what happens if the JSON in the received message is formatted incorrectly?
		// HINT: see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch
		try {
			const currJSON = JSON.parse(msg.toString());
			addToLog(currJSON);
			websocketServer.clients.forEach(function each(client) {
				if (client.readyState === WebSocket.OPEN) {
					client.send(msg.toString());
				}
			});
		} catch (err) {
			console.error('Unexpected token error');
			return err;
		}
	});
	socket.on('error', (err) => {
		console.log('TCP client error: ', err);
	});
	socket.on('end', () => {
		console.log('Closing connection with the TCP client');
	});
    
});

websocketServer.on('listening', () => console.log('Websocket server started'));

websocketServer.on('connection', async (ws: WebSocket) => {
	console.log('Frontend websocket client connected to websocket server');
	ws.on('error', console.error);  
});

tcpServer.listen(TCP_PORT, () => {
	console.log(`TCP server listening on port ${TCP_PORT}`);
});
