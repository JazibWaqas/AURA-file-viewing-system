import React, { useState } from 'react';

const defaultCategories = [
    {
        name: 'Financial Statements',
        subCategories: ['Financial Reports', 'Monthly Accounts', 'Trial Balance', 'Other']
    },
    {
        name: 'Income & Donations',
        subCategories: ['Donations', 'Fee Records', 'Other Income', 'Other']
    },
    {
        name: 'Expenses',
        subCategories: ['Operating Expenses', 'Utility Bills', 'Salary Records', 'Other']
    },
    {
        name: 'Bank & Cash',
        subCategories: ['Bank Statements', 'Cash Books', 'Bank Reconciliations', 'Other']
    },
    {
        name: 'Tax & Compliance',
        subCategories: ['Tax Returns', 'Tax Exemptions', 'Regulatory Filings', 'Other']
    },
    {
        name: 'Audit Reports',
        subCategories: ['External Audit', 'Internal Audit', 'Other']
    },
    {
        name: 'Budgets',
        subCategories: ['Annual Budgets', 'Other']
    },
    {
        name: 'Organizational Documents',
        subCategories: ['Board Documents', 'Certificates', 'Constitution', 'General', 'Policies', 'Registration Documents', 'Staff Policies', 'Other']
    },
    {
        name: 'Other',
        subCategories: ['Other']
    }
];

export default function CategorySidebar({ onSelect }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div>
      <h3>Categories</h3>
      <ul>
        {defaultCategories.map((cat, idx) => (
          <li key={cat.name}>
            <div
              style={{ cursor: 'pointer', fontWeight: expanded === idx ? 'bold' : 'normal' }}
              onClick={() => setExpanded(expanded === idx ? null : idx)}
            >
              {cat.name}
            </div>
            {expanded === idx && (
              <ul>
                {cat.subCategories.map((sub, subIdx) => (
                  <li key={sub} style={{ marginLeft: 16 }}>
                    <button type="button" onClick={() => onSelect(cat.name, sub)}>{sub}</button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
} 