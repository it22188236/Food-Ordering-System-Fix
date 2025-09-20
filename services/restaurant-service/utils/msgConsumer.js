const connectRabbitMQ = require('./connectRabbitMQ');

const receiveRestaurantOrders = async (restaurantId) => {
  const connection = await connectRabbitMQ();
  const channel = await connection.createChannel();
  const exchangeName = 'restaurantExchange';

  await channel.assertExchange(exchangeName, 'direct', { durable: true });
  const { queue } = await channel.assertQueue('', { exclusive: true });
  await channel.bindQueue(queue, exchangeName, restaurantId);

  console.log(`📢 Restaurant ${restaurantId} listening for orders...`);

  channel.consume(queue, (msg) => {
    const order = JSON.parse(msg.content.toString());
    console.log('🍽️ Order received by restaurant:', order);
    channel.ack(msg);
  });
};

module.exports = receiveRestaurantOrders;
