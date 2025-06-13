import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  BookOpen,
  TrendingUp,
  Settings,
  Eye
} from 'lucide-react';

interface Semester {
  _id: string;
  name: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  isActive: boolean;
  isRegistrationOpen: boolean;
  description?: string;
  createdBy: {
    username: string;
  };
  createdAt: string;
}

interface SemesterStats {
  courseCount: number;
  totalStudents: number;
  registrationStats: Array<{
    _id: string;
    count: number;
  }>;
  popularCourses: Array<{
    course: {
      courseName: string;
      courseCode: string;
    };
    registrationCount: number;
  }>;
}

const SemesterManagement: React.FC = () => {
  const { user } = useAuth();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [semesterStats, setSemesterStats] = useState<SemesterStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    academicYear: new Date().getFullYear().toString(),
    startDate: '',
    endDate: '',
    registrationStartDate: '',
    registrationEndDate: '',
    isActive: false,
    isRegistrationOpen: false,
    description: ''
  });

  useEffect(() => {
    fetchSemesters();
  }, [currentPage, searchTerm]);

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      // Mock semesters data
      const mockSemesters: Semester[] = [
        {
          _id: '1',
          name: '2025 First Semester',
          academicYear: '2025',
          startDate: '2025-02-01T00:00:00Z',
          endDate: '2025-06-30T00:00:00Z',
          registrationStartDate: '2025-01-15T00:00:00Z',
          registrationEndDate: '2025-02-15T00:00:00Z',
          isActive: true,
          isRegistrationOpen: true,
          description: 'First semester of academic year 2025',
          createdBy: { username: 'admin' },
          createdAt: '2024-12-01T00:00:00Z'
        },
        {
          _id: '2',
          name: '2024 Second Semester',
          academicYear: '2024',
          startDate: '2024-09-01T00:00:00Z',
          endDate: '2024-12-31T00:00:00Z',
          registrationStartDate: '2024-08-15T00:00:00Z',
          registrationEndDate: '2024-09-15T00:00:00Z',
          isActive: false,
          isRegistrationOpen: false,
          description: 'Second semester of academic year 2024',
          createdBy: { username: 'admin' },
          createdAt: '2024-07-01T00:00:00Z'
        }
      ];

      let filteredSemesters = mockSemesters;
      if (searchTerm) {
        filteredSemesters = filteredSemesters.filter(semester =>
          semester.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          semester.academicYear.includes(searchTerm)
        );
      }

      setSemesters(filteredSemesters);
      setTotalPages(1);
    } catch (error) {
      console.error('Failed to fetch semesters:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSemesterStats = async (semesterId: string) => {
    try {
      // Mock semester statistics
      const mockStats: SemesterStats = {
        courseCount: 15,
        totalStudents: 245,
        registrationStats: [
          { _id: 'registered', count: 180 },
          { _id: 'pending', count: 25 },
          { _id: 'dropped', count: 15 }
        ],
        popularCourses: [
          {
            course: { courseName: 'Machine Learning Fundamentals', courseCode: 'CS402' },
            registrationCount: 45
          },
          {
            course: { courseName: 'Advanced Database Systems', courseCode: 'CS401' },
            registrationCount: 38
          },
          {
            course: { courseName: 'Software Engineering Principles', courseCode: 'CS403' },
            registrationCount: 35
          }
        ]
      };
      setSemesterStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch semester statistics:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Mock semester creation/update
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingSemester) {
        setSemesters(prev => prev.map(sem =>
          sem._id === editingSemester._id
            ? { ...sem, ...formData, createdBy: { username: user?.username || 'admin' } }
            : sem
        ));
      } else {
        const newSemester: Semester = {
          _id: Date.now().toString(),
          ...formData,
          createdBy: { username: user?.username || 'admin' },
          createdAt: new Date().toISOString()
        };
        setSemesters(prev => [newSemester, ...prev]);
      }

      setShowForm(false);
      setEditingSemester(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save semester:', error);
    }
  };

  const handleEdit = (semester: Semester) => {
    setEditingSemester(semester);
    setFormData({
      name: semester.name,
      academicYear: semester.academicYear,
      startDate: semester.startDate.split('T')[0],
      endDate: semester.endDate.split('T')[0],
      registrationStartDate: semester.registrationStartDate.split('T')[0],
      registrationEndDate: semester.registrationEndDate.split('T')[0],
      isActive: semester.isActive,
      isRegistrationOpen: semester.isRegistrationOpen,
      description: semester.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (semesterId: string) => {
    if (window.confirm('Are you sure you want to delete this semester?')) {
      try {
        setSemesters(prev => prev.filter(sem => sem._id !== semesterId));
      } catch (error) {
        console.error('Failed to delete semester:', error);
      }
    }
  };

  const handleSetActive = async (semesterId: string) => {
    try {
      setSemesters(prev => prev.map(sem => ({
        ...sem,
        isActive: sem._id === semesterId
      })));
    } catch (error) {
      console.error('Failed to set active semester:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      academicYear: new Date().getFullYear().toString(),
      startDate: '',
      endDate: '',
      registrationStartDate: '',
      registrationEndDate: '',
      isActive: false,
      isRegistrationOpen: false,
      description: ''
    });
  };

  const handleViewDetails = (semester: Semester) => {
    setSelectedSemester(semester);
    fetchSemesterStats(semester._id);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-500">Only administrators can manage semesters.</p>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Semester Management</h1>
          <p className="text-gray-600 mt-1">Manage academic semesters and registration periods</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Semester</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search semesters by name or academic year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Semesters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {semesters.map((semester) => (
          <div key={semester._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{semester.name}</h3>
                  {semester.isActive && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">Academic Year: {semester.academicYear}</p>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleViewDetails(semester)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEdit(semester)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(semester._id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Semester Period:</span>
                <span className="font-medium">
                  {new Date(semester.startDate).toLocaleDateString()} - {new Date(semester.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Registration:</span>
                <span className="font-medium">
                  {new Date(semester.registrationStartDate).toLocaleDateString()} - {new Date(semester.registrationEndDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Registration Status:</span>
                <div className="flex items-center space-x-1">
                  {semester.isRegistrationOpen ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 font-medium">Open</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-600 font-medium">Closed</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {semester.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{semester.description}</p>
            )}

            <div className="flex justify-between items-center">
              {!semester.isActive && (
                <button
                  onClick={() => handleSetActive(semester._id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Set as Active
                </button>
              )}
              <span className="text-xs text-gray-500">
                Created: {new Date(semester.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {semesters.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No semesters found</h3>
          <p className="text-gray-500">
            {searchTerm
              ? 'Try adjusting your search criteria.'
              : 'Start by creating your first semester.'
            }
          </p>
        </div>
      )}

      {/* Semester Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-full overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingSemester ? 'Edit Semester' : 'Add New Semester'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., 2025 First Semester"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year *
                  </label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    required
                    placeholder="e.g., 2025"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.registrationStartDate}
                    onChange={(e) => setFormData({ ...formData, registrationStartDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.registrationEndDate}
                    onChange={(e) => setFormData({ ...formData, registrationEndDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
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
                  placeholder="Optional description for this semester"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Set as active semester
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isRegistrationOpen"
                    checked={formData.isRegistrationOpen}
                    onChange={(e) => setFormData({ ...formData, isRegistrationOpen: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isRegistrationOpen" className="ml-2 block text-sm text-gray-900">
                    Open for registration
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSemester(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingSemester ? 'Update' : 'Create'} Semester
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Semester Details Modal */}
      {selectedSemester && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-full overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Semester Details</h3>
                <button
                  onClick={() => setSelectedSemester(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Semester Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Semester Information</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedSemester.name}</p>
                    <p><span className="font-medium">Academic Year:</span> {selectedSemester.academicYear}</p>
                    <p><span className="font-medium">Period:</span> {new Date(selectedSemester.startDate).toLocaleDateString()} - {new Date(selectedSemester.endDate).toLocaleDateString()}</p>
                    <p><span className="font-medium">Registration:</span> {new Date(selectedSemester.registrationStartDate).toLocaleDateString()} - {new Date(selectedSemester.registrationEndDate).toLocaleDateString()}</p>
                    <p><span className="font-medium">Status:</span> {selectedSemester.isActive ? 'Active' : 'Inactive'}</p>
                    <p><span className="font-medium">Registration:</span> {selectedSemester.isRegistrationOpen ? 'Open' : 'Closed'}</p>
                  </div>
                </div>

                {/* Statistics */}
                {semesterStats && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Statistics</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">Courses</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-900">{semesterStats.courseCount}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Users className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-green-600">Students</span>
                        </div>
                        <p className="text-2xl font-bold text-green-900">{semesterStats.totalStudents}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-900">Registration Status</h5>
                      {semesterStats.registrationStats.map((stat) => (
                        <div key={stat._id} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">{stat._id}:</span>
                          <span className="font-medium">{stat.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Courses */}
                {semesterStats && semesterStats.popularCourses.length > 0 && (
                  <div className="lg:col-span-2">
                    <h4 className="font-semibold text-gray-900 mb-3">Most Popular Courses</h4>
                    <div className="space-y-2">
                      {semesterStats.popularCourses.map((course, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{course.course.courseName}</p>
                            <p className="text-sm text-gray-600">{course.course.courseCode}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-blue-600">{course.registrationCount}</p>
                            <p className="text-xs text-gray-500">registrations</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SemesterManagement;