const express = require('express');
const mongoose = require('mongoose');
// const path = require('path'); // БІЛЬШЕ НЕ ПОТРІБЕН для роздачі статики звідси
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors'); // Додайте бібліотеку CORS

const app = express();

// НАЛАШТУВАННЯ CORS
// Дозволяємо запити з вашого PHP-додатку (який працює на localhost, порт 80 за замовчуванням)
app.use(cors({ origin: 'http://localhost' })); // Будьте уважні з портом, якщо PHP працює не на 80

app.use(express.json());
// ВИДАЛІТЬ АБО ЗАКОМЕНТУЙТЕ ЦЕЙ РЯДОК:
// app.use(express.static(path.join(__dirname, 'public')));
// Apache/XAMPP буде обслуговувати клієнтські файли чату

// Підключення до MongoDB (ваш код без змін)
mongoose.connect('mongodb://127.0.0.1:27017/mydb')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Схема та модель Message (ваш код без змін)
const MessageSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    recipient: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

// API для отримання історії повідомлень (ваш код без змін)
// Доступ буде за http://localhost:NODE_JS_PORT/messages/:user1/:user2
app.get('/messages/:user1/:user2', async (req, res) => {
    try {
        const { user1, user2 } = req.params;
        const messages = await Message.find({
            $or: [
                { sender: user1, recipient: user2 },
                { sender: user2, recipient: user1 }
            ]
        }).sort({ timestamp: 1 }).limit(100);
        res.send(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).send(error);
    }
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Логіка WebSocket сервера (onlineUsers, broadcastUserList, wss.on('connection', ...))
// залишається без змін.
const onlineUsers = new Map();

function broadcastUserList() {
    const userList = Array.from(onlineUsers.keys());
    const message = JSON.stringify({ type: 'userList', users: userList });
    onlineUsers.forEach(clientWs => {
        if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(message);
        }
    });
    console.log("Broadcasted user list:", userList);
}

wss.on('connection', (ws) => {
    let currentUsername = null;
    // ... (решта вашої логіки wss.on('connection')) ...
    ws.on('message', async (message) => {
        console.log('Received message =>', message.toString());
        try {
            const parsedMessage = JSON.parse(message.toString());

            if (parsedMessage.type === 'register') {
                const username = parsedMessage.username;
                if (username && !onlineUsers.has(username)) {
                    currentUsername = username;
                    onlineUsers.set(currentUsername, ws);
                    console.log(`User registered: ${currentUsername}. Total online: ${onlineUsers.size}`);
                    ws.send(JSON.stringify({ type: 'registered', username: currentUsername }));
                    broadcastUserList();
                } else if (onlineUsers.has(username)) {
                    ws.send(JSON.stringify({ type: 'error', text: 'Цей нікнейм вже зайнятий.' }));
                    ws.close(); 
                } else {
                    ws.send(JSON.stringify({ type: 'error', text: 'Неправильне ім\'я користувача.' }));
                }
            } else if (parsedMessage.type === 'privateMessage' && currentUsername) {
                const { recipient, text } = parsedMessage;
                if (recipient && text) {
                    const newMessage = new Message({
                        sender: currentUsername,
                        recipient: recipient,
                        text: text
                    });
                    await newMessage.save();

                    const messageToSendToSender = {
                        type: 'privateMessage',
                        sender: currentUsername,
                        recipient: recipient,
                        text: newMessage.text,
                        timestamp: newMessage.timestamp
                    };
                    ws.send(JSON.stringify(messageToSendToSender));

                    const recipientWs = onlineUsers.get(recipient);
                    if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
                        const messageToSendToRecipient = {
                            type: 'privateMessage',
                            sender: currentUsername,
                            recipient: recipient,
                            text: newMessage.text,
                            timestamp: newMessage.timestamp
                        };
                        recipientWs.send(JSON.stringify(messageToSendToRecipient));
                    }
                    console.log(`Message from ${currentUsername} to ${recipient}: ${text}`);
                }
            }
        } catch (error) {
            console.error('Failed to process message or save to DB:', error);
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'error', text: 'Помилка обробки повідомлення.' }));
            }
        }
    });

    ws.on('close', () => {
        if (currentUsername) {
            onlineUsers.delete(currentUsername);
            console.log(`User disconnected: ${currentUsername}. Total online: ${onlineUsers.size}`);
            broadcastUserList();
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error for user', currentUsername, ':', error);
        if (currentUsername) {
            onlineUsers.delete(currentUsername);
            broadcastUserList();
        }
    });
});


const NODE_JS_PORT = 3001; // Оберіть порт, який не використовується Apache (наприклад, 80)
server.listen(NODE_JS_PORT, () => {
    console.log(`Node.js CHAT Server (nodefile.js) running on http://localhost:${NODE_JS_PORT}`);
    console.log(`Node.js CHAT WebSocket server running on ws://localhost:${NODE_JS_PORT}`);
});