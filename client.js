const WebSocket = require('ws');
const logger = require('./logger');
let messageBuffer = Buffer.alloc(0);

const url = 'ws://localhost:5003';
const ws = new WebSocket(url);
const PAQUETE_LENGTH = 32;

const verificarChecksum = (paquete) => {
    let sum = 0;
    for (let i = 0; i < 31; i++) {
        sum += paquete[i];
    }
    
    sum = (sum + paquete[31]) % 256;
    
    return sum === 10;
};

const procesarPaquete = (paquete) => {
    if (verificarChecksum(paquete)) {
        return paquete;
    } else {
        console.log("Error: paquete inválido. Descartando el paquete.");
        return null;
    }
};

ws.on('message', (data) => {
    messageBuffer = Buffer.concat([messageBuffer, data]);

    while (messageBuffer.length >= PAQUETE_LENGTH) {
        const paquete = messageBuffer.slice(0, PAQUETE_LENGTH);
        messageBuffer = messageBuffer.slice(PAQUETE_LENGTH);
        const valido = procesarPaquete(paquete);

        if (valido) {
            logger.log(paquete)
            const startByte = paquete.readUint8(0);
            const byte5 = paquete.readUint8(4);
            const byte6 = paquete.readUint8(5);
            let temperaturaReal = (byte5 * 256 + byte6) / 10;

            if (temperaturaReal > 110 || temperaturaReal < 15.5) {
                temperaturaReal = "Error";
            }

            const reference = paquete.readUint8(11);
            let sitioDeReferencia;
            
            if (reference === 0x41) {
                sitioDeReferencia = "Arterial";
            } else if (reference === 0x4F) {
                sitioDeReferencia = "Oral";
            } else {
                sitioDeReferencia = reference;
            }
            
            const checksum = paquete[31];

            console.log('Start Byte:', startByte);
            console.log('Display Temperature:', temperaturaReal);
            console.log('Reference:', sitioDeReferencia); // no me retorna bien el sitio de referencia (arterial u oral)
            
        } else {
            console.log("Paquete inválido descartado.");
        }
    }
});

ws.on('error', function error(err) {
    logger.error('Error en la conexión WebSocket:', err.message);
});
