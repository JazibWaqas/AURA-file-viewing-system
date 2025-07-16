const { db, bucket } = require('../config/firebase');
const admin = require('firebase-admin');
const { algoliaIndex } = require('../config/algolia');

// Helper Functions
const generateId = () => db.collection('tmp').doc().id;
const convertTimestamp = (ts) => ts && ts.toDate ? ts.toDate() : ts;
const convertToTimestamp = (date) => date; // Firestore admin handles Date objects automatically

async function searchFilesWithAlgolia(searchTerm, limit = 16, page = 0) {
  const algoliaResult = await algoliaIndex.search(searchTerm, {
    hitsPerPage: limit,
    page: page,
  });
  // Return Algolia hits directly, plus pagination info
  return {
    files: algoliaResult.hits,
    page: algoliaResult.page,
    nbPages: algoliaResult.nbPages,
    hasNextPage: algoliaResult.page < algoliaResult.nbPages - 1
  };
}

class FileService {
    constructor() {
        this.db = db;
        this.bucket = bucket;
        this.collection = 'uploads';
    }

    // Create a new file record
    async createFile(fileData) {
        try {
            const fileId = generateId();
            const now = new Date();
            
            const fileRecord = {
                _id: fileId,
                filename: fileData.filename,
                originalName: fileData.originalName,
                fileType: fileData.fileType,
                category: fileData.category,
                year: fileData.year,
                month: fileData.month,
                quarter: fileData.quarter,
                fiscalYear: fileData.fiscalYear,
                path: fileData.path,
                size: fileData.size,
                uploadedBy: fileData.uploadedBy,
                department: fileData.department,
                projectCode: fileData.projectCode,
                grantReference: fileData.grantReference,
                status: fileData.status || 'Draft',
                tags: fileData.tags || [],
                metadata: fileData.metadata || {},
                version: fileData.version || 1,
                isArchived: fileData.isArchived || false,
                archiveDate: fileData.archiveDate,
                createdAt: convertToTimestamp(now),
                updatedAt: convertToTimestamp(now),
                requiresAuth: typeof fileData.requiresAuth === 'boolean' ? fileData.requiresAuth : false
            };

            await this.db.collection(this.collection).doc(fileId).set(fileRecord);
            
            // Convert timestamps back to dates for consistency
            return {
                ...fileRecord,
                createdAt: now,
                updatedAt: now
            };
        } catch (error) {
            console.error('Error creating file record:', error);
            throw error;
        }
    }

