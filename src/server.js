const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const reconRoutes = require('./routes/reconRoutes');
const auditRoutes = require('./routes/auditRoutes');

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/recon', reconRoutes);
app.use('/api/audit', auditRoutes);

app.get('/', (req, res) => {
    res.send('Smart Reconciliation System API');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
