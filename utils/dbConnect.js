const mongoose = require('mongoose');
require('dotenv').config();


const connection = {};

async function dbConnect() {
    if (connection.isConnected) {
        return;
    }

    const db = await mongoose.connect(process.env.MONGODB_URI);

    connection.isConnected = db.connections[0].readyState;
}

module.exports = dbConnect;