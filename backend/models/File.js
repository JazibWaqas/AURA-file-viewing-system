const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true,
        enum: ['excel', 'pdf', 'csv']
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Income Statement',
            'Cash Flow',
            'Balance Sheet',
            'Receipts',
            'Invoices',
            'Bank Statements',
            'Tax Returns',
            'Audit Reports',
            'Budget Reports',
            'Grant Reports',
            'Donation Records',
            'Expense Reports',
            'Payroll Records',
            'Asset Inventory',
            'Project Financials',
            'Other'
        ]
    },
    subCategory: {
        type: String,
        // For more specific categorization
        // e.g., "Monthly", "Quarterly", "Annual" for Income Statement
    },
    year: {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    quarter: {
        type: Number,
        min: 1,
        max: 4
    },
    fiscalYear: {
        type: String,
        // e.g., "2023-2024"
    },
    path: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    uploadedBy: {
        type: String,
        required: true
    },
    department: {
        type: String,
        enum: [
            'Finance',
            'HR',
            'Operations',
            'Projects',
            'Fundraising',
            'Administration',
            'Other'
        ]
    },
    projectCode: {
        type: String,
        // For project-specific documents
    },
    grantReference: {
        type: String,
        // For grant-related documents
    },
    status: {
        type: String,
        enum: ['Draft', 'Pending Review', 'Approved', 'Archived'],
        default: 'Draft'
    },
    tags: [{
        type: String
    }],
    metadata: {
        type: Map,
        of: String
        // For any additional custom fields
    },
    version: {
        type: Number,
        default: 1
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    archiveDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
fileSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('File', fileSchema);