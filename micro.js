#!/usr/bin/env node

require('dotenv').config()
const MOCK = process.env.MOCK
const SerialPort = require('serialport');
const fs = require("fs");
const {start, startMock} = require('./server')
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
            start(port);
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

if (MOCK === 'true') {
    logger.log('Start with MOCK file')
    let mockData = fs.readFileSync('./mock/data-temp.bin')
    startMock(mockData)
} else {
    connect()
}