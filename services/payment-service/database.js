const mongoose = require("mongoose");

const dbConnection = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGOOSE_URL, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(
      `Database connected. Host:${connect.connection.host} Database:${connect.connection.name}`
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = dbConnection;
