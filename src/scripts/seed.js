const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SystemRecord = require('../models/SystemRecord');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        await SystemRecord.deleteMany({});
        console.log('Cleared existing System Records');

        const records = [
            {
                transactionId: "TXN001",
                amount: 1000,
                date: new Date("2023-10-01"),
                description: "System Payment A",
                status: "Pending"
            },
            {
                transactionId: "TXN002",
                amount: 2000,
                date: new Date("2023-10-02"),
                description: "System Payment B (Expect Partial with 2030)",
                status: "Pending"
            },
            {
                transactionId: "TXN004",
                amount: 5000,
                date: new Date("2023-10-04"),
                description: "System Payment D (Not in file)",
                status: "Pending"
            }
        ];

        await SystemRecord.insertMany(records);
        console.log('System Records Seeded:');
        console.table(records);

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
