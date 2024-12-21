const Organization = require('../models/Organization');

const schemaMiddleware = async (req, res, next) => {
    try {
        // Skip schema switching for non-authenticated routes
        if (!req.user) {
            return next();
        }

        // Find user's organization
        const organization = await Organization.findOne({
            where: { createdBy: req.user.id }
        });

        if (!organization) {
            return next();
        }

        // Set the schema for the current request
        req.schemaName = organization.schemaName;
        
        // Set the search_path for the current request
        await req.app.get('sequelize').query(`SET search_path TO "${organization.schemaName}", public`);
        
        next();
    } catch (error) {
        console.error('Schema middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = schemaMiddleware;
