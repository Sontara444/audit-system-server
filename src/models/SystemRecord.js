const mongoose = require('mongoose');

const systemRecordSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    date: {
        type: Date,
        required: true
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pending', 'Reconciled'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

const SystemRecord = mongoose.model('SystemRecord', systemRecordSchema);

module.exports = SystemRecord;
