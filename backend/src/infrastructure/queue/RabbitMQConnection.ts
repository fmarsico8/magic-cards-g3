import amqp from 'amqplib';

let connection: any = null;
let channel: amqp.Channel | null = null;

const QUEUE_NAME = 'NOTIFICATION_QUEUE';
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

async function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function connectRabbitMQ(): Promise<amqp.Channel> {
    let retries = 0;
    
    while (retries < MAX_RETRIES) {
        try {
            if (!connection) {
                const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
                console.log(`[ℹ️] Attempting to connect to RabbitMQ at ${rabbitmqUrl} (attempt ${retries + 1}/${MAX_RETRIES})`);
                
                connection = await amqp.connect(rabbitmqUrl);
                console.log('[✔] Connected to RabbitMQ');
            }

            let ch: amqp.Channel;
            if (!channel) {
                if (!connection) {
                    throw new Error('No connection available');
                }
                ch = await connection.createChannel();
                console.log('[✔] Channel created');

                // Ensure queue exists
                await ch.assertQueue(QUEUE_NAME, {
                    durable: true
                });
                console.log('[✔] Queue asserted');
                channel = ch;
            } else {
                ch = channel;
            }

            return ch;
        } catch (error) {
            retries++;
            console.error(`[❌] Error connecting to RabbitMQ (attempt ${retries}/${MAX_RETRIES}):`, error);
            
            if (retries === MAX_RETRIES) {
                throw error;
            }
            
            console.log(`[ℹ️] Retrying in ${RETRY_DELAY/1000} seconds...`);
            await wait(RETRY_DELAY);
        }
    }

    throw new Error('Failed to connect to RabbitMQ after maximum retries');
}

export async function sendToQueue(message: any): Promise<void> {
    try {
        const ch = await connectRabbitMQ();
        const success = ch.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)));
        
        if (!success) {
            throw new Error('Message could not be sent to queue');
        }
        
        console.log('[✔] Message sent to queue:', message);
    } catch (error) {
        console.error('[❌] Error sending message to queue:', error);
        throw error;
    }
}

export async function closeConnection(): Promise<void> {
    try {
        if (channel) {
            await channel.close();
            channel = null;
        }
        if (connection) {
            await connection.close();
            connection = null;
        }
        console.log('[✔] RabbitMQ connection closed');
    } catch (error) {
        console.error('[❌] Error closing RabbitMQ connection:', error);
        throw error;
    }
}
