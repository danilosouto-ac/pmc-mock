const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { PubSub } = require('@google-cloud/pubsub');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;
const PROJECT_ID = process.env.GCP_PROJECT_ID || 'datalake-pmc-smart';
const SUBSCRIPTIONS = ['monitor-motivo', 'monitor-criticidade'];

const pubsub = new PubSub({ projectId: PROJECT_ID });

// Store messages in memory (last 50)
let messageHistory = [];

async function listenToMessages() {
    if (process.env.MOCK === 'true') {
        console.log('Running in MOCK mode...');
        setInterval(() => {
            const subName = SUBSCRIPTIONS[Math.floor(Math.random() * SUBSCRIPTIONS.length)];
            const isMotivo = subName === 'monitor-motivo';
            const data = {
                id: Date.now().toString(),
                topic: subName,
                timestamp: new Date().toISOString(),
                content: JSON.stringify({
                    imagem: `img_${Math.floor(Math.random() * 2000)}_${Math.floor(Math.random() * 1000)}.jpg`,
                    latitude: -23.54561,
                    longitude: -46.64023,
                    local: "UPA - Boqueirão",
                    camera: `CAM-00${Math.floor(Math.random() * 9) + 1}`,
                    horario: new Date().toISOString(),
                    nome: ["Adriana Monteiro", "Carlos Silva", "Beatriz Lima", "Davi Souza"][Math.floor(Math.random() * 4)],
                    ...(isMotivo
                        ? { motivo: ["Investigação em andamento", "Pessoa desaparecida", "Acesso não autorizado"][Math.floor(Math.random() * 3)] }
                        : { criticidade: Math.floor(Math.random() * 4) + 1 }
                    )
                }),
                metadata: {
                    source: 'facial-recognition-input'
                }
            };

            console.log(`[MOCK] Emitting message from ${subName}`);
            io.emit('new-message', data);
            messageHistory.push(data);
            if (messageHistory.length > 50) messageHistory.shift();
        }, 5000);
        return;
    }

    console.log(`Setting up Pub/Sub listeners for project: ${PROJECT_ID}`);

    for (const subscriptionName of SUBSCRIPTIONS) {
        try {
            const subscription = pubsub.subscription(subscriptionName);

            subscription.on('message', message => {
                console.log(`Received message from subscription ${subscriptionName}: ${message.id}`);
                const data = {
                    id: message.id,
                    topic: subscriptionName,
                    timestamp: message.publishTime ? new Date(message.publishTime).toISOString() : new Date().toISOString(),
                    content: message.data.toString(),
                    attributes: message.attributes
                };

                io.emit('new-message', data);
                messageHistory.push(data);
                if (messageHistory.length > 50) messageHistory.shift();

                message.ack();
            });

            subscription.on('error', error => {
                console.error(`Error on subscription ${subscriptionName}:`, error);
            });

            console.log(`Listening to subscription: ${subscriptionName}`);
        } catch (err) {
            console.error(`Failed to connect to subscription ${subscriptionName}:`, err.message);
        }
    }
}

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.emit('history', messageHistory);
});

server.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    listenToMessages().catch(console.error);
});
