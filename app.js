require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const registrationRoutes = require('./registration/registerRoute');

const app = express();
const PORT = 5000;

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
}));

app.use(express.json());

if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not defined');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

app.use('/api', registrationRoutes);

app.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}`);
});