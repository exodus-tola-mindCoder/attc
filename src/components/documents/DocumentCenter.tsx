import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Download,
  Upload,
  Search,
  Eye,
  Trash2,
  Plus
} from 'lucide-react';

interface Document {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: string;
  uploadedBy: {
    username: string;
  };
  uploadDate: string;
  downloadCount: number;
  isPublic: boolean;
}

const DocumentCenter: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'forms',
    isPublic: true
  });

  const categories = [
    { value: 'forms', label: 'Forms & Applications' },
    { value: 'guidelines', label: 'Guidelines & Policies' },
    { value: 'exam', label: 'Exam Information' },
    { value: 'academic', label: 'Academic Resources' },
    { value: 'administrative', label: 'Administrative' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchDocuments();
  }, [searchTerm, categoryFilter]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockDocuments: Document[] = [
        {
          _id: '1',
          title: 'Student Registration Form',
          description: 'Official form for new student registration',
          fileUrl: '#',
          fileName: 'student-registration-form.pdf',
          fileType: 'application/pdf',
          fileSize: 245760,
          category: 'forms',
          uploadedBy: { username: 'admin' },
          uploadDate: '2024-01-15T10:00:00Z',
          downloadCount: 156,
          isPublic: true
        },
        {
          _id: '2',
          title: 'Academic Calendar 2024',
          description: 'Complete academic calendar for the year 2024',
          fileUrl: '#',
          fileName: 'academic-calendar-2024.pdf',
          fileType: 'application/pdf',
          fileSize: 512000,
          category: 'academic',
          uploadedBy: { username: 'admin' },
          uploadDate: '2024-01-10T09:00:00Z',
          downloadCount: 89,
          isPublic: true
        },
        {
          _id: '3',
          title: 'Exam Guidelines',
          description: 'Rules and regulations for examinations',
          fileUrl: '#',
          fileName: 'exam-guidelines.pdf',
          fileType: 'application/pdf',
          fileSize: 189440,
          category: 'exam',
          uploadedBy: { username: 'admin' },
          uploadDate: '2024-01-08T14:30:00Z',
          downloadCount: 234,
          isPublic: true
        },
        {
          _id: '4',
          title: 'Leave Application Form',
          description: 'Form for applying academic leave',
          fileUrl: '#',
          fileName: 'leave-application-form.docx',
          fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          fileSize: 98304,
          category: 'forms',
          uploadedBy: { username: 'admin' },
          uploadDate: '2024-01-05T11:15:00Z',
          downloadCount: 67,
          isPublic: true
        }
      ];

      // Apply filters
      let filteredDocs = mockDocuments;

      if (searchTerm) {
        filteredDocs = filteredDocs.filter(doc =>
          doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (categoryFilter !== 'all') {
        filteredDocs = filteredDocs.filter(doc => doc.category === categoryFilter);
      }

      setDocuments(filteredDocs);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (document: Document) => {
    // In a real implementation, this would download the actual file
    console.log('Downloading:', document.fileName);

    // Create a mock download
    const link = document.createElement('a');
    link.href = '#';
    link.download = document.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Mock upload implementation
      console.log('Uploading document:', formData);
      setShowUploadForm(false);
      setFormData({
        title: '',
        description: '',
        category: 'forms',
        isPublic: true
      });
      fetchDocuments();
    } catch (error) {
      console.error('Failed to upload document:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('image')) return '🖼️';
    return '📁';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Center</h1>
          <p className="text-gray-600 mt-1">Access university forms, guidelines, and resources</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowUploadForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((document) => (
          <div key={document._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{getFileIcon(document.fileType)}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{document.title}</h3>
                  <p className="text-sm text-gray-500 capitalize">{document.category.replace('_', ' ')}</p>
                </div>
              </div>
              {user?.role === 'admin' && (
                <div className="flex space-x-1">
                  <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {document.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{document.description}</p>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">File size:</span>
                <span className="font-medium">{formatFileSize(document.fileSize)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Downloads:</span>
                <span className="font-medium">{document.downloadCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Uploaded:</span>
                <span className="font-medium">{new Date(document.uploadDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDownload(document)}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
              <button
                onClick={() => setSelectedDocument(document)}
                className="p-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {documents.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-500">
            {searchTerm || categoryFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Documents will appear here once they are uploaded.'
            }
          </p>
        </div>
      )}

      {/* Upload Form Modal */}
      {showUploadForm && user?.role === 'admin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-full overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Upload Document</h3>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter document title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of the document"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOC, DOCX, XLS, XLSX (max 10MB)
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                  Make this document publicly accessible
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upload Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-full overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Document Details</h3>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{selectedDocument.title}</h4>
                  {selectedDocument.description && (
                    <p className="text-gray-700">{selectedDocument.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Category</p>
                    <p className="text-sm text-gray-600 capitalize">{selectedDocument.category.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">File Size</p>
                    <p className="text-sm text-gray-600">{formatFileSize(selectedDocument.fileSize)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Downloads</p>
                    <p className="text-sm text-gray-600">{selectedDocument.downloadCount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Uploaded By</p>
                    <p className="text-sm text-gray-600">{selectedDocument.uploadedBy.username}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Upload Date</p>
                  <p className="text-sm text-gray-600">{new Date(selectedDocument.uploadDate).toLocaleString()}</p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => handleDownload(selectedDocument)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download {selectedDocument.fileName}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentCenter;