const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SystemRecord = require('../models/SystemRecord');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected (' + process.env.MONGO_URI + ')');

        await SystemRecord.deleteMany({});
        console.log('Cleared existing System Records');

        const records = [];

        // 1. Exact Matches (for TXN101 - TXN115)
        for (let i = 101; i <= 115; i++) {
            records.push({
                transactionId: `TXN${i}`,
                amount: 1000,
                date: new Date("2023-11-01"),
                description: `System Record Exact ${i}`,
                status: "Pending"
            });
        }

        // 2. Partial Matches (for TXN116 - TXN130) (System has 1000, File will have 1010 -> 1% diff)
        for (let i = 116; i <= 130; i++) {
            records.push({
                transactionId: `TXN${i}`,
                amount: 1000,
                date: new Date("2023-11-01"),
                description: `System Record Partial ${i}`,
                status: "Pending"
            });
        }

        // 3. Unmatched (TXN131 - TXN140) - Do NOT add to system.
        // File will have these, but System won't. -> Result: Unmatched (ID not found)

        // 4. Duplicate (TXN101 - TXN110 reused in file) - System already has TXN101-110 from step 1.
        // This affects the FILE, not the system.

        await SystemRecord.insertMany(records);
        console.log(`Seeded ${records.length} System Records (TXN101 - TXN130)`);

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
