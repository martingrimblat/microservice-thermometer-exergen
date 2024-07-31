require('dotenv').config()

const WebSocketServer = require('ws').Server;
const { processData } = require('./core');
const logger = require('./logger')
const port = process.env.PORT
const wss = new WebSocketServer({ port : port });

const start = (port) => {
    wss.on('connection', (ws) => {
        logger.log('WebSocket connected');
        port.on('data', data => {
            processData(data)
        });
    
        ws.on('error', err => {
            console.error('WebSocket error:', err.message);
        });
    
        ws.on('close', () => {
            console.log('WebSocket closed');
        });
    });
}

module.exports = {start}