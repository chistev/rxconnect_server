require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');

const registrationRoutes = require('./registration/registerRoute');
const loginRoute = require('./login/route');
const identifyRoute = require('./login/identify/route')
const recoverRoute = require('./recover/route')
const recoverPasswordRoute = require('./recover/password/route')
const logoutRoute = require('./feed/route');

const corsMiddleware = require('./config/corsConfig');
const connectToDatabase = require('./config/dbConfig');
const validateJWT = require('./middlewares/validateJWT');

const User = require('./models/User');

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

app.get('/api/validate-jwt', validateJWT, (req, res) => {
    res.json({ userId: req.userId });
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();  // Fetch all users from the database
        res.json(users);  // Send the user data as a JSON response
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Error fetching users' });
    }
});

app.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}`);
});