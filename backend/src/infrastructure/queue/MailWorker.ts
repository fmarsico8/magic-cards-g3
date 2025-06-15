import { connectRabbitMQ, closeConnection } from './RabbitMQConnection';
import { MailNotifier } from '../notifier/MailNotifier';

const notifier = new MailNotifier();
let isShuttingDown = false;

export const startMailWorker = async () => {
  const channel = await connectRabbitMQ();

  // Handle process termination
  const handleShutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    
    console.log('[ℹ️] Shutting down mail worker...');
    try {
      await closeConnection();
      console.log('[✔] Mail worker shutdown complete');
      process.exit(0);
    } catch (error) {
      console.error('[❌] Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', handleShutdown);
  process.on('SIGINT', handleShutdown);

  channel.consume('NOTIFICATION_QUEUE', async (msg) => {
    if (!msg) return;
    try {
      const { to, subject, body } = JSON.parse(msg.content.toString());
      await notifier.send(to, subject, body);
      channel.ack(msg);
      console.log(`[📩] Email enviado a: ${to}`);
    } catch (err) {
      console.error('[❌] Error al procesar mensaje:', err);
      // Reject the message and requeue it
      channel.nack(msg, false, true);
    }
  });

  console.log('[👂] MailWorker escuchando cola NOTIFICATION_QUEUE');
};

// Start the worker when this file is executed directly
if (require.main === module) {
  startMailWorker().catch((error) => {
    console.error('[❌] Error fatal:', error);
    process.exit(1);
  });
}
