const mongoose = require('mongoose');

const passwordResetRequestSchema = new mongoose.Schema({
    email: { type: String, required: true },
    resetCode: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }
});

module.exports = mongoose.model('PasswordResetRequest', passwordResetRequestSchema);
