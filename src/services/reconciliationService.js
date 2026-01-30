const Record = require('../models/Record');
const SystemRecord = require('../models/SystemRecord');
const UploadJob = require('../models/UploadJob');

const reconcileJob = async (jobId) => {
    console.log(`Starting reconciliation for job ${jobId}`);

    const records = await Record.find({ uploadJob: jobId });

    // 1. Extract all transaction IDs to fetch System Records in one go (Batch Fetching)
    const transactionIds = records.map(r => r.data.get('transactionId') || r.data.get('TransactionID') || r.data.get('id')).filter(Boolean);

    // 2. Fetch all matching system records
    const systemRecords = await SystemRecord.find({ transactionId: { $in: transactionIds } });
    const systemRecordMap = new Map();
    systemRecords.forEach(sys => systemRecordMap.set(sys.transactionId, sys)); // O(1) Lookup Map

    let matchedCount = 0;
    let unmatchedCount = 0;
    let partialCount = 0;
    let duplicateCount = 0;
    const seenIds = new Set();

    const bulkOps = [];

    // 3. Process in Memory
    for (const record of records) {
        const fileTxId = record.data.get('transactionId') || record.data.get('TransactionID') || record.data.get('id');
        const fileAmountStr = record.data.get('amount') || record.data.get('Amount');
        let status = 'Unmatched';
        let details = '';

        if (!fileTxId || !fileAmountStr) {
            status = 'Unmatched';
            details = 'Missing Transaction ID or Amount';
            unmatchedCount++;
        } else if (seenIds.has(fileTxId)) {
            status = 'Duplicate';
            details = 'Duplicate Transaction ID in upload file';
            duplicateCount++;
        } else {
            seenIds.add(fileTxId);
            const fileAmount = parseFloat(fileAmountStr.replace(/[^0-9.-]+/g, ""));
            const sysRecord = systemRecordMap.get(fileTxId); // Instant Lookup

            if (!sysRecord) {
                status = 'Unmatched';
                details = 'Transaction ID not found in System';
                unmatchedCount++;
            } else {
                const amountDiff = Math.abs(sysRecord.amount - fileAmount);
                const tolerance = Math.abs(sysRecord.amount * 0.02);

                if (amountDiff === 0) {
                    status = 'Matched';
                    details = 'Exact match';
                    matchedCount++;
                } else if (amountDiff <= tolerance) {
                    status = 'Partial';
                    details = `Amount variance within 2% (Diff: ${amountDiff})`;
                    partialCount++;
                } else {
                    status = 'Unmatched';
                    details = `Amount mismatch > 2% (Sys: ${sysRecord.amount}, File: ${fileAmount})`;
                    unmatchedCount++;
                }
            }
        }

        // Add to bulk operations
        bulkOps.push({
            updateOne: {
                filter: { _id: record._id },
                update: {
                    reconciliationStatus: status,
                    reconciliationDetails: details
                }
            }
        });
    }

    // 4. Batch Update (One DB Call)
    if (bulkOps.length > 0) {
        await Record.bulkWrite(bulkOps);
    }

    console.log(`Reconciliation complete. Matched: ${matchedCount}, Partial: ${partialCount}, Unmatched: ${unmatchedCount}, Duplicate: ${duplicateCount}`);

    return { matchedCount, partialCount, unmatchedCount, duplicateCount };
};

module.exports = { reconcileJob };