    // Get all files with optional filtering
    async getAllFiles(filters = {}) {
        try {
            let query = this.db.collection(this.collection);

            // Apply filters
            if (filters.search) {
                // Note: Firestore doesn't support full-text search natively
                // This is a simple implementation - consider using Algolia or similar for better search
            }

            if (filters.category) {
                query = query.where('category', '==', filters.category);
            }

            if (filters.year) {
                query = query.where('year', '==', parseInt(filters.year));
            }

            if (filters.subCategory) {
                query = query.where('subCategory', '==', filters.subCategory);
            }

            const snapshot = await query.orderBy('createdAt', 'desc').get();
            const files = [];

            snapshot.forEach(doc => {
                const data = doc.data();
                files.push({
                    _id: doc.id,
                    ...data,
                    createdAt: convertTimestamp(data.createdAt),
                    updatedAt: convertTimestamp(data.updatedAt)
                });
            });

            // Apply search filter in memory if needed
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                return files.filter(file => 
                    (file.originalName && file.originalName.toLowerCase().includes(searchTerm)) ||
                    (file.description && file.description.toLowerCase().includes(searchTerm)) ||
                    (file.category && file.category.toLowerCase().includes(searchTerm))
                );
            }

            return files;
        } catch (error) {
            console.error('Error getting files:', error);
            throw error;
        }
    }

    // Get a single file by ID
    async getFileById(fileId) {
        try {
            const doc = await this.db.collection(this.collection).doc(fileId).get();
            
            if (!doc.exists) {
                return null;
            }

            const data = doc.data();
            return {
                _id: doc.id,
                ...data,
                createdAt: convertTimestamp(data.createdAt),
                updatedAt: convertTimestamp(data.updatedAt)
            };
        } catch (error) {
            console.error('Error getting file by ID:', error);
            throw error;
        }
    }

    // Update a file
    async updateFile(fileId, updateData) {
        try {
            const now = new Date();
            const updateObject = {
                ...updateData,
                updatedAt: convertToTimestamp(now)
            };

            await this.db.collection(this.collection).doc(fileId).update(updateObject);
            
            return this.getFileById(fileId);
        } catch (error) {
            console.error('Error updating file:', error);
            throw error;
        }
    }

    // Delete a file
    async deleteFile(fileId) {
        try {
            // First get the file to get the storage path
            const file = await this.getFileById(fileId);
            if (!file) {
                throw new Error('File not found');
            }

            // Delete from Firestore
            await this.db.collection(this.collection).doc(fileId).delete();

            // Delete from Firebase Storage if path exists
            if (file.path) {
                try {
                    const fileRef = this.bucket.file(file.path);
                    await fileRef.delete();
                } catch (storageError) {
                    console.warn('Could not delete file from storage:', storageError);
                    // Don't throw error if storage deletion fails
                }
            }

            return { message: 'File deleted successfully' };
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    // Upload file to Firebase Storage
    async uploadFileToStorage(file, fileName) {
        try {
            const filePath = `uploads/${Date.now()}_${fileName}`;
            
            const fileRef = this.bucket.file(filePath);
            
            // Upload the file buffer
            await new Promise((resolve, reject) => {
                const stream = fileRef.createWriteStream({
                    metadata: {
                        contentType: file.mimetype
                    }
                });
                
                stream.on('error', reject);
                stream.on('finish', resolve);
                stream.end(file.buffer);
            });

            // Make the file publicly accessible
            await fileRef.makePublic();
            
            const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${filePath}`;
            
            return {
                path: filePath,
                url: publicUrl
            };
        } catch (error) {
            console.error('Error uploading file to storage:', error);
            throw error;
        }
    }

    // Get file preview data (for CSV/Excel)
    async getFilePreviewData(filePath, fileType) {
        const { parse } = require('csv-parse/sync');
        const XLSX = require('xlsx');

        try {
            const fileRef = this.bucket.file(filePath);
            const [exists] = await fileRef.exists();
            if (!exists) {
                throw new Error('File not found in storage for preview.');
            }

            const [fileContent] = await fileRef.download();

            let headers = [];
            let rows = [];

            if (fileType === 'csv') {
                // Try to parse with headers first
                let records;
                try {
                    records = parse(fileContent, { columns: true, skip_empty_lines: true });
                } catch (e) {
                    // Fallback: parse without headers
                    try {
                        records = parse(fileContent, { columns: false, skip_empty_lines: true });
                    } catch (parseErr) {
                        // Try to parse as JSON if CSV fails
                        try {
                            const jsonData = JSON.parse(fileContent.toString('utf8'));
                            if (Array.isArray(jsonData) && jsonData.length > 0 && typeof jsonData[0] === 'object') {
                                headers = Object.keys(jsonData[0]);
                                rows = jsonData.map(row => headers.map(h => row[h]));
                                return { headers, rows, totalRows: rows.length };
                            } else {
                                throw new Error('Malformed CSV and not a valid JSON array of objects.');
                            }
                        } catch (jsonErr) {
                            throw new Error('Malformed CSV and not valid JSON: ' + jsonErr.message);
                        }
                    }
                }

                if (Array.isArray(records) && records.length > 0) {
                    if (Array.isArray(records[0])) {
                        // No headers, just rows
                        headers = records[0].map((_, i) => `Column ${i + 1}`);
                        rows = records;
                    } else if (typeof records[0] === 'object') {
                        // With headers
                        headers = Object.keys(records[0]);
                        rows = records.map(record => headers.map(header => record[header]));
                    }
                } else {
                    throw new Error('No data found in this CSV file.');
                }
            } else if (fileType === 'json') {
                // Parse as JSON array of objects
                try {
                    const jsonData = JSON.parse(fileContent.toString('utf8'));
                    if (Array.isArray(jsonData) && jsonData.length > 0 && typeof jsonData[0] === 'object') {
                        headers = Object.keys(jsonData[0]);
                        rows = jsonData.map(row => headers.map(h => row[h]));
                    } else {
                        throw new Error('JSON file must be an array of objects.');
                    }
                } catch (jsonErr) {
                    throw new Error('Malformed JSON file: ' + jsonErr.message);
                }
            } else if (fileType === 'excel') {
                const workbook = XLSX.read(fileContent, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

                if (sheetData.length > 0) {
                    headers = sheetData[0];
                    rows = sheetData.slice(1);
                }
            } else {
                throw new Error('Preview not supported for this file type.');
            }

            // Final check: if headers or rows are empty, throw a clear error
            if (!headers || headers.length === 0 || !rows || rows.length === 0) {
                throw new Error('No data found in this file.');
            }

            return { headers, rows, totalRows: rows.length };
        } catch (error) {
            console.error('Error getting file preview data:', error);
            throw error;
        }
    }

    // Get file download URL
    async getFileDownloadUrl(filePath) {
        try {
            const fileRef = this.bucket.file(filePath);
            const [url] = await fileRef.getSignedUrl({
                action: 'read',
                expires: Date.now() + 15 * 60 * 1000 // 15 minutes
            });
            return url;
        } catch (error) {
            console.error('Error getting download URL:', error);
            throw error;
        }
    }

    // Get files with pagination and filtering
    async getFilesPaginated({ filters = {}, limit = 16, startAfter = null }) {
        try {
            let query = this.db.collection(this.collection);

            if (filters.category) {
                query = query.where('category', '==', filters.category);
            }
            if (filters.year) {
                query = query.where('year', '==', parseInt(filters.year));
            }
            if (filters.subCategory) {
                query = query.where('subCategory', '==', filters.subCategory);
            }

            // Order and paginate. Fetch one extra document to check for a next page.
            query = query.orderBy('createdAt', 'desc').limit(Number(limit) + 1);

            // Use document snapshot for startAfter
            if (startAfter) {
                const lastDocSnap = await this.db.collection(this.collection).doc(startAfter).get();
                if (lastDocSnap.exists) {
                    query = query.startAfter(lastDocSnap);
                }
            }

            const snapshot = await query.get();
            const files = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                files.push({
                    ...data,
                    _id: doc.id,
                    createdAt: convertTimestamp(data.createdAt),
                    updatedAt: convertTimestamp(data.updatedAt)
                });
            });

            // Determine if there is a next page
            const hasNextPage = files.length > limit;
            if (hasNextPage) {
                files.pop(); // Remove the extra document
            }
            const lastVisible = files.length > 0 ? files[files.length - 1]._id : null;

            // Apply search filter in memory if needed (Note: this happens *after* pagination)
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                const filtered = files.filter(file =>
                    (file.originalName && file.originalName.toLowerCase().includes(searchTerm)) ||
                    (file.description && file.description.toLowerCase().includes(searchTerm)) ||
                    (file.category && file.category.toLowerCase().includes(searchTerm))
                );
                // Note: hasNextPage might not be perfectly accurate when in-memory search is used
                return { files: filtered, lastVisible, hasNextPage };
            }

            return { files, lastVisible, hasNextPage };
        } catch (error) {
            console.error('Error getting paginated files:', error);
            throw error;
        }
    }

    // Add a file to recently viewed for a user
    async addToRecentlyViewed(fileId, userId) {
        try {
            // Verify the file exists
            const file = await this.getFileById(fileId);
            if (!file) {
                throw new Error(`File with ID ${fileId} not found`);
            }
            
            // Check for existing entry
            const existingSnapshot = await this.db.collection('recentlyViewed')
                .where('userId', '==', userId)
                .where('fileId', '==', fileId)
                .get();
            
            if (existingSnapshot.size > 0) {
                // Update existing entry
                const doc = existingSnapshot.docs[0];
                await doc.ref.update({
                    viewedAt: convertToTimestamp(new Date())
                });
            } else {
                // Add new entry
                const newEntry = {
                    userId: userId,
                    fileId: fileId,
                    viewedAt: convertToTimestamp(new Date())
                };
                
                await this.db.collection('recentlyViewed').add(newEntry);
            }
            
            // Clean up old entries (keep only the most recent 10 per user)
            const allEntriesSnapshot = await this.db.collection('recentlyViewed')
                .where('userId', '==', userId)
                .get();
            
            if (allEntriesSnapshot.size > 10) {
                const entries = [];
                allEntriesSnapshot.forEach(doc => {
                    const data = doc.data();
                    entries.push({
                        id: doc.id,
                        viewedAt: convertTimestamp(data.viewedAt)
                    });
                });
                
                // Sort by viewedAt and keep only the 10 most recent
                const sortedEntries = entries
                    .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt))
                    .slice(10);
                
                // Delete the older entries
                const deletePromises = sortedEntries.map(entry => 
                    this.db.collection('recentlyViewed').doc(entry.id).delete()
                );
                
                await Promise.all(deletePromises);
            }
            
        } catch (error) {
            console.error('Error adding to recently viewed:', error);
            throw error;
        }
    }

    // Get recently viewed files for a user
    async getRecentlyViewedFiles(userId, limit = 4) {
        try {
            // Use a simpler query that doesn't require a composite index
            const snapshot = await this.db.collection('recentlyViewed')
                .where('userId', '==', userId)
                .get();
            
            if (snapshot.empty) {
                return [];
            }
            
            // Get all entries and sort them in memory
            const entries = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                entries.push({
                    id: doc.id,
                    ...data,
                    viewedAt: convertTimestamp(data.viewedAt)
                });
            });
            
            // Sort by viewedAt (most recent first) and limit
            const sortedEntries = entries
                .sort((a, b) => b.viewedAt - a.viewedAt)
                .slice(0, limit);
            
            // Get the actual file data for each recently viewed entry
            const filePromises = sortedEntries.map(async (entry) => {
                try {
                    const file = await this.getFileById(entry.fileId);
                    return file ? { ...file, viewedAt: entry.viewedAt } : null;
                } catch (error) {
                    console.warn(`File ${entry.fileId} not found, skipping from recently viewed`);
                    return null;
                }
            });
            
            const files = await Promise.all(filePromises);
            const validFiles = files.filter(file => file !== null);
            
            return validFiles;
        } catch (error) {
            console.error('Error getting recently viewed files:', error);
            throw error;
        }
    }

    // Clear recently viewed files for a user
    async clearRecentlyViewedFiles(userId) {
        try {
            const recentlyViewedRef = this.db.collection('recentlyViewed');
            
            const snapshot = await recentlyViewedRef
                .where('userId', '==', userId)
                .get();

            const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
            await Promise.all(deletePromises);

            return { message: 'Recently viewed files cleared' };
        } catch (error) {
            console.error('Error clearing recently viewed files:', error);
            throw error;
        }
    }
}

const fileServiceInstance = new FileService();
fileServiceInstance.searchFilesWithAlgolia = searchFilesWithAlgolia;
module.exports = fileServiceInstance; 