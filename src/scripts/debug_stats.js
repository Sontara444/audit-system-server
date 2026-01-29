const mongoose = require('mongoose');
const dotenv = require('dotenv');
const UploadJob = require('../models/UploadJob');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const checkStats = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Find the most recent job
        const job = await UploadJob.findOne().sort({ createdAt: -1 });

        if (job) {
            console.log('Most Recent Job Found:');
            console.log('ID:', job._id);
            console.log('Status:', job.status);
            console.log('Total Records:', job.totalRecords);
            console.log('Matched:', job.matchedCount);
            console.log('Partial:', job.partialCount);
            console.log('Unmatched:', job.unmatchedCount);
            console.log('Duplicate:', job.duplicateCount);
        } else {
            console.log('No jobs found.');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkStats();
