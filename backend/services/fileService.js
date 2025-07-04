const { db, bucket } = require('../config/firebase');

// Helper Functions
const generateId = () => db.collection('tmp').doc().id;
const convertTimestamp = (ts) => ts && ts.toDate ? ts.toDate() : ts;
const convertToTimestamp = (date) => date; // Firestore admin handles Date objects automatically

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
                updatedAt: convertToTimestamp(now)
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
            console.log('Starting file upload to Firebase Storage...');
            console.log('File details:', {
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                bufferLength: file.buffer ? file.buffer.length : 'No buffer'
            });

            const filePath = `uploads/${Date.now()}_${fileName}`;
            console.log('File path:', filePath);
            
            const fileRef = this.bucket.file(filePath);
            console.log('Bucket name:', this.bucket.name);
            
            // Upload the buffer directly to Firebase Storage
            console.log('Uploading file buffer to Firebase Storage...');
            await fileRef.save(file.buffer, {
                metadata: {
                    contentType: file.mimetype,
                    metadata: {
                        originalName: file.originalname
                    }
                }
            });

            console.log('File uploaded successfully, making it public...');
            // Make the file publicly readable
            await fileRef.makePublic();
            
            // Get the public URL
            const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${filePath}`;
            console.log('Public URL:', publicUrl);
            
            return {
                path: filePath,
                url: publicUrl,
                size: file.size
            };
        } catch (error) {
            console.error('Error uploading file to storage:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                status: error.status
            });
            
            // Provide more specific error messages
            if (error.code === 'ENOTFOUND' || error.message.includes('bucket')) {
                throw new Error(`Firebase Storage bucket not found. Please check your Firebase project configuration. Bucket: ${this.bucket.name}`);
            } else if (error.code === 'PERMISSION_DENIED') {
                throw new Error('Permission denied. Please check your Firebase Storage security rules. Go to Firebase Console > Storage > Rules and update them to allow file uploads.');
            } else if (error.code === 'UNAUTHENTICATED') {
                throw new Error('Authentication failed. Please check your Firebase service account credentials.');
            } else {
                throw new Error(`Upload failed: ${error.message}`);
            }
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
                const records = parse(fileContent, { columns: true, skip_empty_lines: true });
                if (records.length > 0) {
                    headers = Object.keys(records[0]);
                    rows = records.map(record => headers.map(header => record[header]));
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
}

module.exports = new FileService(); 