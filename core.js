const logger = require('./logger');
let messageBuffer = Buffer.alloc(0);

const packet_LENGTH = 32;

const verifyChecksum = (packet) => {
    let sum = 0;
    for (let i = 0; i < 31; i++) {
        sum += packet[i];
    }
    
    sum = (sum + packet[31]) % 256;
    
    return sum === 10;
};

const processData = (data) => {
    let parsedData = parseData(data)
    
    return parsedData
    // if (parsedData) {
    //     ws.send(parsedData)
    // }
}

const parseData = (data) => {
    messageBuffer = Buffer.concat([messageBuffer, data]); // para qeu hace esto?

    while (messageBuffer.length >= packet_LENGTH) {
        const packet = messageBuffer.slice(0, packet_LENGTH);
        messageBuffer = messageBuffer.slice(packet_LENGTH);
        const validation = verifyChecksum(packet);

        if (validation) {
            logger.log(packet)
            const startByte = packet.readUint8(0);
            const byte5 = packet.readUint8(4);
            const byte6 = packet.readUint8(5);
            let realTemperature = (byte5 * 256 + byte6) / 10;

            if (realTemperature > 110 || realTemperature < 15.5) {
                realTemperature = "Error";
            }

            const reference = packet.readUint8(11);
            let referenceSpot;
            
            if (reference === 0x41) {
                referenceSpot = "Arterial";
            } else if (reference === 0x4F) {
                referenceSpot = "Oral";
            } else {
                referenceSpot = reference;
            }
            
            const checksum = packet[31];

            console.log('Start Byte:', startByte);
            console.log('Display Temperature:', realTemperature);
            console.log('Reference:', referenceSpot); // no me retorna bien el sitio de referencia (arterial u oral)
            
            let responseBuffer = Buffer.alloc(9)
            responseBuffer.writeDoubleBE(realTemperature, 0)
            responseBuffer.writeUint8(reference, 7)
            // Buffer.concat([responseBuffer, reference])
            const parsedData = responseBuffer

            return parsedData

        } else {
            console.log("packet inválido descartado.");
        }
    }
}

module.exports = {
    processData
};
