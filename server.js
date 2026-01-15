require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const companyRoutes = require('./src/routes/companyRoutes');
const planRoutes = require('./src/routes/planRoutes');
const planRequestRoutes = require('./src/routes/planRequestRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const profileRoutes = require('./src/routes/profileRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/plan-requests', planRequestRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/superadmin/dashboard', dashboardRoutes);
app.use('/api/profile', profileRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('Accounting Software Backend is running');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('--- ERROR START ---');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    if (err.data) console.error('Cloudinary Data:', err.data);
    console.error('--- ERROR END ---');

    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {},
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
