#!/usr/bin/env node

require('dotenv').config()
const SerialPort = require('serialport');
const ws = require('./core')
const logger = require('./logger');
const RECONNECT_TIMEOUT = 5000;
const options = {
    temp_device: process.env.TEMP_DEVICE
};
const connect = () =>{
    const port = new SerialPort(options.temp_device, {
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        autoOpen: false
    });
    port.open(err => {
        if (err) {
            console.error('Error opening port:', err.message);
            reconnect();
            
        }
        else{
            console.log('Serial port opened');
            logger.log('Listening ');
            ws.start(port);
        }
        
    });
    
    
    port.on('error', err => {
        console.error('Serial port error:', err.message);
        reconnect()
    });
    
    
    port.on('close', () => {
        console.log('Serial port closed');
        reconnect()
    });
}

const reconnect = () => {
    logger.log('Reconnect');
    setTimeout(() => {
        logger.log('Reconnecting...');
        connect();
    }, RECONNECT_TIMEOUT);
};

connect()