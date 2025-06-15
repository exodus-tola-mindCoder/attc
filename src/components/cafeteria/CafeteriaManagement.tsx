/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { mealScheduleApi, mealFeedbackApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Star,
  MessageSquare,
  ChefHat,
  Users,
  TrendingUp,
} from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';

interface MealSchedule {
  _id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  items: string[];
  description?: string;
  nutritionalInfo?: {
    calories?: number;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
  allergens?: string[];
  isSpecialMenu: boolean;
  createdBy: {
    username: string;
  };
  createdAt: string;
}

interface MealFeedback {
  _id: string;
  studentId: {
    fullName: string;
    studentId: string;
  };
  mealScheduleId: {
    items: string[];
    description: string;
  };
  mealType: string;
  date: string;
  rating: number;
  comment?: string;
  categories?: {
    taste?: number;
    quality?: number;
    portion?: number;
    service?: number;
  };
  suggestions?: string;
  isAnonymous: boolean;
  createdAt: string;
}

const CafeteriaManagement: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule');
  const [mealSchedules, setMealSchedules] = useState<MealSchedule[]>([]);
  const [feedback, setFeedback] = useState<MealFeedback[]>([]);
  const [statistics, setStatistics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<MealSchedule | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMealType, setSelectedMealType] = useState('all');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    mealType: 'breakfast' as 'breakfast' | 'lunch' | 'dinner',
    items: [''],
    description: '',
    nutritionalInfo: {
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
    },
    allergens: [''],
    isSpecialMenu: false
  });

  useEffect(() => {
    fetchMealSchedules();
    if (user?.role === 'admin') {
      fetchFeedback();
      fetchStatistics();
    }
  }, [selectedDate, selectedMealType]);

  const fetchMealSchedules = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (selectedDate) {
        params.date = selectedDate;
      }

      if (selectedMealType !== 'all') {
        params.mealType = selectedMealType;
      }

      const response = await mealScheduleApi.getAll(params);
      setMealSchedules(response.data.data);
    } catch (error) {
      console.error('Failed to fetch meal schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    try {
      const response = await mealFeedbackApi.getAll();
      setFeedback(response.data.data.feedback);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await mealFeedbackApi.getStatistics();
      setStatistics(response.data.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        items: formData.items.filter(item => item.trim() !== ''),
        allergens: formData.allergens.filter(allergen => allergen.trim() !== ''),
        nutritionalInfo: {
          calories: formData.nutritionalInfo.calories ? parseInt(formData.nutritionalInfo.calories) : undefined,
          protein: formData.nutritionalInfo.protein || undefined,
          carbs: formData.nutritionalInfo.carbs || undefined,
          fat: formData.nutritionalInfo.fat || undefined
        }
      };

      if (editingSchedule) {
        await mealScheduleApi.update(editingSchedule._id, submitData);
      } else {
        await mealScheduleApi.create(submitData);
      }

      setShowForm(false);
      setEditingSchedule(null);
      resetForm();
      fetchMealSchedules();
    } catch (error) {
      console.error('Failed to save meal schedule:', error);
    }
  };

  const handleEdit = (schedule: MealSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      date: schedule.date.split('T')[0],
      mealType: schedule.mealType,
      items: schedule.items.length > 0 ? schedule.items : [''],
      description: schedule.description || '',
      nutritionalInfo: {
        calories: schedule.nutritionalInfo?.calories?.toString() || '',
        protein: schedule.nutritionalInfo?.protein || '',
        carbs: schedule.nutritionalInfo?.carbs || '',
        fat: schedule.nutritionalInfo?.fat || ''
      },
      allergens: schedule.allergens && schedule.allergens.length > 0 ? schedule.allergens : [''],
      isSpecialMenu: schedule.isSpecialMenu
    });
    setShowForm(true);
  };

  const handleDelete = async (scheduleId: string) => {
    if (window.confirm('Are you sure you want to delete this meal schedule?')) {
      try {
        await mealScheduleApi.delete(scheduleId);
        fetchMealSchedules();
      } catch (error) {
        console.error('Failed to delete meal schedule:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      mealType: 'breakfast',
      items: [''],
      description: '',
      nutritionalInfo: {
        calories: '',
        protein: '',
        carbs: '',
        fat: ''
      },
      allergens: [''],
      isSpecialMenu: false
    });
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, '']
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const addAllergen = () => {
    setFormData(prev => ({
      ...prev,
      allergens: [...prev.allergens, '']
    }));
  };

  const removeAllergen = (index: number) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.filter((_, i) => i !== index)
    }));
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      default: return '🍽️';
    }
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return 'bg-yellow-100 text-yellow-800';
      case 'lunch': return 'bg-orange-100 text-orange-800';
      case 'dinner': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ratingChartData = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [
      {
        data: statistics.ratingDistribution?.map((item: any) => item.count) || [],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const mealTypeChartData = {
    labels: statistics.feedbackByMealType?.map((item: any) => item._id) || [],
    datasets: [
      {
        label: 'Average Rating',
        data: statistics.feedbackByMealType?.map((item: any) => item.avgRating) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  if (loading && mealSchedules.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Cafeteria Management</h1>
          <p className="text-gray-600 mt-1">Manage meal schedules and feedback</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Meal Schedule</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'schedule'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Meal Schedule</span>
              </div>
            </button>
            {user?.role === 'admin' && (
              <>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'feedback'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Feedback</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'analytics'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Analytics</span>
                  </div>
                </button>
              </>
            )}
          </nav>
        </div>

        <div className="p-6">
          {/* Meal Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meal Type
                    </label>
                    <select
                      value={selectedMealType}
                      onChange={(e) => setSelectedMealType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Meals</option>
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Meal Schedule Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mealSchedules.map((schedule) => (
                  <div key={schedule._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getMealTypeIcon(schedule.mealType)}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900 capitalize">{schedule.mealType}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(schedule.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {user?.role === 'admin' && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEdit(schedule)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(schedule._id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Menu Items</h4>
                        <ul className="space-y-1">
                          {schedule.items.map((item, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {schedule.description && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                          <p className="text-sm text-gray-600">{schedule.description}</p>
                        </div>
                      )}

                      {schedule.nutritionalInfo?.calories && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Nutrition</h4>
                          <p className="text-sm text-gray-600">
                            {schedule.nutritionalInfo.calories} calories
                            {schedule.nutritionalInfo.protein && ` • ${schedule.nutritionalInfo.protein} protein`}
                          </p>
                        </div>
                      )}

                      {schedule.allergens && schedule.allergens.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Allergens</h4>
                          <div className="flex flex-wrap gap-1">
                            {schedule.allergens.map((allergen, index) => (
                              <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                {allergen}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMealTypeColor(schedule.mealType)}`}>
                          {schedule.mealType}
                        </span>
                        {schedule.isSpecialMenu && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            Special Menu
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {mealSchedules.length === 0 && (
                <div className="text-center py-12">
                  <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No meal schedules found</h3>
                  <p className="text-gray-500">
                    {user?.role === 'admin'
                      ? 'Start by adding your first meal schedule.'
                      : 'Meal schedules will appear here once they are added.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Feedback Tab */}
          {activeTab === 'feedback' && user?.role === 'admin' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Meal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Comment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {feedback.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {item.isAnonymous ? 'Anonymous' : item.studentId.fullName}
                              </div>
                              {!item.isAnonymous && (
                                <div className="text-sm text-gray-500">
                                  {item.studentId.studentId}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">{item.mealType}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(item.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                              />
                            ))}
                            <span className="ml-2 text-sm text-gray-600">({item.rating}/5)</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {item.comment || 'No comment'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {feedback.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
                  <p className="text-gray-500">
                    Student feedback will appear here once they start rating meals.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && user?.role === 'admin' && (
            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Total Feedback</p>
                      <p className="text-2xl font-bold text-blue-900">{statistics.totalFeedback || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Star className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Average Rating</p>
                      <p className="text-2xl font-bold text-green-900">
                        {statistics.averageRating ? statistics.averageRating.toFixed(1) : '0.0'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <ChefHat className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-yellow-600">Best Rated</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {statistics.feedbackByMealType?.reduce((best: any, current: any) =>
                          current.avgRating > (best?.avgRating || 0) ? current : best, null)?._id || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600">This Week</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {statistics.recentTrends?.reduce((sum: number, day: any) => sum + day.count, 0) || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
                  <div className="h-64">
                    <Doughnut
                      data={ratingChartData}
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

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Rating by Meal Type</h3>
                  <div className="h-64">
                    <Bar
                      data={mealTypeChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 5,
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Meal Schedule Form Modal */}
      {showForm && user?.role === 'admin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-full overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingSchedule ? 'Edit Meal Schedule' : 'Add New Meal Schedule'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meal Type *
                  </label>
                  <select
                    value={formData.mealType}
                    onChange={(e) => setFormData({ ...formData, mealType: e.target.value as any })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isSpecialMenu"
                    checked={formData.isSpecialMenu}
                    onChange={(e) => setFormData({ ...formData, isSpecialMenu: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isSpecialMenu" className="ml-2 block text-sm text-gray-900">
                    Special Menu
                  </label>
                </div>
              </div>

              {/* Menu Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Menu Items *</h4>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Add Item
                  </button>
                </div>
                {formData.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index] = e.target.value;
                        setFormData({ ...formData, items: newItems });
                      }}
                      placeholder="Enter menu item"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional description of the meal..."
                />
              </div>

              {/* Nutritional Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Nutritional Information (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calories
                    </label>
                    <input
                      type="number"
                      value={formData.nutritionalInfo.calories}
                      onChange={(e) => setFormData({
                        ...formData,
                        nutritionalInfo: { ...formData.nutritionalInfo, calories: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Protein
                    </label>
                    <input
                      type="text"
                      value={formData.nutritionalInfo.protein}
                      onChange={(e) => setFormData({
                        ...formData,
                        nutritionalInfo: { ...formData.nutritionalInfo, protein: e.target.value }
                      })}
                      placeholder="e.g., 25g"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Carbs
                    </label>
                    <input
                      type="text"
                      value={formData.nutritionalInfo.carbs}
                      onChange={(e) => setFormData({
                        ...formData,
                        nutritionalInfo: { ...formData.nutritionalInfo, carbs: e.target.value }
                      })}
                      placeholder="e.g., 45g"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fat
                    </label>
                    <input
                      type="text"
                      value={formData.nutritionalInfo.fat}
                      onChange={(e) => setFormData({
                        ...formData,
                        nutritionalInfo: { ...formData.nutritionalInfo, fat: e.target.value }
                      })}
                      placeholder="e.g., 12g"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Allergens */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Allergens (Optional)</h4>
                  <button
                    type="button"
                    onClick={addAllergen}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Add Allergen
                  </button>
                </div>
                {formData.allergens.map((allergen, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={allergen}
                      onChange={(e) => {
                        const newAllergens = [...formData.allergens];
                        newAllergens[index] = e.target.value;
                        setFormData({ ...formData, allergens: newAllergens });
                      }}
                      placeholder="Enter allergen (e.g., nuts, dairy)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {formData.allergens.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAllergen(index)}
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
                    setEditingSchedule(null);
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
                  {editingSchedule ? 'Update' : 'Create'} Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CafeteriaManagement;