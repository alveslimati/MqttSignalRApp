const mqtt = require('mqtt');
const express = require('express');
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 3002;

// Criar o Servidor WebSocket
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
});

// Conectar ao broker MQTT
const client = mqtt.connect('mqtts://29232f271b9f47cb8d55000d4557bc0c.s1.eu.hivemq.cloud:8883', {
    username: 'ESP32',
    password: 'Eletron0101'
});

client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe('maquina/dados');
});

client.on('message', (topic, message) => {
    const data = message.toString();
    console.log(`Received message on ${topic}: ${data}`);
    // Enviar a mensagem para todos os clientes conectados via WebSocket
    wss.clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data);
        }
    });
});

// Inicialização do servidor HTTP
const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});