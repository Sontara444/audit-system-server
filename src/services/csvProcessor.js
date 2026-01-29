const fs = require('fs');
const csv = require('csv-parser');
const Record = require('../models/Record');
const UploadJob = require('../models/UploadJob');

const processUpload = async (jobId, filePath) => {
    console.log(`Starting processing for job ${jobId}`);

    await UploadJob.findByIdAndUpdate(jobId, { status: 'Processing' });

    const results = [];
    const batchSize = 1000;
    let totalProcessed = 0;

    const stream = fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
            results.push({
                uploadJob: jobId,
                data: data,
                reconciliationStatus: 'Unmatched'
            });

            if (results.length >= batchSize) {
                stream.pause();
                const batch = [...results];
                results.length = 0;

                Record.insertMany(batch)
                    .then(() => {
                        totalProcessed += batch.length;
                        console.log(`Processed ${totalProcessed} records`);
                        stream.resume();
                    })
                    .catch((err) => {
                        console.error('Error inserting batch:', err);
                        UploadJob.findByIdAndUpdate(jobId, { status: 'Failed', error: err.message });
                        stream.destroy();
                    });
            }
        })
        .on('end', async () => {
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

        })
        .on('error', async (error) => {
            console.error('Stream error:', error);
            await UploadJob.findByIdAndUpdate(jobId, { status: 'Failed', error: error.message });
        });
};

module.exports = { processUpload };
