require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const registrationRoutes = require('./registration/registerRoute');
const loginRoute = require('./login/route');
const identifyRoute = require('./login/identify/route')
const recoverRoute = require('./recover/route')
const recoverPasswordRoute = require('./recover/password/route')
const logoutRoute = require('./feed/route');

const corsMiddleware = require('./config/corsConfig');
const connectToDatabase = require('./config/dbConfig');

const app = express();
const PORT = 5000;

app.use(corsMiddleware);

app.use(express.json());

app.use(cookieParser()); 

connectToDatabase();

app.use('/api/register', registrationRoutes);  
app.use('/api/login', loginRoute); 
app.use('/api/login/reset-password', identifyRoute); 
app.use('/api/login/reset-password/verify', recoverRoute); 
app.use('/api/login/change-password', recoverPasswordRoute); 
app.use('/api/logout', logoutRoute);

// JWT validation route
app.get('/api/validate-jwt', (req, res) => {
    // Retrieve token from cookies
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'No token provided' }); // No token sent by the client
    }

    // Validate the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' }); // Token is invalid or expired
        }

        // If valid, send back the user data (e.g., userId)
        res.json({ userId: decoded.userId });
    });
});

app.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}`);
});