const amqp = require('amqplib');

const start = async (wsServer) => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    const channel = await connection.createChannel();
    
    // Define exchange
    await channel.assertExchange('order_events', 'topic', { durable: true });
    
    // Create queues
    const restaurantQueue = await channel.assertQueue('restaurant_notifications', { durable: true });
    const userQueue = await channel.assertQueue('user_notifications', { durable: true });
    const deliveryQueue = await channel.assertQueue('delivery_notifications', { durable: true });
    
    // Bind queues to exchange with routing keys
    await channel.bindQueue(restaurantQueue.queue, 'order_events', 'restaurant.*');
    await channel.bindQueue(userQueue.queue, 'order_events', 'user.*');
    await channel.bindQueue(deliveryQueue.queue, 'order_events', 'delivery.*');
    
    console.log('RabbitMQ consumer connected');
    
    // Restaurant notifications consumer
    channel.consume(restaurantQueue.queue, (msg) => {
      if (!msg) return;
      
      const content = JSON.parse(msg.content.toString());
      const routingKey = msg.fields.routingKey;
      const restaurantId = routingKey.split('.')[1];
      
      console.log(`Received message for restaurant ${restaurantId}:`, content);
      
      // Send notification to the restaurant
      const ws = wsServer.clients.restaurants[restaurantId];
      if (ws && ws.readyState === 1) { // 1 = WebSocket.OPEN
        ws.send(JSON.stringify(content));
      }
      
      channel.ack(msg);
    });
    
    // User notifications consumer
    channel.consume(userQueue.queue, (msg) => {
      if (!msg) return;
      
      const content = JSON.parse(msg.content.toString());
      const routingKey = msg.fields.routingKey;
      const userId = routingKey.split('.')[1];
      
      console.log(`Received message for user ${userId}:`, content);
      
      // Send notification to the user
      const ws = wsServer.clients.users[userId];
      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify(content));
      }
      
      channel.ack(msg);
    });
    
    // Delivery notifications consumer
    channel.consume(deliveryQueue.queue, (msg) => {
      if (!msg) return;
      
      const content = JSON.parse(msg.content.toString());
      const routingKey = msg.fields.routingKey;
      
      console.log('Received delivery notification:', content);
      
      // For broadcast messages to all delivery persons
      if (routingKey === 'delivery.broadcast') {
        // Send to all connected delivery persons
        Object.values(wsServer.clients.deliveryPersons).forEach(ws => {
          if (ws && ws.readyState === 1) {
            ws.send(JSON.stringify(content));
          }
        });
      } else {
        // For direct messages to specific delivery person
        const deliveryPersonId = routingKey.split('.')[1];
        const ws = wsServer.clients.deliveryPersons[deliveryPersonId];
        if (ws && ws.readyState === 1) {
          ws.send(JSON.stringify(content));
        }
      }
      
      channel.ack(msg);
    });
    
  } catch (error) {
    console.error('Error in RabbitMQ consumer:', error);
    process.exit(1);
  }
};

module.exports = { start };