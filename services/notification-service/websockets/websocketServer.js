const webSocket = require("ws");

const clients = {
  restaurants: {},
  users: {},
  deliveryPersons: {},
};

const init = (server) => {
  const wss = new webSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    console.log(`New webSocket connection`);

    const url = new URL(req.url, "http://localhost");
    const clientType = url.searchParams.get("type");
    const clientID = url.searchParams.get("id");

    if (!clientType || !clientID) {
      ws.close(1000, "Missing client type or id");
      return;
    }

    switch (clientType) {
      case "restaurant":
        clients.restaurants[clientID] = ws;
        break;
      case "user":
        clients.users[clientID] = ws;
        break;

      case "delivery":
        clients.deliveryPersons[clientID] = ws;
        break;
      default:
        ws.close(1000, "Invalid client type");
        return;
    }

    console.log(`Registered ${clientType} with ID : ${clientID}`);

    ws.on("close", () => {
      console.log(`Connection closed for ${clientType} ${clientID}`);

      switch (clientType) {
        case "restaurant":
          delete clients.restaurants[clientID];
          break;
        case "user":
          delete clients.users[clientID];
          break;
        case "delivery":
          delete clients.deliveryPersons[clientID];
          break;
      }
    });

    ws.send(
      JSON.stringify({
        type: "CONNECTED",
        message: `Connected as ${clientType} ${clientId}`,
      })
    );
  });

  return { wss, clients };
};

module.exports = { init };
