import React, { useState, useEffect } from 'react';
import { departmentApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Building,
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Users,
  BookOpen,
  Award,
  Phone,
  Mail,
  Globe
} from 'lucide-react';

interface Department {
  _id: string;
  name: string;
  code: string;
  head: string;
  description: string;
  rules: string[];
  entranceRequirements: string[];
  programsOffered: Array<{
    name: string;
    duration: string;
    degree: string;
    description?: string;
  }>;
  faculty: string;
  establishedYear?: number;
  location?: {
    building?: string;
    floor?: string;
    room?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  statistics: {
    totalStudents: number;
    totalInstructors: number;
    totalCourses: number;
  };
  createdAt: string;
}

const DepartmentManagement: React.FC = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    head: '',
    description: '',
    rules: [''],
    entranceRequirements: [''],
    programsOffered: [{ name: '', duration: '', degree: 'Bachelor', description: '' }],
    faculty: '',
    establishedYear: new Date().getFullYear(),
    location: {
      building: '',
      floor: '',
      room: ''
    },
    contact: {
      phone: '',
      email: '',
      website: ''
    }
  });

  useEffect(() => {
    fetchDepartments();
  }, [currentPage, searchTerm, facultyFilter]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        search: searchTerm,
        faculty: facultyFilter !== 'All' ? facultyFilter : undefined
      };

      const response = await departmentApi.getAll(params);
      setDepartments(response.data.departments);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        rules: formData.rules.filter(rule => rule.trim() !== ''),
        entranceRequirements: formData.entranceRequirements.filter(req => req.trim() !== ''),
        programsOffered: formData.programsOffered.filter(program => program.name.trim() !== '')
      };

      if (editingDepartment) {
        await departmentApi.update(editingDepartment._id, submitData);
      } else {
        await departmentApi.create(submitData);
      }

      setShowForm(false);
      setEditingDepartment(null);
      resetForm();
      fetchDepartments();
    } catch (error) {
      console.error('Failed to save department:', error);
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      code: department.code,
      head: department.head,
      description: department.description,
      rules: department.rules.length > 0 ? department.rules : [''],
      entranceRequirements: department.entranceRequirements.length > 0 ? department.entranceRequirements : [''],
      programsOffered: department.programsOffered.length > 0 ? department.programsOffered : [{ name: '', duration: '', degree: 'Bachelor', description: '' }],
      faculty: department.faculty,
      establishedYear: department.establishedYear || new Date().getFullYear(),
      location: department.location || { building: '', floor: '', room: '' },
      contact: department.contact || { phone: '', email: '', website: '' }
    });
    setShowForm(true);
  };

  const handleDelete = async (departmentId: string) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await departmentApi.delete(departmentId);
        fetchDepartments();
      } catch (error) {
        console.error('Failed to delete department:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      head: '',
      description: '',
      rules: [''],
      entranceRequirements: [''],
      programsOffered: [{ name: '', duration: '', degree: 'Bachelor', description: '' }],
      faculty: '',
      establishedYear: new Date().getFullYear(),
      location: {
        building: '',
        floor: '',
        room: ''
      },
      contact: {
        phone: '',
        email: '',
        website: ''
      }
    });
  };

  const addRule = () => {
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, '']
    }));
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      entranceRequirements: [...prev.entranceRequirements, '']
    }));
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      entranceRequirements: prev.entranceRequirements.filter((_, i) => i !== index)
    }));
  };

  const addProgram = () => {
    setFormData(prev => ({
      ...prev,
      programsOffered: [...prev.programsOffered, { name: '', duration: '', degree: 'Bachelor', description: '' }]
    }));
  };

  const removeProgram = (index: number) => {
    setFormData(prev => ({
      ...prev,
      programsOffered: prev.programsOffered.filter((_, i) => i !== index)
    }));
  };

  const faculties = [...new Set(departments.map(d => d.faculty))];

  if (loading && departments.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Department Management</h1>
          <p className="text-gray-600 mt-1">Manage university departments and programs</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Department</span>
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
                placeholder="Search departments by name, code, or head..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={facultyFilter}
              onChange={(e) => setFacultyFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Faculties</option>
              {faculties.map(faculty => (
                <option key={faculty} value={faculty}>{faculty}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((department) => (
          <div key={department._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{department.name}</h3>
                  <p className="text-sm text-blue-600 font-medium">{department.code}</p>
                </div>
              </div>
              {user?.role === 'admin' && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(department)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(department._id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Faculty</p>
                <p className="text-sm text-gray-600">{department.faculty}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Department Head</p>
                <p className="text-sm text-gray-600">{department.head}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Programs Offered</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {department.programsOffered.slice(0, 2).map((program, index) => (
                    <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {program.degree}
                    </span>
                  ))}
                  {department.programsOffered.length > 2 && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                      +{department.programsOffered.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">{department.statistics.totalStudents}</p>
                <p className="text-xs text-gray-500">Students</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Award className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">{department.statistics.totalInstructors}</p>
                <p className="text-xs text-gray-500">Instructors</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <BookOpen className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">{department.statistics.totalCourses}</p>
                <p className="text-xs text-gray-500">Courses</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setSelectedDepartment(department)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Details
              </button>
              {department.establishedYear && (
                <span className="text-xs text-gray-500">Est. {department.establishedYear}</span>
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

      {/* Department Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-full overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingDepartment ? 'Edit Department' : 'Add New Department'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department Name *
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
                      Department Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department Head *
                    </label>
                    <input
                      type="text"
                      value={formData.head}
                      onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Faculty *
                    </label>
                    <input
                      type="text"
                      value={formData.faculty}
                      onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Established Year
                    </label>
                    <input
                      type="number"
                      min="1800"
                      max={new Date().getFullYear()}
                      value={formData.establishedYear}
                      onChange={(e) => setFormData({ ...formData, establishedYear: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Location */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Location</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Building
                    </label>
                    <input
                      type="text"
                      value={formData.location.building}
                      onChange={(e) => setFormData({
                        ...formData,
                        location: { ...formData.location, building: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Floor
                    </label>
                    <input
                      type="text"
                      value={formData.location.floor}
                      onChange={(e) => setFormData({
                        ...formData,
                        location: { ...formData.location, floor: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room
                    </label>
                    <input
                      type="text"
                      value={formData.location.room}
                      onChange={(e) => setFormData({
                        ...formData,
                        location: { ...formData.location, room: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.contact.phone}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact: { ...formData.contact, phone: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.contact.email}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact: { ...formData.contact, email: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.contact.website}
                      onChange={(e) => setFormData({
                        ...formData,
                        contact: { ...formData.contact, website: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Programs Offered */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Programs Offered</h4>
                  <button
                    type="button"
                    onClick={addProgram}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Add Program
                  </button>
                </div>
                {formData.programsOffered.map((program, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Program Name
                      </label>
                      <input
                        type="text"
                        value={program.name}
                        onChange={(e) => {
                          const newPrograms = [...formData.programsOffered];
                          newPrograms[index].name = e.target.value;
                          setFormData({ ...formData, programsOffered: newPrograms });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={program.duration}

                        onChange={(e) => {
                          const newPrograms = [...formData.programsOffered];
                          newPrograms[index].duration = e.target.value;
                          setFormData({ ...formData, programsOffered: newPrograms });
                        }}
                        placeholder="e.g., 4 years"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Degree
                      </label>
                      <select
                        value={program.degree}
                        onChange={(e) => {
                          const newPrograms = [...formData.programsOffered];
                          newPrograms[index].degree = e.target.value;
                          setFormData({ ...formData, programsOffered: newPrograms });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Certificate">Certificate</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Bachelor">Bachelor</option>
                        <option value="Master">Master</option>
                        <option value="PhD">PhD</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      {formData.programsOffered.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProgram(index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Rules */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Department Rules</h4>
                  <button
                    type="button"
                    onClick={addRule}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Add Rule
                  </button>
                </div>
                {formData.rules.map((rule, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={rule}
                      onChange={(e) => {
                        const newRules = [...formData.rules];
                        newRules[index] = e.target.value;
                        setFormData({ ...formData, rules: newRules });
                      }}
                      placeholder="Enter department rule"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {formData.rules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRule(index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Entrance Requirements */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Entrance Requirements</h4>
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Add Requirement
                  </button>
                </div>
                {formData.entranceRequirements.map((requirement, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={requirement}
                      onChange={(e) => {
                        const newRequirements = [...formData.entranceRequirements];
                        newRequirements[index] = e.target.value;
                        setFormData({ ...formData, entranceRequirements: newRequirements });
                      }}
                      placeholder="Enter entrance requirement"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {formData.entranceRequirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
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
                    setEditingDepartment(null);
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
                  {editingDepartment ? 'Update' : 'Create'} Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Detail Modal */}
      {selectedDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-full overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Department Details</h3>
                <button
                  onClick={() => setSelectedDepartment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Basic Information</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedDepartment.name}</p>
                    <p><span className="font-medium">Code:</span> {selectedDepartment.code}</p>
                    <p><span className="font-medium">Faculty:</span> {selectedDepartment.faculty}</p>
                    <p><span className="font-medium">Head:</span> {selectedDepartment.head}</p>
                    {selectedDepartment.establishedYear && (
                      <p><span className="font-medium">Established:</span> {selectedDepartment.establishedYear}</p>
                    )}
                  </div>
                </div>

                {/* Contact & Location */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Contact & Location</h4>
                  <div className="space-y-2">
                    {selectedDepartment.location?.building && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>
                          {selectedDepartment.location.building}
                          {selectedDepartment.location.floor && `, Floor ${selectedDepartment.location.floor}`}
                          {selectedDepartment.location.room && `, Room ${selectedDepartment.location.room}`}
                        </span>
                      </div>
                    )}
                    {selectedDepartment.contact?.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedDepartment.contact.phone}</span>
                      </div>
                    )}
                    {selectedDepartment.contact?.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{selectedDepartment.contact.email}</span>
                      </div>
                    )}
                    {selectedDepartment.contact?.website && (
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <a href={selectedDepartment.contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          {selectedDepartment.contact.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="lg:col-span-2">
                  <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                  <p className="text-gray-700">{selectedDepartment.description}</p>
                </div>

                {/* Programs Offered */}
                {selectedDepartment.programsOffered.length > 0 && (
                  <div className="lg:col-span-2">
                    <h4 className="font-semibold text-gray-900 mb-3">Programs Offered</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedDepartment.programsOffered.map((program, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{program.name}</h5>
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {program.degree}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Duration: {program.duration}</p>
                          {program.description && (
                            <p className="text-sm text-gray-600 mt-1">{program.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rules */}
                {selectedDepartment.rules.length > 0 && (
                  <div className="lg:col-span-2">
                    <h4 className="font-semibold text-gray-900 mb-3">Department Rules</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedDepartment.rules.map((rule, index) => (
                        <li key={index} className="text-gray-700">{rule}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Entrance Requirements */}
                {selectedDepartment.entranceRequirements.length > 0 && (
                  <div className="lg:col-span-2">
                    <h4 className="font-semibold text-gray-900 mb-3">Entrance Requirements</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedDepartment.entranceRequirements.map((requirement, index) => (
                        <li key={index} className="text-gray-700">{requirement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {departments.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
          <p className="text-gray-500">
            {user?.role === 'admin'
              ? 'Start by adding your first department.'
              : 'Departments will appear here once they are added by administrators.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;