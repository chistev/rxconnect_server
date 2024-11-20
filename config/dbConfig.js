const mongoose = require('mongoose');

const connectToDatabase = async () => {
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is not defined');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectToDatabase;
