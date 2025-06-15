/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { healthApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Heart,
  Users,
  Activity,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  TrendingUp,
  Calendar,
  Stethoscope
} from 'lucide-react';
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

interface HealthRecord {
  _id: string;
  studentId: {
    _id: string;
    fullName: string;
    studentId: string;
    familyInfo: {
      city: string;
    };
  };
  bloodType: string;
  disabilities: string;
  diseases: string;
  allergies: Array<{
    allergen: string;
    severity: string;
    reaction: string;
  }>;
  medicalVisits: Array<{
    _id: string;
    visitDate: string;
    reason: string;
    doctor: string;
    treatment: string;
  }>;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  updatedAt: string;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  trend?: number;
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, trend, subtitle }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
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

const HealthDashboard: React.FC = () => {
  const { user } = useAuth();
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [statistics, setStatistics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    bloodType: 'All',
    hasDisabilities: '',
    hasAllergies: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);

  useEffect(() => {
    fetchHealthRecords();
    fetchStatistics();
  }, [currentPage, searchTerm, filters]);

  const fetchHealthRecords = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        ...filters
      };

      const response = await healthApi.getAll(params);
      setHealthRecords(response.data.healthRecords);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch health records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await healthApi.getStatistics();
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      bloodType: 'All',
      hasDisabilities: '',
      hasAllergies: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const exportData = async () => {
    try {
      // Implementation for data export
      console.log('Exporting health data...');
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const bloodTypeChartData = {
    labels: statistics.bloodTypeStats?.map((item: any) => item._id) || [],
    datasets: [
      {
        label: 'Blood Type Distribution',
        data: statistics.bloodTypeStats?.map((item: any) => item.count) || [],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(147, 51, 234, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(251, 146, 60, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff'
      },
    ],
  };

  const disabilityChartData = {
    labels: statistics.disabilityStats?.map((item: any) => item._id.hasDisabilities) || [],
    datasets: [
      {
        data: statistics.disabilityStats?.map((item: any) => item.count) || [],
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)'],
        borderWidth: 2,
      },
    ],
  };

  if (loading && healthRecords.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Health Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage student health records</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Health Records"
          value={statistics.overview?.totalRecords || 0}
          icon={Heart}
          color="bg-red-500"
          trend={8}
        />
        <StatsCard
          title="Medical Visits"
          value={statistics.overview?.totalVisits || 0}
          icon={Stethoscope}
          color="bg-blue-500"
          trend={12}
          subtitle="This month"
        />
        <StatsCard
          title="Students with Allergies"
          value={statistics.allergyStats?.find((item: any) => item._id.hasAllergies === 'Has Allergies')?.count || 0}
          icon={AlertTriangle}
          color="bg-yellow-500"
        />
        <StatsCard
          title="Emergency Cases"
          value="3"
          icon={Activity}
          color="bg-purple-500"
          subtitle="Requires attention"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Blood Type Distribution</h3>
          <div className="h-64">
            <Doughnut
              data={bloodTypeChartData}
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Disability Status</h3>
          <div className="h-64">
            <Doughnut
              data={disabilityChartData}
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

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Type
                </label>
                <select
                  value={filters.bloodType}
                  onChange={(e) => handleFilterChange('bloodType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All Blood Types</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disabilities
                </label>
                <select
                  value={filters.hasDisabilities}
                  onChange={(e) => handleFilterChange('hasDisabilities', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Students</option>
                  <option value="true">Has Disabilities</option>
                  <option value="false">No Disabilities</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies
                </label>
                <select
                  value={filters.hasAllergies}
                  onChange={(e) => handleFilterChange('hasAllergies', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Students</option>
                  <option value="true">Has Allergies</option>
                  <option value="false">No Allergies</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Health Records Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Blood Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Health Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Visit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Emergency Contact
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : healthRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No health records found
                  </td>
                </tr>
              ) : (
                healthRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {record.studentId.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.studentId.studentId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        {record.bloodType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {record.disabilities !== 'None' && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Has Disabilities
                          </span>
                        )}
                        {record.allergies.length > 0 && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                            Has Allergies
                          </span>
                        )}
                        {record.disabilities === 'None' && record.allergies.length === 0 && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Healthy
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.medicalVisits.length > 0 ? (
                        <div>
                          <div>{new Date(record.medicalVisits[record.medicalVisits.length - 1].visitDate).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-400">
                            {record.medicalVisits[record.medicalVisits.length - 1].reason}
                          </div>
                        </div>
                      ) : (
                        'No visits'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div className="font-medium">{record.emergencyContact.name}</div>
                        <div className="text-xs">{record.emergencyContact.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        View
                      </button>
                      <button className="text-green-600 hover:text-green-800 mr-3">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Medical Visits */}
      {statistics.recentVisits && statistics.recentVisits.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Medical Visits</h3>
          </div>
          <div className="space-y-4">
            {statistics.recentVisits.slice(0, 5).map((visit: any, index: number) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {visit.studentName} ({visit.studentId})
                      </p>
                      <p className="text-sm text-gray-600">{visit.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(visit.visitDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">Dr. {visit.doctor}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-full overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Health Record Details</h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Student Information</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedRecord.studentId.fullName}</p>
                    <p><span className="font-medium">Student ID:</span> {selectedRecord.studentId.studentId}</p>
                    <p><span className="font-medium">Blood Type:</span> {selectedRecord.bloodType}</p>
                    <p><span className="font-medium">City:</span> {selectedRecord.studentId.familyInfo?.city}</p>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Emergency Contact</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedRecord.emergencyContact.name}</p>
                    <p><span className="font-medium">Relationship:</span> {selectedRecord.emergencyContact.relationship}</p>
                    <p><span className="font-medium">Phone:</span> {selectedRecord.emergencyContact.phone}</p>
                  </div>
                </div>

                {/* Health Information */}
                <div className="lg:col-span-2">
                  <h4 className="font-semibold text-gray-900 mb-3">Health Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium text-gray-700">Disabilities:</p>
                      <p className="text-gray-600">{selectedRecord.disabilities || 'None'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Diseases:</p>
                      <p className="text-gray-600">{selectedRecord.diseases || 'None'}</p>
                    </div>
                  </div>
                </div>

                {/* Allergies */}
                {selectedRecord.allergies.length > 0 && (
                  <div className="lg:col-span-2">
                    <h4 className="font-semibold text-gray-900 mb-3">Allergies</h4>
                    <div className="space-y-2">
                      {selectedRecord.allergies.map((allergy, index) => (
                        <div key={index} className="p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-orange-900">{allergy.allergen}</span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${allergy.severity === 'Severe' ? 'bg-red-100 text-red-800' :
                                allergy.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                              }`}>
                              {allergy.severity}
                            </span>
                          </div>
                          <p className="text-sm text-orange-700 mt-1">{allergy.reaction}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medical Visits */}
                {selectedRecord.medicalVisits.length > 0 && (
                  <div className="lg:col-span-2">
                    <h4 className="font-semibold text-gray-900 mb-3">Medical Visit History</h4>
                    <div className="space-y-4">
                      {selectedRecord.medicalVisits.map((visit, index) => (
                        <div key={visit._id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">
                              {new Date(visit.visitDate).toLocaleDateString()}
                            </span>
                            <span className="text-sm text-gray-500">Dr. {visit.doctor}</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">Reason:</span> {visit.reason}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Treatment:</span> {visit.treatment}
                          </p>
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

export default HealthDashboard;