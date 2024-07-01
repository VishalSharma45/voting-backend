const express = require("express");
const app = express();
const db = require("./db");
const bodyParser = require("body-parser");
require('dotenv').config();

app.use(bodyParser.json());
const PORT = process.env.PORT || 8000;


// Import the route files
const userRoutes = require("./routes/userRoutes");
const candidateRoutes = require("./routes/candidateRoutes");

app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);

app.listen(PORT);