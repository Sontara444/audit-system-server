const Record = require('../models/Record');
const SystemRecord = require('../models/SystemRecord');
const UploadJob = require('../models/UploadJob');

const reconcileJob = async (jobId) => {
    console.log(`Starting reconciliation for job ${jobId}`);

    const records = await Record.find({ uploadJob: jobId });
    let matchedCount = 0;
    let unmatchedCount = 0;
    let partialCount = 0;
    let duplicateCount = 0;
    const seenIds = new Set();

    for (const record of records) {
        const fileTxId = record.data.get('transactionId') || record.data.get('TransactionID') || record.data.get('id');
        const fileAmountStr = record.data.get('amount') || record.data.get('Amount');

        if (!fileTxId || !fileAmountStr) {
            record.reconciliationStatus = 'Unmatched';
            record.reconciliationDetails = 'Missing Transaction ID or Amount';
            await record.save();
            unmatchedCount++;
            continue;
        }

        if (seenIds.has(fileTxId)) {
            record.reconciliationStatus = 'Duplicate';
            record.reconciliationDetails = 'Duplicate Transaction ID in upload file';
            await record.save();
            duplicateCount++;
            continue;
        }

        seenIds.add(fileTxId);

        const fileAmount = parseFloat(fileAmountStr.replace(/[^0-9.-]+/g, ""));

        const sysRecord = await SystemRecord.findOne({ transactionId: fileTxId });

        if (!sysRecord) {
            record.reconciliationStatus = 'Unmatched';
            record.reconciliationDetails = 'Transaction ID not found in System';
            await record.save();
            unmatchedCount++;
            continue;
        }

        const amountDiff = Math.abs(sysRecord.amount - fileAmount);
        const tolerance = Math.abs(sysRecord.amount * 0.02);

        if (amountDiff === 0) {
            record.reconciliationStatus = 'Matched';
            record.reconciliationDetails = 'Exact match';
            matchedCount++;
        } else if (amountDiff <= tolerance) {
            record.reconciliationStatus = 'Partial';
            record.reconciliationDetails = `Amount variance within 2% (Diff: ${amountDiff})`;
            partialCount++;
        } else {
            record.reconciliationStatus = 'Unmatched';
            record.reconciliationDetails = `Amount mismatch > 2% (Sys: ${sysRecord.amount}, File: ${fileAmount})`;
            unmatchedCount++;
        }

        await record.save();
    }

    console.log(`Reconciliation complete. Matched: ${matchedCount}, Partial: ${partialCount}, Unmatched: ${unmatchedCount}, Duplicate: ${duplicateCount}`);

    return { matchedCount, partialCount, unmatchedCount, duplicateCount };
};

module.exports = { reconcileJob };
