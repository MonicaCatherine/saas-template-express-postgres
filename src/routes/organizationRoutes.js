const express = require('express');
const Organization = require('../models/Organization');
const { verifyToken } = require('../middleware/authMiddleware');
const sequelize = require('../config/database');
const SchemaService = require('../services/schemaService');

const router = express.Router();

// Create organization
router.post('/', verifyToken, async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
        const { name } = req.body;

        // Check if user already has an organization
        const existingOrg = await Organization.findOne({
            where: { createdBy: req.user.id }
        });

        if (existingOrg) {
            await t.rollback();
            return res.status(400).json({ error: 'User already has an organization' });
        }
        
        // Generate a unique schema name
        const schemaName = `org_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        // Create schema and tenant-specific tables
        await SchemaService.createTenantSchema(schemaName, t);
        
        // Create organization in public schema
        const organization = await Organization.create({
            name,
            schemaName,
            createdBy: req.user.id
        }, { transaction: t });

        // Initialize tenant data with the newly created organization
        await SchemaService.initializeTenantData(req.user.id, organization, schemaName, t);
        
        await t.commit();

        console.log('Organization created:', {
            id: organization.id,
            name: organization.name,
            schema: schemaName,
            createdBy: req.user.id
        });

        res.status(201).json(organization);
    } catch (error) {
        await t.rollback();
        console.error('Organization creation error:', error);
        res.status(500).json({ error: 'Error creating organization' });
    }
});

// Get user's organization
router.get('/', verifyToken, async (req, res) => {
    try {
        if (!req.organization) {
            return res.status(404).json({ error: 'No organization found' });
        }
        
        res.json(req.organization);
    } catch (error) {
        console.error('Error fetching organization:', error);
        res.status(500).json({ error: 'Error fetching organization' });
    }
});

// Get specific organization
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const organization = await Organization.findOne({
            where: {
                id: req.params.id,
                createdBy: req.user.id
            }
        });
        
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }
        
        res.json(organization);
    } catch (error) {
        console.error('Get organization error:', error);
        res.status(500).json({ error: 'Error fetching organization' });
    }
});

// Update organization
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { name } = req.body;
        const { id } = req.params;

        // Check if organization belongs to user
        if (!req.organization || req.organization.id !== parseInt(id)) {
            return res.status(403).json({ error: 'Not authorized to update this organization' });
        }

        await Organization.update(
            { name },
            { where: { id } }
        );

        const updatedOrg = await Organization.findByPk(id);
        res.json(updatedOrg);
    } catch (error) {
        console.error('Organization update error:', error);
        res.status(500).json({ error: 'Error updating organization' });
    }
});

// Delete organization
router.delete('/:id', verifyToken, async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
        const organization = await Organization.findOne({
            where: {
                id: req.params.id,
                createdBy: req.user.id
            }
        });
        
        if (!organization) {
            await t.rollback();
            return res.status(404).json({ error: 'Organization not found' });
        }
        
        // Drop the organization's schema
        await sequelize.query(`DROP SCHEMA IF EXISTS "${organization.schemaName}" CASCADE`, { transaction: t });
        
        // Delete the organization record
        await organization.destroy({ transaction: t });
        
        await t.commit();
        res.status(204).send();
    } catch (error) {
        await t.rollback();
        console.error('Delete organization error:', error);
        res.status(500).json({ error: 'Error deleting organization' });
    }
});

module.exports = router;
