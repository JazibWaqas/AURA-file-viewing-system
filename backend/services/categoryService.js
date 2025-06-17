const { getFirestore, generateId, convertTimestamp, convertToTimestamp } = require('../config/firebase');

class CategoryService {
    constructor() {
        this.db = getFirestore();
        this.collection = 'categories';
    }

    // Create a new category
    async createCategory(categoryData) {
        try {
            const categoryId = generateId();
            const now = new Date();
            
            const categoryRecord = {
                _id: categoryId,
                name: categoryData.name,
                description: categoryData.description,
                type: categoryData.type,
                subCategories: categoryData.subCategories || [],
                requiredFields: categoryData.requiredFields || [],
                retentionPeriod: categoryData.retentionPeriod,
                department: categoryData.department || 'All',
                isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
                metadata: categoryData.metadata || {},
                createdAt: convertToTimestamp(now),
                updatedAt: convertToTimestamp(now)
            };

            await this.db.collection(this.collection).doc(categoryId).set(categoryRecord);
            
            return {
                ...categoryRecord,
                createdAt: now,
                updatedAt: now
            };
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    }

    // Get all categories
    async getAllCategories() {
        try {
            const snapshot = await this.db.collection(this.collection)
                .where('isActive', '==', true)
                .get();
            
            const categories = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                categories.push({
                    ...data,
                    createdAt: convertTimestamp(data.createdAt),
                    updatedAt: convertTimestamp(data.updatedAt)
                });
            });

            // Sort in memory instead of using orderBy
            return categories.sort((a, b) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error('Error getting categories:', error);
            throw error;
        }
    }

    // Get a single category by ID
    async getCategoryById(categoryId) {
        try {
            const doc = await this.db.collection(this.collection).doc(categoryId).get();
            
            if (!doc.exists) {
                return null;
            }

            const data = doc.data();
            return {
                ...data,
                createdAt: convertTimestamp(data.createdAt),
                updatedAt: convertTimestamp(data.updatedAt)
            };
        } catch (error) {
            console.error('Error getting category by ID:', error);
            throw error;
        }
    }

    // Update a category
    async updateCategory(categoryId, updateData) {
        try {
            const now = new Date();
            const updateObject = {
                ...updateData,
                updatedAt: convertToTimestamp(now)
            };

            await this.db.collection(this.collection).doc(categoryId).update(updateObject);
            
            return this.getCategoryById(categoryId);
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    }

    // Delete a category
    async deleteCategory(categoryId) {
        try {
            await this.db.collection(this.collection).doc(categoryId).delete();
            return { message: 'Category deleted successfully' };
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    }

    // Initialize default categories
    async initializeDefaultCategories() {
        try {
            const defaultCategories = [
                {
                    name: 'Income Statement',
                    description: 'Monthly income reports and statements',
                    type: 'Financial',
                    retentionPeriod: 84, // 7 years
                    department: 'Finance'
                },
                {
                    name: 'Cash Flow',
                    description: 'Cash flow statements and reports',
                    type: 'Financial',
                    retentionPeriod: 84,
                    department: 'Finance'
                },
                {
                    name: 'Balance Sheet',
                    description: 'Balance sheet documents',
                    type: 'Financial',
                    retentionPeriod: 84,
                    department: 'Finance'
                },
                {
                    name: 'Receipts',
                    description: 'Expense receipts and documentation',
                    type: 'Financial',
                    retentionPeriod: 60, // 5 years
                    department: 'Finance'
                },
                {
                    name: 'Invoices',
                    description: 'Client and vendor invoices',
                    type: 'Financial',
                    retentionPeriod: 84,
                    department: 'Finance'
                },
                {
                    name: 'Bank Statements',
                    description: 'Monthly bank statements',
                    type: 'Financial',
                    retentionPeriod: 84,
                    department: 'Finance'
                },
                {
                    name: 'Tax Returns',
                    description: 'Annual tax return documents',
                    type: 'Compliance',
                    retentionPeriod: 120, // 10 years
                    department: 'Finance'
                },
                {
                    name: 'Audit Reports',
                    description: 'Annual audit reports',
                    type: 'Compliance',
                    retentionPeriod: 120,
                    department: 'Finance'
                },
                {
                    name: 'Budget Reports',
                    description: 'Budget planning and reports',
                    type: 'Financial',
                    retentionPeriod: 84,
                    department: 'Finance'
                },
                {
                    name: 'Grant Reports',
                    description: 'Grant application and reporting documents',
                    type: 'Operational',
                    retentionPeriod: 84,
                    department: 'Projects'
                },
                {
                    name: 'Donation Records',
                    description: 'Donor contribution records',
                    type: 'Financial',
                    retentionPeriod: 84,
                    department: 'Fundraising'
                },
                {
                    name: 'Expense Reports',
                    description: 'Employee expense reports',
                    type: 'Financial',
                    retentionPeriod: 60,
                    department: 'Finance'
                },
                {
                    name: 'Payroll Records',
                    description: 'Employee payroll documentation',
                    type: 'Administrative',
                    retentionPeriod: 84,
                    department: 'HR'
                },
                {
                    name: 'Asset Inventory',
                    description: 'Asset tracking and inventory records',
                    type: 'Operational',
                    retentionPeriod: 84,
                    department: 'Operations'
                },
                {
                    name: 'Project Financials',
                    description: 'Project-specific financial documents',
                    type: 'Financial',
                    retentionPeriod: 84,
                    department: 'Projects'
                },
                {
                    name: 'Other',
                    description: 'Miscellaneous documents',
                    type: 'Other',
                    retentionPeriod: 60,
                    department: 'All'
                }
            ];

            for (const category of defaultCategories) {
                // Check if category already exists
                const existingCategories = await this.db.collection(this.collection)
                    .where('name', '==', category.name)
                    .get();

                if (existingCategories.empty) {
                    await this.createCategory(category);
                }
            }

            console.log('Default categories initialized successfully');
        } catch (error) {
            console.error('Error initializing default categories:', error);
            throw error;
        }
    }

    // Get categories for dropdown (simplified format)
    async getCategoriesForDropdown() {
        try {
            const categories = await this.getAllCategories();
            return categories.map(category => ({
                id: category._id,
                name: category.name,
                subCategories: category.subCategories || []
            }));
        } catch (error) {
            console.error('Error getting categories for dropdown:', error);
            throw error;
        }
    }
}

module.exports = new CategoryService(); 