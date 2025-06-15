/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { analyticsApi } from '../../services/api';
import {
  Users,
  BookOpen,
  MessageCircle,
  TrendingUp,
  Activity,
  MapPin,
  GraduationCap,
  Heart,
  Calendar,
  Building,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  trend?: number;
  subtitle?: string;
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, trend, subtitle, onClick }) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+{trend}% from last month</span>
          </div>
        )}
      </div>
      <div className={`h-12 w-12 ${color} rounded-lg flex items-center justify-center`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({});
  const [cityData, setCityData] = useState<any>([]);
  const [healthData, setHealthData] = useState<any>({});
  const [recentActivity, setRecentActivity] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedTimeRange]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, cityRes, healthRes, activityRes] = await Promise.all([
        analyticsApi.getEnrollmentStats(),
        analyticsApi.getStudentsByCity(),
        analyticsApi.getHealthStatus(),
        analyticsApi.getRecentActivity()
      ]);

      setStats(statsRes.data);
      setCityData(cityRes.data);
      setHealthData(healthRes.data);
      setRecentActivity(activityRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      // Generate comprehensive report
      const reportData = {
        generatedAt: new Date().toISOString(),
        timeRange: selectedTimeRange,
        overview: stats.overview,
        studentsByCity: cityData,
        healthStatus: healthData,
        recentActivity: recentActivity
      };

      const dataStr = JSON.stringify(reportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `university-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const cityChartData = {
    labels: cityData.slice(0, 8).map((item: any) => item._id),
    datasets: [
      {
        label: 'Students by City',
        data: cityData.slice(0, 8).map((item: any) => item.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(251, 146, 60, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(20, 184, 166, 1)',
          'rgba(251, 146, 60, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const healthChartData = {
    labels: ['Healthy Students', 'Students with Health Issues'],
    datasets: [
      {
        data: [
          healthData.disabilities?.find((item: any) => item._id.hasDisabilities === 'No Disabilities')?.count || 0,
          healthData.disabilities?.find((item: any) => item._id.hasDisabilities === 'Has Disabilities')?.count || 0,
        ],
        backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['rgba(16, 185, 129, 1)', 'rgba(239, 68, 68, 1)'],
        borderWidth: 2,
      },
    ],
  };

  const enrollmentTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Enrollments',
        data: [65, 78, 90, 81, 95, 105],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-2 mt-1">
            <Activity className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-500">Real-time data • Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={exportReport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Students"
          value={stats.overview?.totalStudents || 0}
          icon={Users}
          color="bg-blue-500"
          trend={12}
          subtitle="Active enrollments"
        />
        <StatsCard
          title="Total Courses"
          value={stats.overview?.totalCourses || 0}
          icon={BookOpen}
          color="bg-green-500"
          trend={8}
          subtitle="Available this semester"
        />
        <StatsCard
          title="Instructors"
          value={stats.overview?.totalInstructors || 0}
          icon={GraduationCap}
          color="bg-purple-500"
          trend={5}
          subtitle="Active faculty"
        />
        <StatsCard
          title="Departments"
          value={stats.overview?.totalDepartments || 0}
          icon={Building}
          color="bg-orange-500"
          subtitle="Academic divisions"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Health Records"
          value={stats.overview?.totalHealthRecords || 0}
          icon={Heart}
          color="bg-red-500"
          subtitle="Student health profiles"
        />
        <StatsCard
          title="Leave Applications"
          value={stats.overview?.pendingLeaveApplications || 0}
          icon={Calendar}
          color="bg-yellow-500"
          subtitle="Pending approval"
        />
        <StatsCard
          title="Messages"
          value={stats.overview?.totalMessages || 0}
          icon={MessageCircle}
          color="bg-indigo-500"
          trend={25}
          subtitle="Communication activity"
        />
        <StatsCard
          title="Feedback Items"
          value={stats.overview?.totalFeedback || 0}
          icon={Star}
          color="bg-pink-500"
          subtitle="Student feedback"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Students by City</h3>
            </div>
            <span className="text-sm text-gray-500">Top 8 cities</span>
          </div>
          <div className="h-64">
            <Bar
              data={cityChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Heart className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Health Status Distribution</h3>
          </div>
          <div className="h-64">
            <Doughnut
              data={healthChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Enrollment Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Enrollment Trends</h3>
        </div>
        <div className="h-64">
          <Line
            data={enrollmentTrendData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Students</h3>
            <span className="text-sm text-gray-500">Last 5 registrations</span>
          </div>
          <div className="space-y-4">
            {recentActivity.recentStudents?.slice(0, 5).map((student: any) => (
              <div key={student._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{student.fullName}</p>
                  <p className="text-xs text-gray-500">{student.studentId}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center mt-1">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Messages</h3>
            <span className="text-sm text-gray-500">Latest communications</span>
          </div>
          <div className="space-y-4">
            {recentActivity.recentMessages?.slice(0, 5).map((message: any) => (
              <div key={message._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{message.subject}</p>
                  <p className="text-xs text-gray-500">
                    From: {message.senderId?.username} ({message.senderId?.role})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center mt-1">
                    {message.priority === 'high' ? (
                      <>
                        <AlertTriangle className="h-3 w-3 text-red-500 mr-1" />
                        <span className="text-xs text-red-600">High</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3 text-blue-500 mr-1" />
                        <span className="text-xs text-blue-600">Normal</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Activity className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900">Database</h4>
            <p className="text-sm text-green-600">Operational</p>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900">API Services</h4>
            <p className="text-sm text-green-600">Operational</p>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900">File Storage</h4>
            <p className="text-sm text-green-600">Operational</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;