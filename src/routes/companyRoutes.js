const express = require('express');
const {
    createCompany,
    getCompanies,
    getCompanyById,
    updateCompany,
    deleteCompany
} = require('../controllers/companyController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { upload } = require('../utils/cloudinaryConfig');

const router = express.Router();

// Only Superadmin can manage companies
// Use upload.single('logo') for POST and PUT
router.post('/', authenticateToken, authorizeRoles('SUPERADMIN'), upload.single('logo'), createCompany);
router.get('/', authenticateToken, authorizeRoles('SUPERADMIN'), getCompanies);
router.get('/:id', authenticateToken, authorizeRoles('SUPERADMIN'), getCompanyById);
router.put('/:id', authenticateToken, authorizeRoles('SUPERADMIN'), upload.single('logo'), updateCompany);
router.delete('/:id', authenticateToken, authorizeRoles('SUPERADMIN'), deleteCompany);

module.exports = router;
