const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: String,
    stripeAccountId: String,
    stripeAccountStatus: {
        detailsSubmitted: { type: Boolean, default: false },
        chargesEnabled: { type: Boolean, default: false },
        payoutsEnabled: { type: Boolean, default: false },
    },
    user: {
        type: String,
        required: true,
        unique: false,
        index: false
    },
    currentEventStr: {
        type: String,
        required: false,
    }
}, { timestamps: true })

module.exports = mongoose.models.Account || mongoose.model('Account', AccountSchema);