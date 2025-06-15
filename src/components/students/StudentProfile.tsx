/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentApi } from '../../services/api';
import { User, Mail, MapPin, Heart, BookOpen, Star } from 'lucide-react';
import TelegramInfoCard from '../telegram/TelegramInfoCard';

const StudentProfile: React.FC = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    backgroundEducation: {
      grade1to8School: '',
      grade9to10School: '',
      grade11to12School: '',
      yearsAttended: {
        grade1to8: '',
        grade9to10: '',
        grade11to12: ''
      }
    },
    familyInfo: {
      fatherName: '',
      motherName: '',
      kebele: '',
      wereda: '',
      city: ''
    },
    healthInfo: {
      disabilities: 'None',
      diseases: 'None',
      supportNeeded: 'None',
      bloodType: '',
      allergies: ''
    }
  });

  useEffect(() => {
    if (user?.studentProfile) {
      setStudentData(user.studentProfile);
      setFormData({
        fullName: user.studentProfile.fullName || '',
        backgroundEducation: user.studentProfile.backgroundEducation || {
          grade1to8School: '',
          grade9to10School: '',
          grade11to12School: '',
          yearsAttended: { grade1to8: '', grade9to10: '', grade11to12: '' }
        },
        familyInfo: user.studentProfile.familyInfo || {
          fatherName: '',
          motherName: '',
          kebele: '',
          wereda: '',
          city: ''
        },
        healthInfo: user.studentProfile.healthInfo || {
          disabilities: 'None',
          diseases: 'None',
          supportNeeded: 'None',
          bloodType: '',
          allergies: ''
        }
      });
      setHasProfile(true);
    }
    setLoading(false);
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [section, field, subfield] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev],
          [field]: subfield ? {
            ...prev[section as keyof typeof prev][field as keyof any],
            [subfield]: value
          } : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (hasProfile && studentData) {
        await studentApi.update(studentData._id, formData);
      } else {
        await studentApi.register(formData);
        setHasProfile(true);
      }
      setIsEditing(false);
      // Refresh user data
      window.location.reload();
    } catch (error) {
      console.error('Failed to save student profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasProfile && !isEditing) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Your Profile</h2>
        <p className="text-gray-600 mb-8">
          Please complete your student profile to access all features.
        </p>
        <button
          onClick={() => setIsEditing(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Profile
        </button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {hasProfile ? 'Edit Profile' : 'Create Student Profile'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </section>

            {/* Educational Background */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Educational Background</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade 1-8 School
                  </label>
                  <input
                    type="text"
                    name="backgroundEducation.grade1to8School"
                    value={formData.backgroundEducation.grade1to8School}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years Attended (1-8)
                  </label>
                  <input
                    type="text"
                    name="backgroundEducation.yearsAttended.grade1to8"
                    value={formData.backgroundEducation.yearsAttended.grade1to8}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade 9-10 School
                  </label>
                  <input
                    type="text"
                    name="backgroundEducation.grade9to10School"
                    value={formData.backgroundEducation.grade9to10School}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years Attended (9-10)
                  </label>
                  <input
                    type="text"
                    name="backgroundEducation.yearsAttended.grade9to10"
                    value={formData.backgroundEducation.yearsAttended.grade9to10}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade 11-12 School
                  </label>
                  <input
                    type="text"
                    name="backgroundEducation.grade11to12School"
                    value={formData.backgroundEducation.grade11to12School}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years Attended (11-12)
                  </label>
                  <input
                    type="text"
                    name="backgroundEducation.yearsAttended.grade11to12"
                    value={formData.backgroundEducation.yearsAttended.grade11to12}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </section>

            {/* Family Information */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Father's Name
                  </label>
                  <input
                    type="text"
                    name="familyInfo.fatherName"
                    value={formData.familyInfo.fatherName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mother's Name
                  </label>
                  <input
                    type="text"
                    name="familyInfo.motherName"
                    value={formData.familyInfo.motherName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kebele
                  </label>
                  <input
                    type="text"
                    name="familyInfo.kebele"
                    value={formData.familyInfo.kebele}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wereda
                  </label>
                  <input
                    type="text"
                    name="familyInfo.wereda"
                    value={formData.familyInfo.wereda}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="familyInfo.city"
                    value={formData.familyInfo.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </section>

            {/* Health Information */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disabilities
                  </label>
                  <textarea
                    name="healthInfo.disabilities"
                    value={formData.healthInfo.disabilities}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diseases
                  </label>
                  <textarea
                    name="healthInfo.diseases"
                    value={formData.healthInfo.diseases}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support Needed
                  </label>
                  <textarea
                    name="healthInfo.supportNeeded"
                    value={formData.healthInfo.supportNeeded}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Type
                  </label>
                  <input
                    type="text"
                    name="healthInfo.bloodType"
                    value={formData.healthInfo.bloodType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergies
                  </label>
                  <textarea
                    name="healthInfo.allergies"
                    value={formData.healthInfo.allergies}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </section>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Edit Profile
        </button>
      </div>

      {/* Telegram Info Card */}
      <TelegramInfoCard />

      {/* Profile Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center space-x-6 mb-8">
          <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-10 w-10 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{studentData?.fullName}</h2>
            <p className="text-gray-600">{studentData?.studentId}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{user?.email}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Educational Background */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Educational Background</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Grade 1-8</p>
                <p className="text-sm text-gray-600">{studentData?.backgroundEducation?.grade1to8School}</p>
                <p className="text-xs text-gray-500">({studentData?.backgroundEducation?.yearsAttended?.grade1to8})</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Grade 9-10</p>
                <p className="text-sm text-gray-600">{studentData?.backgroundEducation?.grade9to10School}</p>
                <p className="text-xs text-gray-500">({studentData?.backgroundEducation?.yearsAttended?.grade9to10})</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Grade 11-12</p>
                <p className="text-sm text-gray-600">{studentData?.backgroundEducation?.grade11to12School}</p>
                <p className="text-xs text-gray-500">({studentData?.backgroundEducation?.yearsAttended?.grade11to12})</p>
              </div>
            </div>
          </div>

          {/* Family Information */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Family Information</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Father's Name</p>
                <p className="text-sm text-gray-600">{studentData?.familyInfo?.fatherName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Mother's Name</p>
                <p className="text-sm text-gray-600">{studentData?.familyInfo?.motherName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Address</p>
                <p className="text-sm text-gray-600">
                  {studentData?.familyInfo?.city}, {studentData?.familyInfo?.wereda}, {studentData?.familyInfo?.kebele}
                </p>
              </div>
            </div>
          </div>

          {/* Health Information */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Health Information</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Disabilities</p>
                <p className="text-sm text-gray-600">{studentData?.healthInfo?.disabilities || 'None'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Diseases</p>
                <p className="text-sm text-gray-600">{studentData?.healthInfo?.diseases || 'None'}</p>
              </div>
              {studentData?.healthInfo?.bloodType && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Blood Type</p>
                  <p className="text-sm text-gray-600">{studentData.healthInfo.bloodType}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Courses and Grades */}
      {studentData?.courses?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center space-x-2 mb-6">
            <Star className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Enrolled Courses</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentData.courses.map((course: any) => (
              <div key={course._id} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">{course.courseName}</h4>
                <p className="text-sm text-gray-600">{course.courseCode}</p>
                {studentData.grades?.find((grade: any) => grade.courseId?._id === course._id) && (
                  <div className="mt-2">
                    <span className="text-sm font-medium text-blue-600">
                      Grade: {studentData.grades.find((grade: any) => grade.courseId?._id === course._id).grade}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;