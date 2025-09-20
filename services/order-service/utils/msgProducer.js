const amqp = require("amqplib");

const sendOrderMessages = async (order, restaurantId, userId) => {
  try {
    let channel;
    const rabbitmq_url = process.env.RABBITMQ_URL || "amqp://localhost:5672";
    const connection = await amqp.connect(rabbitmq_url);
    channel = await connection.createChannel();

    // await channel.assertExchange('order_events', 'topic', { durable: true });
    // channel.publish(restaurantExchange, restaurantId, Buffer.from(JSON.stringify(order)));
    // console.log('✅ Order sent to restaurant', restaurantId);

    // // 2. Broadcast to All Delivery Persons (Fanout Exchange)
    // const deliveryExchange = 'deliveryExchange';
    // await channel.assertExchange(deliveryExchange, 'fanout', { durable: true });
    // channel.publish(deliveryExchange, '', Buffer.from(JSON.stringify(order)));
    // console.log('✅ Order broadcast to delivery persons');

    // // 3. Notify Payment Service (Direct Exchange)
    // const paymentExchange = 'paymentExchange';
    // await channel.assertExchange(paymentExchange, 'direct', { durable: true });
    // const paymentInfo = {
    //   userId,
    //   amount: order.totalPrice,
    //   orderId: order.orderId,
    //   paymentMethod: order.paymentMethod,
    // };
    // channel.publish(paymentExchange, userId, Buffer.from(JSON.stringify(paymentInfo)));
    // console.log('✅ Payment info sent for user', userId);

    await channel.assertExchange("order_events", "topic", { durable: true });


    //sent to restaurant (direct)
    channel.publish("order_events",`restaurant.${restaurantId}`,Buffer.from(JSON.stringify({type:"NEW_ORDER",payload:order})));

    //send to user who orders the food item
    channel.publish("order_events",`user.${userId}`,Buffer.from(JSON.stringify({type:"ORDER_CONFIRM",payload:order})));

    //broadcast all the users
    channel.publish("order_events",'delivery.broadcast',Buffer.from(JSON.stringify({type:'NEW_DELIVERY',payload:{orderID:order.id,pickupLocation:order.restaurant,deliveryLocation:order.deliveryAddress}})))

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Error sending messages:", error);
  }
};

module.exports = sendOrderMessages;
