# Category System Implementation

## Overview

The AURA File Viewing System now supports a hierarchical category structure with main categories and subcategories. This allows for better organization and classification of uploaded files.

## Category Structure

The system includes 8 main categories with their respective subcategories:

### 1. Financial Statements
- Financial Reports
- Monthly Accounts
- Trial Balance

### 2. Income & Donations
- Donations
- Fee Records
- Other Income

### 3. Expenses
- Operating Expenses
- Utility Bills
- Salary Records

### 4. Bank & Cash
- Bank Statements
- Cash Books
- Bank Reconciliations

### 5. Tax & Compliance
- Tax Returns
- Tax Exemptions
- Regulatory Filings

### 6. Audit Reports
- External Audit
- Internal Audit

### 7. Budgets
- Annual Budgets

### 8. Organizational Documents
- Board Documents
- Certificates
- Constitution
- General
- Policies
- Registration Documents
- Staff Policies

## Database Schema Changes

### Category Model
```javascript
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    subCategories: [{
        name: { type: String, required: true },
        description: { type: String },
        isActive: { type: Boolean, default: true }
    }],
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
```

### File Model
```javascript
const fileSchema = new mongoose.Schema({
    // ... other fields
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subCategory: {
        type: String,
        required: true
    },
    // ... other fields
});
```

## API Endpoints

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/dropdown` - Get categories for dropdown (simplified format)
- `GET /api/categories/:id` - Get a single category
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### Subcategories
- `POST /api/categories/:id/subcategories` - Add subcategory to a category
- `PUT /api/categories/:categoryId/subcategories/:subCategoryId` - Update subcategory
- `DELETE /api/categories/:categoryId/subcategories/:subCategoryId` - Delete subcategory

### Files
- `POST /api/files/upload` - Upload file (now requires category ID and subcategory name)
- `GET /api/files` - Get all files (now populates category information)

## Frontend Components

### CategorySelector Component
A new React component that provides a hierarchical dropdown for selecting categories and subcategories:

```jsx
<CategorySelector
    selectedCategory={selectedCategory}
    selectedSubCategory={selectedSubCategory}
    onCategoryChange={setSelectedCategory}
    onSubCategoryChange={setSelectedSubCategory}
    required={true}
/>
```

### Updated Pages
- **UploadFilePage**: Now uses CategorySelector for category selection
- **FileIndexPage**: Updated to display and filter by category and subcategory
- **FileViewerPage**: Updated to display category and subcategory information

## Usage

### Uploading Files
1. Navigate to the Upload page
2. Select a file to upload
3. Choose a main category from the dropdown
4. Choose a subcategory from the second dropdown (appears after selecting main category)
5. Fill in other required fields (year, etc.)
6. Click "Upload File"

### Filtering Files
1. Navigate to the File Index page
2. Use the Category filter to select a main category
3. Use the Subcategory filter to further refine results
4. Use the Year filter to filter by year
5. Use the search bar to search by filename or description

## Initialization

To initialize the default categories, run:

```bash
cd backend
npm run init-categories
```

This will:
1. Clear any existing categories
2. Create the 8 main categories with their subcategories
3. Set all categories as active

## Adding New Categories

To add new categories or subcategories, you can:

1. Use the API endpoints directly
2. Modify the `initializeCategories.js` script and re-run it
3. Add a category management interface in the future

## Migration from Old System

The new system is backward-incompatible with the old category system. If you have existing files with the old category structure, you'll need to:

1. Export existing files
2. Re-upload them with the new category structure
3. Or create a migration script to update existing records

## Future Enhancements

- Category management interface for adding/editing categories
- Bulk category updates
- Category-based permissions
- Category-specific retention policies
- Category analytics and reporting 