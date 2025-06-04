const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    type: {
        type: String,
        enum: ['Financial', 'Operational', 'Administrative', 'Compliance', 'Other'],
        required: true
    },
    subCategories: [{
        name: String,
        description: String
    }],
    requiredFields: [{
        fieldName: String,
        fieldType: String,
        isRequired: Boolean
    }],
    retentionPeriod: {
        type: Number,  // in months
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
            'All'
        ],
        default: 'All'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    metadata: {
        type: Map,
        of: String
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
categorySchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Category', categorySchema);