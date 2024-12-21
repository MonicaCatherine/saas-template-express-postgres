const sequelize = require('../config/database');
const User = require('../models/User');
const Organization = require('../models/Organization');

class SchemaService {
    static async createTenantSchema(schemaName, transaction) {
        // Create the schema
        await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`, { transaction });

        // Create Organizations table in tenant schema
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS "${schemaName}".organizations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `, { transaction });

        // Create Users table in tenant schema
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS "${schemaName}".users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                organization_id INTEGER REFERENCES "${schemaName}".organizations(id),
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `, { transaction });

        // Create Messages table in tenant schema
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS "${schemaName}".messages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                organization_id INTEGER REFERENCES "${schemaName}".organizations(id),
                user_id UUID REFERENCES "${schemaName}".users(id),
                content TEXT NOT NULL,
                metadata JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `, { transaction });
    }

    static async initializeTenantData(userId, organization, schemaName, transaction) {
        // Insert organization into tenant schema
        await sequelize.query(`
            INSERT INTO "${schemaName}".organizations (id, name, created_at, updated_at)
            VALUES (:id, :name, :createdAt, :updatedAt)
        `, {
            replacements: {
                id: organization.id,
                name: organization.name,
                createdAt: organization.createdAt,
                updatedAt: organization.updatedAt
            },
            transaction
        });

        // Get user data
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Copy user to tenant schema
        await sequelize.query(`
            INSERT INTO "${schemaName}".users (
                id, organization_id, name, email, password, role, created_at, updated_at
            )
            VALUES (
                :id, :organizationId, :name, :email, :password, 'admin', :createdAt, :updatedAt
            )
        `, {
            replacements: {
                id: user.id,
                organizationId: organization.id,
                name: user.name,
                email: user.email,
                password: user.password,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            transaction
        });
    }

    static async dropTenantSchema(schemaName, transaction) {
        await sequelize.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`, { transaction });
    }
}

module.exports = SchemaService;
