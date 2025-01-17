import { WebSocketServer, WebSocket } from 'ws';  
import http from 'http';

const server = http.createServer();
const wss = new WebSocketServer({ server });  
const clients = new Map();

wss.on('connection', (ws) => {
    console.log('New client connected');
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received message:', data);
            
            if (data.type === 'register') {
                const userId = data.userId.toString();
                clients.set(userId, ws);
                console.log(`Client registered with userId: ${userId}`);
                console.log('Current clients:', Array.from(clients.keys()));
            } else if (data.type === 'chat') {
                const recipientWs = clients.get(data.receiverId.toString());
                if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
                    recipientWs.send(JSON.stringify({
                        type: 'chat',
                        senderId: data.senderId,
                        message: data.message,
                        timestamp: new Date()
                    }));
                }
            }
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    });

    ws.on('close', () => {
        for (let [userId, client] of clients.entries()) {
            if (client === ws) {
                clients.delete(userId);
                console.log(`Client disconnected: ${userId}`);
                break;
            }
        }
    });
});

export function sendNotification(userId, notification) {
    const client = clients.get(userId.toString());
    console.log(`Attempting to send notification to user ${userId}`);
    console.log('Connected clients:', Array.from(clients.keys()));
    
    if (client && client.readyState === WebSocket.OPEN) {
        try {
            const payload = JSON.stringify({
                type: 'notification',
                data: notification
            });
            client.send(payload);
            console.log(`Notification sent successfully to user ${userId}`);
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    } else {
        console.log(`Client ${userId} not connected or not ready`);
    }
}

server.listen(3001, () => {
    console.log('WebSocket server running on port 3001');
});

export default wss;
