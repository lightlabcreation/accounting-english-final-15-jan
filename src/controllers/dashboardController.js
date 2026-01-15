const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboardStats = async (req, res) => {
    try {
        const totalCompanies = await prisma.company.count();
        const totalRequests = await prisma.planRequest.count();

        const payments = await prisma.payment.findMany({
            where: { status: 'Success' }
        });
        const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaySignups = await prisma.company.count({
            where: {
                createdAt: {
                    gte: today
                }
            }
        });

        // Monthly signups for charts
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const companies = await prisma.company.findMany({
            where: {
                createdAt: { gte: startOfYear }
            },
            select: { createdAt: true }
        });

        const monthlySignups = Array(12).fill(0);
        companies.forEach(c => {
            const month = new Date(c.createdAt).getMonth();
            monthlySignups[month]++;
        });

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const growthData = months.map((month, index) => ({
            name: month,
            val: monthlySignups[index]
        }));

        // Monthly revenue for charts
        const successfulPayments = await prisma.payment.findMany({
            where: {
                status: 'Success',
                date: { gte: startOfYear }
            }
        });

        const monthlyRevenue = Array(12).fill(0);
        successfulPayments.forEach(p => {
            const month = new Date(p.date).getMonth();
            monthlyRevenue[month] += p.amount;
        });

        const revenueData = months.map((month, index) => ({
            name: month,
            val: monthlyRevenue[index]
        }));

        res.json({
            stats: {
                totalCompanies,
                totalRequests,
                totalRevenue,
                todaySignups
            },
            charts: {
                growthData,
                revenueData
            }
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ error: error.message });
    }
};

const createAnnouncement = async (req, res) => {
    try {
        const { title, content, status } = req.body;
        const announcement = await prisma.dashboardAnnouncement.create({
            data: { title, content, status: status || 'Active' }
        });
        res.status(201).json(announcement);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAnnouncements = async (req, res) => {
    try {
        const announcements = await prisma.dashboardAnnouncement.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAnnouncementById = async (req, res) => {
    try {
        const announcement = await prisma.dashboardAnnouncement.findUnique({
            where: { id: parseInt(req.params.id) }
        });
        if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
        res.json(announcement);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateAnnouncement = async (req, res) => {
    try {
        const { title, content, status } = req.body;
        const announcement = await prisma.dashboardAnnouncement.update({
            where: { id: parseInt(req.params.id) },
            data: { title, content, status }
        });
        res.json(announcement);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteAnnouncement = async (req, res) => {
    try {
        await prisma.dashboardAnnouncement.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getDashboardStats,
    createAnnouncement,
    getAnnouncements,
    getAnnouncementById,
    updateAnnouncement,
    deleteAnnouncement
};
