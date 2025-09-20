const WebSocket = require('ws');

const wsConnections = {};

const connect = (restaurantId) => {
  const wsUrl = `${process.env.NOTIFICATION_WS_URL || 'ws://localhost:3001'}?type=restaurant&id=${restaurantId}`;
  
  const ws = new WebSocket(wsUrl);
  
  ws.on('open', () => {
    console.log(`Restaurant ${restaurantId} connected to notification service`);
    wsConnections[restaurantId] = ws;
  });
  
  ws.on('message', (data) => {
    const message = JSON.parse(data);
    console.log(`Restaurant ${restaurantId} received:`, message);
    
    // Handle different message types
    if (message.type === 'NEW_ORDER') {
      // Process new order
      console.log(`Restaurant ${restaurantId} received new order: ${message.payload.id}`);
      // In a real app, update UI, notify restaurant staff, etc.
    }
  });
  
  ws.on('close', () => {
    console.log(`Restaurant ${restaurantId} disconnected from notification service`);
    delete wsConnections[restaurantId];
    
    // Attempt to reconnect after delay
    setTimeout(() => connect(restaurantId), 5000);
  });
  
  ws.on('error', (err) => {
    console.error(`Restaurant ${restaurantId} WebSocket error:`, err);
    ws.close();
  });
  
  return ws;
};

module.exports = { connect };