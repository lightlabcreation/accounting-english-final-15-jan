const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createPlanRequest = async (req, res) => {
    try {
        const {
            companyName,
            email,
            planId,
            planName,
            billingCycle,
            startDate
        } = req.body;

        const planRequest = await prisma.planRequest.create({
            data: {
                companyName,
                email,
                planId: planId ? parseInt(planId) : null,
                planName,
                billingCycle: billingCycle || 'Monthly',
                startDate: startDate ? new Date(startDate) : new Date(),
                status: 'Pending'
            }
        });

        res.status(201).json(planRequest);
    } catch (error) {
        console.error('Create Plan Request Error:', error);
        res.status(500).json({ error: error.message });
    }
};

const getPlanRequests = async (req, res) => {
    try {
        const planRequests = await prisma.planRequest.findMany({
            include: {
                plan: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(planRequests);
    } catch (error) {
        console.error('Get Plan Requests Error:', error);
        res.status(500).json({ error: error.message });
    }
};

const getPlanRequestById = async (req, res) => {
    try {
        const planRequest = await prisma.planRequest.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                plan: true
            }
        });
        if (!planRequest) return res.status(404).json({ message: 'Plan request not found' });
        res.json(planRequest);
    } catch (error) {
        console.error('Get Plan Request By ID Error:', error);
        res.status(500).json({ error: error.message });
    }
};

const updatePlanRequest = async (req, res) => {
    try {
        const {
            companyName,
            email,
            planId,
            planName,
            billingCycle,
            startDate,
            status
        } = req.body;

        const planRequest = await prisma.planRequest.update({
            where: { id: parseInt(req.params.id) },
            data: {
                companyName,
                email,
                planId: planId ? parseInt(planId) : null,
                planName,
                billingCycle,
                startDate: startDate ? new Date(startDate) : undefined,
                status
            }
        });

        res.json(planRequest);
    } catch (error) {
        console.error('Update Plan Request Error:', error);
        res.status(500).json({ error: error.message });
    }
};

const deletePlanRequest = async (req, res) => {
    try {
        await prisma.planRequest.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ message: 'Plan request deleted successfully' });
    } catch (error) {
        console.error('Delete Plan Request Error:', error);
        res.status(500).json({ error: error.message });
    }
};

const approvePlanRequest = async (req, res) => {
    try {
        const planRequest = await prisma.planRequest.update({
            where: { id: parseInt(req.params.id) },
            data: { status: 'Accepted' }
        });
        res.json(planRequest);
    } catch (error) {
        console.error('Approve Plan Request Error:', error);
        res.status(500).json({ error: error.message });
    }
};

const rejectPlanRequest = async (req, res) => {
    try {
        const planRequest = await prisma.planRequest.update({
            where: { id: parseInt(req.params.id) },
            data: { status: 'Rejected' }
        });
        res.json(planRequest);
    } catch (error) {
        console.error('Reject Plan Request Error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createPlanRequest,
    getPlanRequests,
    getPlanRequestById,
    updatePlanRequest,
    deletePlanRequest,
    approvePlanRequest,
    rejectPlanRequest
};
