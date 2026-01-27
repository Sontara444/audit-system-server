const fs = require('fs');
const csv = require('csv-parser');
const Record = require('../models/Record');
const UploadJob = require('../models/UploadJob');

const processUpload = async (jobId, filePath) => {
    console.log(`Starting processing for job ${jobId}`);

    // Update status to processing
    await UploadJob.findByIdAndUpdate(jobId, { status: 'Processing' });

    const results = [];
    const batchSize = 1000;
    let totalProcessed = 0;

    const stream = fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
            // Push data to results array
            results.push({
                uploadJob: jobId,
                data: data,
                reconciliationStatus: 'Unmatched'
            });

            // If batch size reached, pause stream and insert
            if (results.length >= batchSize) {
                stream.pause();
                const batch = [...results];
                results.length = 0; // Clear array

                Record.insertMany(batch)
                    .then(() => {
                        totalProcessed += batch.length;
                        console.log(`Processed ${totalProcessed} records`);
                        stream.resume();
                    })
                    .catch((err) => {
                        console.error('Error inserting batch:', err);
                        // Depending on requirements, we might want to fail the whole job or just log errors
                        UploadJob.findByIdAndUpdate(jobId, { status: 'Failed', error: err.message });
                        stream.destroy();
                    });
            }
        })
        .on('end', async () => {
            // Insert remaining records
            if (results.length > 0) {
                try {
                    await Record.insertMany(results);
                    totalProcessed += results.length;
                } catch (err) {
                    console.error('Error inserting final batch:', err);
                    await UploadJob.findByIdAndUpdate(jobId, { status: 'Failed', error: err.message });
                    return;
                }
            }

            console.log(`Job ${jobId} completed. Total records: ${totalProcessed}`);
            await UploadJob.findByIdAndUpdate(jobId, {
                status: 'Completed',
                totalRecords: totalProcessed
            });

            // Optionally delete the file after processing
            // fs.unlinkSync(filePath);
        })
        .on('error', async (error) => {
            console.error('Stream error:', error);
            await UploadJob.findByIdAndUpdate(jobId, { status: 'Failed', error: error.message });
        });
};

module.exports = { processUpload };
