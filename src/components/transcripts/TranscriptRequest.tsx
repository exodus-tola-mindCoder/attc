import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentApi } from '../../services/api';
import {
  FileText,
  Download,
  GraduationCap,
  Star,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface TranscriptRequest {
  _id: string;
  studentId: string;
  requestDate: string;
  status: 'pending' | 'processing' | 'ready' | 'delivered';
  deliveryMethod: 'email' | 'pickup' | 'mail';
  purpose: string;
  urgentRequest: boolean;
  estimatedDelivery: string;
  trackingNumber?: string;
}

interface Grade {
  courseId: {
    courseName: string;
    courseCode: string;
    credits: number;
  };
  grade: number;
  semester: number;
  year: number;
}

const TranscriptRequest: React.FC = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<any>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [requests, setRequests] = useState<TranscriptRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const [formData, setFormData] = useState({
    purpose: '',
    deliveryMethod: 'email' as 'email' | 'pickup' | 'mail',
    urgentRequest: false,
    deliveryAddress: ''
  });

  useEffect(() => {
    if (user?.studentProfile) {
      setStudentData(user.studentProfile);
      fetchGrades();
      fetchTranscriptRequests();
    }
    setLoading(false);
  }, [user]);

  const fetchGrades = async () => {
    try {
      // Mock grades data
      const mockGrades: Grade[] = [
        {
          courseId: {
            courseName: 'Introduction to Computer Science',
            courseCode: 'CS101',
            credits: 3
          },
          grade: 85,
          semester: 1,
          year: 2023
        },
        {
          courseId: {
            courseName: 'Mathematics for Computer Science',
            courseCode: 'MATH201',
            credits: 4
          },
          grade: 92,
          semester: 1,
          year: 2023
        },
        {
          courseId: {
            courseName: 'Data Structures and Algorithms',
            courseCode: 'CS201',
            credits: 4
          },
          grade: 88,
          semester: 2,
          year: 2023
        },
        {
          courseId: {
            courseName: 'Database Systems',
            courseCode: 'CS301',
            credits: 3
          },
          grade: 90,
          semester: 1,
          year: 2024
        }
      ];
      setGrades(mockGrades);
    } catch (error) {
      console.error('Failed to fetch grades:', error);
    }
  };

  const fetchTranscriptRequests = async () => {
    try {
      // Mock transcript requests
      const mockRequests: TranscriptRequest[] = [
        {
          _id: '1',
          studentId: user?.studentProfile?.studentId || '',
          requestDate: '2024-01-15T10:00:00Z',
          status: 'ready',
          deliveryMethod: 'email',
          purpose: 'Graduate School Application',
          urgentRequest: false,
          estimatedDelivery: '2024-01-20T10:00:00Z',
          trackingNumber: 'TR-2024-001'
        },
        {
          _id: '2',
          studentId: user?.studentProfile?.studentId || '',
          requestDate: '2024-01-10T14:30:00Z',
          status: 'delivered',
          deliveryMethod: 'pickup',
          purpose: 'Job Application',
          urgentRequest: true,
          estimatedDelivery: '2024-01-12T14:30:00Z',
          trackingNumber: 'TR-2024-002'
        }
      ];
      setRequests(mockRequests);
    } catch (error) {
      console.error('Failed to fetch transcript requests:', error);
    }
  };

  const calculateGPA = () => {
    if (grades.length === 0) return 0;

    let totalPoints = 0;
    let totalCredits = 0;

    grades.forEach(grade => {
      const points = (grade.grade / 100) * 4.0; // Convert to 4.0 scale
      totalPoints += points * grade.courseId.credits;
      totalCredits += grade.courseId.credits;
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  const generateTranscriptPDF = async () => {
    setGeneratingPDF(true);
    try {
      // Mock PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create a simple transcript document
      const transcriptData = {
        student: studentData,
        grades: grades,
        gpa: calculateGPA(),
        generatedDate: new Date().toISOString()
      };

      // In a real implementation, you would use a PDF library like jsPDF or send to backend
      const dataStr = JSON.stringify(transcriptData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `transcript-${studentData.studentId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Failed to generate transcript:', error);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Mock request submission
      const newRequest: TranscriptRequest = {
        _id: Date.now().toString(),
        studentId: studentData.studentId,
        requestDate: new Date().toISOString(),
        status: 'pending',
        deliveryMethod: formData.deliveryMethod,
        purpose: formData.purpose,
        urgentRequest: formData.urgentRequest,
        estimatedDelivery: new Date(Date.now() + (formData.urgentRequest ? 2 : 5) * 24 * 60 * 60 * 1000).toISOString(),
        trackingNumber: `TR-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`
      };

      setRequests(prev => [newRequest, ...prev]);
      setShowRequestForm(false);
      setFormData({
        purpose: '',
        deliveryMethod: 'email',
        urgentRequest: false,
        deliveryAddress: ''
      });
    } catch (error) {
      console.error('Failed to submit request:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case 'ready': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Complete Your Profile</h3>
        <p className="text-gray-500">Please complete your student profile to request transcripts.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Academic Transcript</h1>
          <p className="text-gray-600 mt-1">View your academic record and request official transcripts</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={generateTranscriptPDF}
            disabled={generatingPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {generatingPDF ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>{generatingPDF ? 'Generating...' : 'Download Unofficial'}</span>
          </button>
          <button
            onClick={() => setShowRequestForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span>Request Official</span>
          </button>
        </div>
      </div>

      {/* Academic Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Academic Record</h2>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700">Student Name</p>
              <p className="text-gray-900">{studentData.fullName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Student ID</p>
              <p className="text-gray-900">{studentData.studentId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Current GPA</p>
              <p className="text-gray-900 font-semibold">{calculateGPA()}/4.00</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Total Credits</p>
              <p className="text-gray-900">{grades.reduce((sum, grade) => sum + grade.courseId.credits, 0)}</p>
            </div>
          </div>

          {/* Grades Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Term
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {grades.map((grade, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {grade.courseId.courseName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {grade.courseId.courseCode}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.courseId.credits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{grade.grade}%</span>
                        <div className="ml-2 flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < Math.floor(grade.grade / 20) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Semester {grade.semester}, {grade.year}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Request History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <FileText className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Request History</h2>
          </div>

          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(request.status)}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  {request.urgentRequest && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Urgent
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-sm">
                  <p className="font-medium text-gray-900">{request.purpose}</p>
                  <p className="text-gray-600">Delivery: {request.deliveryMethod}</p>
                  <p className="text-gray-500">
                    Requested: {new Date(request.requestDate).toLocaleDateString()}
                  </p>
                  {request.trackingNumber && (
                    <p className="text-gray-500">
                      Tracking: {request.trackingNumber}
                    </p>
                  )}
                </div>

                {request.status === 'ready' && (
                  <button className="mt-3 w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                )}
              </div>
            ))}

            {requests.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No transcript requests yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-full overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Request Official Transcript</h3>
            </div>
            <form onSubmit={submitRequest} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose of Request *
                </label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  required
                  placeholder="e.g., Graduate School Application, Job Application"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Method *
                </label>
                <select
                  value={formData.deliveryMethod}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value as any })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="email">Email (PDF)</option>
                  <option value="pickup">Campus Pickup</option>
                  <option value="mail">Postal Mail</option>
                </select>
              </div>

              {formData.deliveryMethod === 'mail' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address *
                  </label>
                  <textarea
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    required
                    rows={3}
                    placeholder="Enter complete mailing address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="urgentRequest"
                  checked={formData.urgentRequest}
                  onChange={(e) => setFormData({ ...formData, urgentRequest: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="urgentRequest" className="ml-2 block text-sm text-gray-900">
                  Urgent request (additional fee applies)
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Processing Information</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Standard processing: 5-7 business days</li>
                  <li>• Urgent processing: 1-2 business days</li>
                  <li>• Email delivery is fastest and most secure</li>
                  <li>• Official transcripts include university seal and signature</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptRequest;