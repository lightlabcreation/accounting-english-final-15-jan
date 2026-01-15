const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createPayment = async (req, res) => {
    try {
        const {
            transactionId,
            date,
            customer,
            paymentMethod,
            amount,
            status
        } = req.body;

        const payment = await prisma.payment.create({
            data: {
                transactionId,
                date: date ? new Date(date) : new Date(),
                customer,
                paymentMethod,
                amount: parseFloat(amount),
                status: status || 'Pending'
            }
        });

        res.status(201).json(payment);
    } catch (error) {
        console.error('Create Payment Error:', error);
        res.status(500).json({ error: error.message });
    }
};

const getPayments = async (req, res) => {
    try {
        const payments = await prisma.payment.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(payments);
    } catch (error) {
        console.error('Get Payments Error:', error);
        res.status(500).json({ error: error.message });
    }
};

const getPaymentById = async (req, res) => {
    try {
        const payment = await prisma.payment.findUnique({
            where: { id: parseInt(req.params.id) }
        });
        if (!payment) return res.status(404).json({ message: 'Payment not found' });
        res.json(payment);
    } catch (error) {
        console.error('Get Payment By ID Error:', error);
        res.status(500).json({ error: error.message });
    }
};

const updatePayment = async (req, res) => {
    try {
        const {
            transactionId,
            date,
            customer,
            paymentMethod,
            amount,
            status
        } = req.body;

        const payment = await prisma.payment.update({
            where: { id: parseInt(req.params.id) },
            data: {
                transactionId,
                date: date ? new Date(date) : undefined,
                customer,
                paymentMethod,
                amount: amount ? parseFloat(amount) : undefined,
                status
            }
        });

        res.json(payment);
    } catch (error) {
        console.error('Update Payment Error:', error);
        res.status(500).json({ error: error.message });
    }
};

const deletePayment = async (req, res) => {
    try {
        await prisma.payment.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        console.error('Delete Payment Error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createPayment,
    getPayments,
    getPaymentById,
    updatePayment,
    deletePayment
};
