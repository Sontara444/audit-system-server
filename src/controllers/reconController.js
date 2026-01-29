const { reconcileJob } = require('../services/reconciliationService');
const UploadJob = require('../models/UploadJob');
const Record = require('../models/Record');
const { logAction } = require('../services/auditService');

const triggerRecon = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await UploadJob.findOne({ _id: jobId, user: req.user._id });

        if (!job) {
            return res.status(404).json({ message: 'Upload job not found' });
        }

        logAction(req.user._id, 'RECON_STARTED', jobId, 'UploadJob', { status: 'Started' }, req.ip);

        reconcileJob(jobId)
            .then(stats => {
                UploadJob.findByIdAndUpdate(jobId, {
                    status: 'Completed',
                    ...stats
                }).then(() => {
                    logAction(req.user._id, 'RECON_COMPLETED', jobId, 'UploadJob', { status: 'Completed', stats: JSON.stringify(stats) });
                });
            })
            .catch(err => {
                console.error("Reconciliation failed", err);
                UploadJob.findByIdAndUpdate(jobId, { status: 'Failed', errorLog: err.message });
            });

        res.status(202).json({ message: 'Reconciliation started' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getReconStats = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await UploadJob.findOne({ _id: jobId, user: req.user._id });

        if (!job) {
            return res.status(404).json({ message: 'Upload job not found' });
        }

        res.json({
            status: job.status,
            total: job.totalRecords,
            matched: job.matchedCount,
            partial: job.partialCount,
            unmatched: job.unmatchedCount,
            duplicate: job.duplicateCount
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getReconRecords = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { status, page = 1, limit = 50 } = req.query;

        const query = { uploadJob: jobId };
        if (status && status !== 'All') {
            query.reconciliationStatus = status;
        }

        const skip = (page - 1) * limit;

        const records = await Record.find(query)
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Record.countDocuments(query);

        res.json({
            records,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateRecordStatus = async (req, res) => {
    try {
        const { recordId } = req.params;
        const { status, note } = req.body;

        const record = await Record.findById(recordId);
        if (!record) {
            return res.status(404).json({ message: 'Record not found' });
        }

        if (status) record.reconciliationStatus = status;
        if (note) record.reconciliationDetails = note;

        await record.save();

        if (status || note) {
            logAction(req.user._id, 'RECORD_FLAGGED', recordId, 'Record', { status, note }, req.ip);
        }

        res.json(record);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    triggerRecon,
    getReconStats,
    getReconRecords,
    updateRecordStatus
};
