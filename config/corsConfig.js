const cors = require('cors');

const corsOptions = {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
};

const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;