const mongoose = require("mongoose");
require('dotenv').config();

// Connection URL
let URL = process.env.MONGODB_URL_LOCAL;
// let URL = process.env.MONGODB_URL;

// Set up MongoDB Connection
mongoose.connect(URL);

const db = mongoose.connection;

// Here "connected", "error", "disconnected" are reserved words by mongoose
// "on" is event listener
db.on('connected', () => {
    console.log('Connected to MongoDB server');
})

db.on('error', (err) => {
    console.log('MongoDB connection error', err);
})

db.on('disconnected', () => {
    console.log('MongoDB disconnected');
})

module.exports = db;