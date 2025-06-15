import React, { useState, useEffect } from 'react';
import { instructorApi, courseApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Award,
  Clock
} from 'lucide-react';

interface Instructor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  bio: string;
  photoUrl: string;
  qualifications: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  experience: number;
  specializations: string[];
  officeHours: string;
  officeLocation: string;
  coursesTaught: Array<{
    _id: string;
    courseName: string;
    courseCode: string;
  }>;
  createdAt: string;
}

const InstructorManagement: React.FC = () => {
  const { user } = useAuth();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    bio: '',
    photoUrl: '',
    qualifications: [{ degree: '', institution: '', year: new Date().getFullYear() }],
    experience: 0,
    specializations: [''],
    officeHours: '',
    officeLocation: ''
  });

  useEffect(() => {
    fetchInstructors();
    if (user?.role === 'admin') {
      fetchCourses();
    }
  }, [currentPage, searchTerm, departmentFilter]);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        search: searchTerm,
        department: departmentFilter !== 'All' ? departmentFilter : undefined
      };

      const response = await instructorApi.getAll(params);
      setInstructors(response.data.instructors);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch instructors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await courseApi.getAll();
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        specializations: formData.specializations.filter(s => s.trim() !== ''),
        qualifications: formData.qualifications.filter(q => q.degree && q.institution)
      };

      if (editingInstructor) {
        await instructorApi.update(editingInstructor._id, submitData);
      } else {
        await instructorApi.create(submitData);
      }

      setShowForm(false);
      setEditingInstructor(null);
      resetForm();
      fetchInstructors();
    } catch (error) {
      console.error('Failed to save instructor:', error);
    }
  };

  const handleEdit = (instructor: Instructor) => {
    setEditingInstructor(instructor);
    setFormData({
      name: instructor.name,
      email: instructor.email,
      phone: instructor.phone,
      department: instructor.department,
      bio: instructor.bio || '',
      photoUrl: instructor.photoUrl || '',
      qualifications: instructor.qualifications.length > 0 ? instructor.qualifications : [{ degree: '', institution: '', year: new Date().getFullYear() }],
      experience: instructor.experience || 0,
      specializations: instructor.specializations.length > 0 ? instructor.specializations : [''],
      officeHours: instructor.officeHours || '',
      officeLocation: instructor.officeLocation || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (instructorId: string) => {
    if (window.confirm('Are you sure you want to delete this instructor?')) {
      try {
        await instructorApi.delete(instructorId);
        fetchInstructors();
      } catch (error) {
        console.error('Failed to delete instructor:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: '',
      bio: '',
      photoUrl: '',
      qualifications: [{ degree: '', institution: '', year: new Date().getFullYear() }],
      experience: 0,
      specializations: [''],
      officeHours: '',
      officeLocation: ''
    });
  };

  const addQualification = () => {
    setFormData(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, { degree: '', institution: '', year: new Date().getFullYear() }]
    }));
  };

  const removeQualification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  const addSpecialization = () => {
    setFormData(prev => ({
      ...prev,
      specializations: [...prev.specializations, '']
    }));
  };

  const removeSpecialization = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }));
  };

  const departments = [...new Set(instructors.map(i => i.department))];

  if (loading && instructors.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Instructor Management</h1>
          <p className="text-gray-600 mt-1">Manage faculty and instructor information</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Instructor</span>
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
                placeholder="Search instructors by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Instructors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {instructors.map((instructor) => (
          <div key={instructor._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4 mb-4">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                {instructor.photoUrl ? (
                  <img
                    src={instructor.photoUrl}
                    alt={instructor.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{instructor.name}</h3>
                <p className="text-sm text-gray-600">{instructor.department}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span className="truncate">{instructor.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{instructor.phone}</span>
              </div>
              {instructor.experience > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Award className="h-4 w-4" />
                  <span>{instructor.experience} years experience</span>
                </div>
              )}
            </div>

            {instructor.coursesTaught.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Courses:</p>
                <div className="flex flex-wrap gap-1">
                  {instructor.coursesTaught.slice(0, 2).map((course) => (
                    <span key={course._id} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {course.courseCode}
                    </span>
                  ))}
                  {instructor.coursesTaught.length > 2 && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                      +{instructor.coursesTaught.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <button
                onClick={() => setSelectedInstructor(instructor)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Details
              </button>
              {user?.role === 'admin' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(instructor)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(instructor._id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

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

      {/* Instructor Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-full overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingInstructor ? 'Edit Instructor' : 'Add New Instructor'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Photo URL
                    </label>
                    <input
                      type="url"
                      value={formData.photoUrl}
                      onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Office Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Office Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Office Location
                    </label>
                    <input
                      type="text"
                      value={formData.officeLocation}
                      onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Office Hours
                    </label>
                    <input
                      type="text"
                      value={formData.officeHours}
                      onChange={(e) => setFormData({ ...formData, officeHours: e.target.value })}
                      placeholder="e.g., Mon-Fri 9:00-11:00 AM"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Qualifications */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Qualifications</h4>
                  <button
                    type="button"
                    onClick={addQualification}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Add Qualification
                  </button>
                </div>
                {formData.qualifications.map((qual, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Degree
                      </label>
                      <input
                        type="text"
                        value={qual.degree}
                        onChange={(e) => {
                          const newQuals = [...formData.qualifications];
                          newQuals[index].degree = e.target.value;
                          setFormData({ ...formData, qualifications: newQuals });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Institution
                      </label>
                      <input
                        type="text"
                        value={qual.institution}
                        onChange={(e) => {
                          const newQuals = [...formData.qualifications];
                          newQuals[index].institution = e.target.value;
                          setFormData({ ...formData, qualifications: newQuals });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-end space-x-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Year
                        </label>
                        <input
                          type="number"
                          min="1950"
                          max={new Date().getFullYear()}
                          value={qual.year}
                          onChange={(e) => {
                            const newQuals = [...formData.qualifications];
                            newQuals[index].year = parseInt(e.target.value);
                            setFormData({ ...formData, qualifications: newQuals });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      {formData.qualifications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQualification(index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Specializations */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Specializations</h4>
                  <button
                    type="button"
                    onClick={addSpecialization}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Add Specialization
                  </button>
                </div>
                {formData.specializations.map((spec, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={spec}
                      onChange={(e) => {
                        const newSpecs = [...formData.specializations];
                        newSpecs[index] = e.target.value;
                        setFormData({ ...formData, specializations: newSpecs });
                      }}
                      placeholder="Enter specialization"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {formData.specializations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSpecialization(index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingInstructor(null);
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
                  {editingInstructor ? 'Update' : 'Create'} Instructor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Instructor Detail Modal */}
      {selectedInstructor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-full overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Instructor Details</h3>
                <button
                  onClick={() => setSelectedInstructor(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start space-x-6 mb-6">
                <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center">
                  {selectedInstructor.photoUrl ? (
                    <img
                      src={selectedInstructor.photoUrl}
                      alt={selectedInstructor.name}
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <GraduationCap className="h-12 w-12 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedInstructor.name}</h2>
                  <p className="text-lg text-gray-600">{selectedInstructor.department}</p>
                  {selectedInstructor.bio && (
                    <p className="text-gray-700 mt-2">{selectedInstructor.bio}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{selectedInstructor.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{selectedInstructor.phone}</span>
                    </div>
                    {selectedInstructor.officeLocation && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{selectedInstructor.officeLocation}</span>
                      </div>
                    )}
                    {selectedInstructor.officeHours && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{selectedInstructor.officeHours}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Experience & Specializations */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Experience & Specializations</h4>
                  <div className="space-y-3">
                    {selectedInstructor.experience > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Experience:</span>
                        <span className="ml-2 text-gray-600">{selectedInstructor.experience} years</span>
                      </div>
                    )}
                    {selectedInstructor.specializations.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Specializations:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedInstructor.specializations.map((spec, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Qualifications */}
                {selectedInstructor.qualifications.length > 0 && (
                  <div className="lg:col-span-2">
                    <h4 className="font-semibold text-gray-900 mb-3">Qualifications</h4>
                    <div className="space-y-2">
                      {selectedInstructor.qualifications.map((qual, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-900">{qual.degree}</div>
                          <div className="text-sm text-gray-600">{qual.institution} • {qual.year}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Courses Taught */}
                {selectedInstructor.coursesTaught.length > 0 && (
                  <div className="lg:col-span-2">
                    <h4 className="font-semibold text-gray-900 mb-3">Courses Taught</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedInstructor.coursesTaught.map((course) => (
                        <div key={course._id} className="p-3 border border-gray-200 rounded-lg">
                          <div className="font-medium text-gray-900">{course.courseName}</div>
                          <div className="text-sm text-gray-600">{course.courseCode}</div>
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

      {/* Empty State */}
      {instructors.length === 0 && !loading && (
        <div className="text-center py-12">
          <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No instructors found</h3>
          <p className="text-gray-500">
            {user?.role === 'admin'
              ? 'Start by adding your first instructor.'
              : 'Instructors will appear here once they are added by administrators.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default InstructorManagement;