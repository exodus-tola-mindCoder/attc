import React, { useState, useEffect } from 'react';
import { graduationGalleryApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Building,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Upload,
  Tag
} from 'lucide-react';

interface GraduationImage {
  _id: string;
  imageUrl: string;
  year: number;
  department: string;
  caption?: string;
  tags: string[];
  uploadedBy: {
    username: string;
  };
  uploadDate: string;
  metadata?: {
    originalName?: string;
    fileSize?: number;
    dimensions?: {
      width: number;
      height: number;
    };
  };
}

const GraduationGallery: React.FC = () => {
  const { user } = useAuth();
  const [images, setImages] = useState<GraduationImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    year: 'all',
    department: 'all'
  });
  const [availableFilters, setAvailableFilters] = useState({
    years: [] as number[],
    departments: [] as string[]
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GraduationImage | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [editingImage, setEditingImage] = useState<GraduationImage | null>(null);

  const [formData, setFormData] = useState({
    imageUrl: '',
    year: new Date().getFullYear(),
    department: '',
    caption: '',
    tags: ''
  });

  useEffect(() => {
    fetchImages();
  }, [currentPage, searchTerm, filters]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        ...(filters.year !== 'all' && { year: filters.year }),
        ...(filters.department !== 'all' && { department: filters.department }),
        ...(searchTerm && { search: searchTerm })
      };

      const response = await graduationGalleryApi.getAll(params);
      setImages(response.data.data.images);
      setTotalPages(response.data.data.pagination.totalPages);

      if (response.data.data.filters) {
        setAvailableFilters({
          years: response.data.data.filters.availableYears,
          departments: response.data.data.filters.availableDepartments
        });
      }
    } catch (error) {
      console.error('Failed to fetch graduation images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag).join(',')
      };

      if (editingImage) {
        await graduationGalleryApi.update(editingImage._id, submitData);
      } else {
        await graduationGalleryApi.upload(submitData);
      }

      setShowUploadForm(false);
      setEditingImage(null);
      resetForm();
      fetchImages();
    } catch (error: any) {
      console.error('Failed to save graduation image:', error);
      alert(error.response?.data?.message || 'Failed to save image');
    }
  };

  const handleEdit = (image: GraduationImage) => {
    setEditingImage(image);
    setFormData({
      imageUrl: image.imageUrl,
      year: image.year,
      department: image.department,
      caption: image.caption || '',
      tags: image.tags.join(', ')
    });
    setShowUploadForm(true);
  };

  const handleDelete = async (imageId: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await graduationGalleryApi.delete(imageId);
        fetchImages();
      } catch (error) {
        console.error('Failed to delete image:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      imageUrl: '',
      year: new Date().getFullYear(),
      department: '',
      caption: '',
      tags: ''
    });
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(-1);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const clearFilters = () => {
    setFilters({ year: 'all', department: 'all' });
    setSearchTerm('');
    setCurrentPage(1);
  };

  if (loading && images.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">🎓 Graduation Ceremony Gallery</h1>
          <p className="text-gray-600 mt-1">Celebrate our graduates through the years</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowUploadForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Image</span>
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
                placeholder="Search by caption, department, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={filters.year}
              onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Years</option>
              {availableFilters.years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={filters.department}
              onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Departments</option>
              {availableFilters.departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((image, index) => (
          <div key={image._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
            <div className="relative aspect-square">
              <img
                src={image.imageUrl}
                alt={image.caption || `Graduation ${image.year}`}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => openLightbox(index)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=400';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {user?.role === 'admin' && (
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(image);
                    }}
                    className="p-1 bg-white bg-opacity-80 rounded-full text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(image._id);
                    }}
                    className="p-1 bg-white bg-opacity-80 rounded-full text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">{image.year}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{image.department}</span>
                </div>
              </div>
              {image.caption && (
                <p className="text-sm text-gray-700 mb-2 line-clamp-2">{image.caption}</p>
              )}
              {image.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {image.tags.slice(0, 2).map((tag, tagIndex) => (
                    <span key={tagIndex} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                  {image.tags.length > 2 && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                      +{image.tags.length - 2} more
                    </span>
                  )}
                </div>
              )}
              <div className="text-xs text-gray-500">
                Uploaded by {image.uploadedBy.username} • {new Date(image.uploadDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {images.length === 0 && !loading && (
        <div className="text-center py-12">
          <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No graduation images found</h3>
          <p className="text-gray-500">
            {user?.role === 'admin'
              ? 'Start by uploading your first graduation ceremony image.'
              : 'Graduation ceremony images will appear here once they are uploaded.'
            }
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Upload Form Modal */}
      {showUploadForm && user?.role === 'admin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-full overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingImage ? 'Edit Graduation Image' : 'Upload Graduation Image'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL *
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  required
                  placeholder="https://example.com/graduation-image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Graduation Year *
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 10}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                    placeholder="e.g., Computer Science"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caption (Optional)
                </label>
                <textarea
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  rows={3}
                  maxLength={500}
                  placeholder="Describe this graduation moment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.caption.length}/500 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (Optional)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="ceremony, celebration, achievement (comma-separated)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate tags with commas
                </p>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadForm(false);
                    setEditingImage(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>{editingImage ? 'Update' : 'Upload'} Image</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex >= 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="h-8 w-8" />
            </button>

            <div className="flex items-center justify-center h-full">
              <button
                onClick={prevImage}
                className="absolute left-4 text-white hover:text-gray-300 z-10"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>

              <div className="text-center">
                <img
                  src={images[lightboxIndex]?.imageUrl}
                  alt={images[lightboxIndex]?.caption}
                  className="max-w-full max-h-[80vh] object-contain"
                />
                <div className="mt-4 text-white">
                  <h3 className="text-xl font-semibold mb-2">
                    {images[lightboxIndex]?.department} - {images[lightboxIndex]?.year}
                  </h3>
                  {images[lightboxIndex]?.caption && (
                    <p className="text-gray-300 max-w-2xl mx-auto">
                      {images[lightboxIndex].caption}
                    </p>
                  )}
                  <div className="flex items-center justify-center space-x-4 mt-2 text-sm text-gray-400">
                    <span>Uploaded by {images[lightboxIndex]?.uploadedBy.username}</span>
                    <span>•</span>
                    <span>{new Date(images[lightboxIndex]?.uploadDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={nextImage}
                className="absolute right-4 text-white hover:text-gray-300 z-10"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
              {lightboxIndex + 1} of {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraduationGallery;