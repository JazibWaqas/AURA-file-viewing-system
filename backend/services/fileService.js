const { getFirestore, getBucket, generateId, convertTimestamp, convertToTimestamp } = require('../config/firebase');

class FileService {
    constructor() {
        this.db = getFirestore();
        this.bucket = getBucket();
        this.collection = 'files';
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
                const searchTerm = filters.search.toLowerCase();
                // We'll filter in memory for now
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
                    ...data,
                    createdAt: convertTimestamp(data.createdAt),
                    updatedAt: convertTimestamp(data.updatedAt)
                });
            });

            // Apply search filter in memory if needed
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                return files.filter(file => 
                    file.originalName.toLowerCase().includes(searchTerm) ||
                    (file.description && file.description.toLowerCase().includes(searchTerm)) ||
                    file.category.toLowerCase().includes(searchTerm)
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
}

module.exports = new FileService(); 