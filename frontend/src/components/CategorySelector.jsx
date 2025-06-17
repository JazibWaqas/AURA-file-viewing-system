import React, { useState, useEffect } from 'react';

const CategorySelector = ({ 
    selectedCategory, 
    onCategoryChange,
    required = false 
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Define the categories based on the original backend enum
    const categories = [
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
    ];

    useEffect(() => {
        // Simulate loading for consistency
        setTimeout(() => {
            setLoading(false);
        }, 100);
    }, []);

    const handleCategoryChange = (e) => {
        const category = e.target.value;
        onCategoryChange(category);
    };

    if (loading) {
        return (
            <div className="dropdown-wrapper">
                <label>Category</label>
                <select disabled>
                    <option>Loading categories...</option>
                </select>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dropdown-wrapper">
                <label>Category</label>
                <select disabled>
                    <option>Error loading categories</option>
                </select>
                <small className="error-text">{error}</small>
            </div>
        );
    }

    return (
        <div className="category-selector">
            <div className="dropdown-wrapper">
                <label htmlFor="category">Category {required && '*'}</label>
                <select
                    id="category"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    required={required}
                >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default CategorySelector; 