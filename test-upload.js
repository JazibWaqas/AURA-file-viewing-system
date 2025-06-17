const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testUpload() {
  try {
    // First, get the categories to find a valid category ID
    const categoriesResponse = await fetch('http://localhost:3000/api/categories/dropdown');
    const categories = await categoriesResponse.json();
    
    console.log('Available categories:', categories.map(c => ({ id: c.id, name: c.name, subCategories: c.subCategories })));
    
    if (categories.length === 0) {
      console.log('No categories found. Please run the initialization script first.');
      return;
    }
    
    // Use the first category and its first subcategory
    const categoryId = categories[0].id;
    const subCategory = categories[0].subCategories[0].name;
    
    console.log(`Using category: ${categories[0].name}, subcategory: ${subCategory}`);
    
    // Create a test file
    const testContent = 'This is a test file for the new category system.';
    fs.writeFileSync('test-file.txt', testContent);
    
    // Create form data
    const form = new FormData();
    form.append('file', fs.createReadStream('test-file.txt'));
    form.append('fileName', 'Test File - New Category System');
    form.append('description', 'This is a test file to verify the new category system works correctly.');
    form.append('category', categoryId);
    form.append('subCategory', subCategory);
    form.append('year', '2024');
    form.append('month', '12');
    
    // Upload the file
    const uploadResponse = await fetch('http://localhost:3000/api/files/upload', {
      method: 'POST',
      body: form
    });
    
    if (uploadResponse.ok) {
      const result = await uploadResponse.json();
      console.log('Upload successful:', result);
      
      // Test fetching the file to verify it was saved correctly
      const filesResponse = await fetch('http://localhost:3000/api/files');
      const files = await filesResponse.json();
      
      console.log('All files:', files.map(f => ({
        name: f.originalName,
        category: f.category ? f.category.name : 'Unknown',
        subCategory: f.subCategory
      })));
      
    } else {
      const error = await uploadResponse.text();
      console.error('Upload failed:', error);
    }
    
    // Clean up test file
    fs.unlinkSync('test-file.txt');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testUpload(); 