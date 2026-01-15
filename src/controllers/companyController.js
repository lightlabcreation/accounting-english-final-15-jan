const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
const { isCloudinaryConfigured } = require('../utils/cloudinaryConfig');

const createCompany = async (req, res) => {
    try {
        const { name, email, phone, address, startDate, endDate, planId, planType, password } = req.body;

        let logoUrl = null;
        if (req.file) {
            if (isCloudinaryConfigured) {
                logoUrl = req.file.path; // Cloudinary URL
            } else {
                console.warn('File received but Cloudinary not configured. Logo not saved.');
            }
        }

        // Check if company or user already exists
        const existingCompany = await prisma.company.findUnique({ where: { email } });
        if (existingCompany) return res.status(400).json({ error: 'Company with this email already exists' });

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: 'User with this email already exists' });

        // Hash password for the company admin
        if (!password) {
            return res.status(400).json({ error: 'Password is required for creating a company account' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create Company and Admin User in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const company = await tx.company.create({
                data: {
                    name,
                    email,
                    phone,
                    address,
                    startDate: startDate ? new Date(startDate) : null,
                    endDate: endDate ? new Date(endDate) : null,
                    planId: planId ? parseInt(planId) : null,
                    planType,
                    logo: logoUrl
                }
            });

            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: 'COMPANY',
                    companyId: company.id
                }
            });

            return { company, user };
        });

        res.status(201).json(result.company);
    } catch (error) {
        console.error('Create Company Error:', error);
        res.status(500).json({
            error: error.message || 'Internal Server Error'
        });
    }
};

const getCompanies = async (req, res) => {
    try {
        const companies = await prisma.company.findMany({
            include: {
                users: true,
                plan: true
            }
        });
        res.json(companies);
    } catch (error) {
        console.error('Get Companies Error:', error);
        res.status(500).json({ error: error.message });
    }
};

const getCompanyById = async (req, res) => {
    try {
        const company = await prisma.company.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                users: true,
                plan: true
            }
        });
        if (!company) return res.status(404).json({ message: 'Company not found' });
        res.json(company);
    } catch (error) {
        console.error('Get Company By ID Error:', error);
        res.status(500).json({ error: error.message });
    }
};

const updateCompany = async (req, res) => {
    try {
        const { name, email, phone, address, startDate, endDate, planId, planType } = req.body;

        const updateData = {
            name,
            email,
            phone,
            address,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            planId: planId ? parseInt(planId) : null,
            planType
        };

        if (req.file) {
            if (isCloudinaryConfigured) {
                updateData.logo = req.file.path;
            } else {
                console.warn('File received but Cloudinary not configured. Logo not updated.');
            }
        }

        const company = await prisma.company.update({
            where: { id: parseInt(req.params.id) },
            data: updateData,
            include: { plan: true }
        });
        res.json(company);
    } catch (error) {
        console.error('Update Company Error:', error);
        res.status(500).json({
            error: error.message || 'Internal Server Error'
        });
    }
};

const deleteCompany = async (req, res) => {
    try {
        // Transaction to delete company and its users
        await prisma.$transaction(async (tx) => {
            await tx.user.deleteMany({ where: { companyId: parseInt(req.params.id) } });
            await tx.company.delete({ where: { id: parseInt(req.params.id) } });
        });
        res.json({ message: 'Company and its users deleted successfully' });
    } catch (error) {
        console.error('Delete Company Error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createCompany,
    getCompanies,
    getCompanyById,
    updateCompany,
    deleteCompany
};
