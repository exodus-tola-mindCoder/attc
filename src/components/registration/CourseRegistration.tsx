import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Trash2,
  Star,
  Users,
  Award
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
  isRegistrationCurrentlyOpen: boolean;
}

interface Course {
  _id: string;
  courseName: string;
  courseCode: string;
  description: string;
  credits: number;
  department: string;
  instructor: string;
  semesterId: Semester;
  isRegistered?: boolean;
}

interface Registration {
  _id: string;
  courseId: Course;
  semesterId: Semester;
  status: 'registered' | 'dropped' | 'pending' | 'approved' | 'rejected';
  registrationDate: string;
  dropDate?: string;
  grade?: number;
  notes?: string;
}

const CourseRegistration: React.FC = () => {
  const { user } = useAuth();
  const [activeSemester, setActiveSemester] = useState<Semester | null>(null);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    fetchActiveSemester();
  }, []);

  useEffect(() => {
    if (activeSemester) {
      fetchAvailableCourses();
      fetchMyRegistrations();
    }
  }, [activeSemester, searchTerm, departmentFilter]);

  const fetchActiveSemester = async () => {
    try {
      // Mock active semester data
      const mockSemester: Semester = {
        _id: '1',
        name: '2025 First Semester',
        academicYear: '2025',
        startDate: '2025-02-01T00:00:00Z',
        endDate: '2025-06-30T00:00:00Z',
        registrationStartDate: '2025-01-15T00:00:00Z',
        registrationEndDate: '2025-02-15T00:00:00Z',
        isActive: true,
        isRegistrationOpen: true,
        isRegistrationCurrentlyOpen: true
      };
      setActiveSemester(mockSemester);
    } catch (error) {
      console.error('Failed to fetch active semester:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      // Mock available courses data
      const mockCourses: Course[] = [
        {
          _id: '1',
          courseName: 'Advanced Database Systems',
          courseCode: 'CS401',
          description: 'Advanced concepts in database design, optimization, and distributed systems',
          credits: 4,
          department: 'Computer Science',
          instructor: 'Dr. Smith',
          semesterId: activeSemester!,
          isRegistered: false
        },
        {
          _id: '2',
          courseName: 'Machine Learning Fundamentals',
          courseCode: 'CS402',
          description: 'Introduction to machine learning algorithms and applications',
          credits: 3,
          department: 'Computer Science',
          instructor: 'Dr. Johnson',
          semesterId: activeSemester!,
          isRegistered: true
        },
        {
          _id: '3',
          courseName: 'Software Engineering Principles',
          courseCode: 'CS403',
          description: 'Software development lifecycle, design patterns, and best practices',
          credits: 3,
          department: 'Computer Science',
          instructor: 'Dr. Williams',
          semesterId: activeSemester!,
          isRegistered: false
        },
        {
          _id: '4',
          courseName: 'Digital Signal Processing',
          courseCode: 'EE301',
          description: 'Analysis and processing of digital signals and systems',
          credits: 4,
          department: 'Electrical Engineering',
          instructor: 'Dr. Brown',
          semesterId: activeSemester!,
          isRegistered: false
        },
        {
          _id: '5',
          courseName: 'Advanced Mathematics',
          courseCode: 'MATH301',
          description: 'Advanced calculus, linear algebra, and differential equations',
          credits: 4,
          department: 'Mathematics',
          instructor: 'Dr. Davis',
          semesterId: activeSemester!,
          isRegistered: false
        }
      ];

      let filteredCourses = mockCourses;

      if (searchTerm) {
        filteredCourses = filteredCourses.filter(course =>
          course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (departmentFilter !== 'all') {
        filteredCourses = filteredCourses.filter(course =>
          course.department === departmentFilter
        );
      }

      setAvailableCourses(filteredCourses);
    } catch (error) {
      console.error('Failed to fetch available courses:', error);
    }
  };

  const fetchMyRegistrations = async () => {
    try {
      // Mock registration data
      const mockRegistrations: Registration[] = [
        {
          _id: '1',
          courseId: {
            _id: '2',
            courseName: 'Machine Learning Fundamentals',
            courseCode: 'CS402',
            description: 'Introduction to machine learning algorithms and applications',
            credits: 3,
            department: 'Computer Science',
            instructor: 'Dr. Johnson',
            semesterId: activeSemester!
          },
          semesterId: activeSemester!,
          status: 'registered',
          registrationDate: '2025-01-20T10:00:00Z'
        }
      ];
      setMyRegistrations(mockRegistrations);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
    }
  };

  const handleCourseSelection = (courseId: string) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleRegisterCourses = async () => {
    if (selectedCourses.length === 0) return;

    setSubmitting(true);
    try {
      // Mock registration submission
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update available courses to mark as registered
      setAvailableCourses(prev => prev.map(course => ({
        ...course,
        isRegistered: selectedCourses.includes(course._id) ? true : course.isRegistered
      })));

      setSelectedCourses([]);
      fetchMyRegistrations();

      alert(`Successfully registered for ${selectedCourses.length} course(s)!`);
    } catch (error) {
      console.error('Failed to register for courses:', error);
      alert('Failed to register for courses. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDropCourse = async (registrationId: string) => {
    if (!window.confirm('Are you sure you want to drop this course?')) return;

    try {
      // Mock course drop
      await new Promise(resolve => setTimeout(resolve, 500));

      setMyRegistrations(prev => prev.map(reg =>
        reg._id === registrationId
          ? { ...reg, status: 'dropped' as const, dropDate: new Date().toISOString() }
          : reg
      ));

      alert('Course dropped successfully!');
    } catch (error) {
      console.error('Failed to drop course:', error);
      alert('Failed to drop course. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'registered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'dropped': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'dropped': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const departments = [...new Set(availableCourses.map(course => course.department))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!activeSemester) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Semester</h3>
        <p className="text-gray-500">There is no active semester for course registration.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Registration</h1>
          <p className="text-gray-600 mt-1">Register for courses in {activeSemester.name}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            {activeSemester.isRegistrationCurrentlyOpen ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-600 font-medium">Registration Open</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-600 font-medium">Registration Closed</span>
              </>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Ends: {new Date(activeSemester.registrationEndDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Semester Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-900">{activeSemester.name}</h2>
            <p className="text-blue-700 mt-1">Academic Year: {activeSemester.academicYear}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-4 text-sm text-blue-700">
              <div>
                <span className="font-medium">Semester:</span>
                <p>{new Date(activeSemester.startDate).toLocaleDateString()} - {new Date(activeSemester.endDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="font-medium">Registration:</span>
                <p>{new Date(activeSemester.registrationStartDate).toLocaleDateString()} - {new Date(activeSemester.registrationEndDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('available')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'available'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Available Courses</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('registered')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'registered'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>My Registrations ({myRegistrations.length})</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Available Courses Tab */}
          {activeTab === 'available' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search courses by name, code, or description..."
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
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>

                  {selectedCourses.length > 0 && activeSemester.isRegistrationCurrentlyOpen && (
                    <button
                      onClick={handleRegisterCourses}
                      disabled={submitting}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {submitting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      <span>Register ({selectedCourses.length})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Course Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCourses.map((course) => (
                  <div key={course._id} className={`border rounded-lg p-6 hover:shadow-md transition-shadow ${course.isRegistered ? 'border-green-200 bg-green-50' :
                      selectedCourses.includes(course._id) ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                    }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{course.courseName}</h3>
                        <p className="text-sm text-blue-600 font-medium">{course.courseCode}</p>
                      </div>
                      {course.isRegistered ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : activeSemester.isRegistrationCurrentlyOpen && (
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(course._id)}
                          onChange={() => handleCourseSelection(course._id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Credits:</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{course.credits}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Department:</span>
                        <span className="font-medium">{course.department}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Instructor:</span>
                        <span className="font-medium">{course.instructor}</span>
                      </div>
                    </div>

                    {course.isRegistered && (
                      <div className="mt-4 p-2 bg-green-100 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Already Registered</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {availableCourses.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                  <p className="text-gray-500">
                    {searchTerm || departmentFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No courses are available for registration at this time.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {/* My Registrations Tab */}
          {activeTab === 'registered' && (
            <div className="space-y-6">
              {myRegistrations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myRegistrations.map((registration) => (
                    <div key={registration._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{registration.courseId.courseName}</h3>
                          <p className="text-sm text-blue-600 font-medium">{registration.courseId.courseCode}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(registration.status)}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(registration.status)}`}>
                            {registration.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Credits:</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{registration.courseId.credits}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Instructor:</span>
                          <span className="font-medium">{registration.courseId.instructor}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Registered:</span>
                          <span className="font-medium">{new Date(registration.registrationDate).toLocaleDateString()}</span>
                        </div>
                        {registration.grade && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Grade:</span>
                            <div className="flex items-center space-x-1">
                              <Award className="h-4 w-4 text-green-500" />
                              <span className="font-medium text-green-600">{registration.grade}%</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {registration.status === 'registered' && activeSemester.isRegistrationCurrentlyOpen && (
                        <button
                          onClick={() => handleDropCourse(registration._id)}
                          className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Drop Course</span>
                        </button>
                      )}

                      {registration.dropDate && (
                        <div className="mt-4 p-2 bg-red-100 rounded-lg">
                          <p className="text-sm text-red-800">
                            Dropped on {new Date(registration.dropDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No course registrations</h3>
                  <p className="text-gray-500">
                    You haven't registered for any courses yet. Go to the Available Courses tab to register.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Registration Status Alert */}
      {!activeSemester.isRegistrationCurrentlyOpen && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-800">Registration Period Closed</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Course registration for {activeSemester.name} ended on {new Date(activeSemester.registrationEndDate).toLocaleDateString()}.
                You can view your registered courses but cannot make changes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseRegistration;