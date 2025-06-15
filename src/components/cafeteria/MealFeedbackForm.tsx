import React, { useState, useEffect } from 'react';
import { mealScheduleApi, mealFeedbackApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Star, Send, Calendar, ChefHat, MessageSquare } from 'lucide-react';

interface MealSchedule {
  _id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  items: string[];
  description?: string;
}

const MealFeedbackForm: React.FC = () => {
  const { user } = useAuth();
  const [mealSchedules, setMealSchedules] = useState<MealSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<MealSchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    categories: {
      taste: 0,
      quality: 0,
      portion: 0,
      service: 0
    },
    suggestions: '',
    isAnonymous: false
  });

  useEffect(() => {
    fetchTodaysMeals();
  }, []);

  const fetchTodaysMeals = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const response = await mealScheduleApi.getAll({ date: today });
      setMealSchedules(response.data.data);
    } catch (error) {
      console.error('Failed to fetch today\'s meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule || formData.rating === 0) return;

    try {
      setSubmitting(true);
      await mealFeedbackApi.submit({
        mealScheduleId: selectedSchedule._id,
        mealType: selectedSchedule.mealType,
        date: selectedSchedule.date,
        ...formData
      });

      setSuccess(true);
      setFormData({
        rating: 0,
        comment: '',
        categories: {
          taste: 0,
          quality: 0,
          portion: 0,
          service: 0
        },
        suggestions: '',
        isAnonymous: false
      });
      setSelectedSchedule(null);

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Failed to submit feedback:', error);
      alert(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarRating = (rating: number, onRatingChange: (rating: number) => void, label: string) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`h-6 w-6 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'
              } hover:text-yellow-400 transition-colors`}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 ? `${rating}/5` : 'Not rated'}
        </span>
      </div>
    </div>
  );

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
      case 'breakfast': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'lunch': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'dinner': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (user?.role !== 'student') {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-500">Only students can submit meal feedback.</p>
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Meal Feedback</h1>
        <p className="text-gray-600 mt-1">Share your thoughts about today's meals</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Feedback submitted successfully! Thank you for your input.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Today's Meals */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Today's Meals</h2>
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString()}
          </span>
        </div>

        {mealSchedules.length === 0 ? (
          <div className="text-center py-8">
            <ChefHat className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meals scheduled for today</h3>
            <p className="text-gray-500">Check back later or contact the cafeteria for more information.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mealSchedules.map((schedule) => (
              <div
                key={schedule._id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedSchedule?._id === schedule._id
                    ? `${getMealTypeColor(schedule.mealType)} border-2`
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
                onClick={() => setSelectedSchedule(schedule)}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-2xl">{getMealTypeIcon(schedule.mealType)}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 capitalize">{schedule.mealType}</h3>
                    <p className="text-sm text-gray-500">Click to rate</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {schedule.items.slice(0, 3).map((item, index) => (
                    <p key={index} className="text-sm text-gray-600 flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                      {item}
                    </p>
                  ))}
                  {schedule.items.length > 3 && (
                    <p className="text-sm text-gray-500">+{schedule.items.length - 3} more items</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Form */}
      {selectedSchedule && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <MessageSquare className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Rate {selectedSchedule.mealType}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Overall Rating */}
            <div>
              {renderStarRating(
                formData.rating,
                (rating) => setFormData({ ...formData, rating }),
                'Overall Rating *'
              )}
            </div>

            {/* Category Ratings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Ratings (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderStarRating(
                  formData.categories.taste,
                  (rating) => setFormData({
                    ...formData,
                    categories: { ...formData.categories, taste: rating }
                  }),
                  'Taste'
                )}
                {renderStarRating(
                  formData.categories.quality,
                  (rating) => setFormData({
                    ...formData,
                    categories: { ...formData.categories, quality: rating }
                  }),
                  'Quality'
                )}
                {renderStarRating(
                  formData.categories.portion,
                  (rating) => setFormData({
                    ...formData,
                    categories: { ...formData.categories, portion: rating }
                  }),
                  'Portion Size'
                )}
                {renderStarRating(
                  formData.categories.service,
                  (rating) => setFormData({
                    ...formData,
                    categories: { ...formData.categories, service: rating }
                  }),
                  'Service'
                )}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments (Optional)
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Share your thoughts about the meal..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.comment.length}/500 characters
              </p>
            </div>

            {/* Suggestions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suggestions for Improvement (Optional)
              </label>
              <textarea
                value={formData.suggestions}
                onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
                rows={2}
                maxLength={300}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any suggestions to make this meal better?"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.suggestions.length}/300 characters
              </p>
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAnonymous"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-900">
                Submit feedback anonymously
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={formData.rating === 0 || submitting}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>{submitting ? 'Submitting...' : 'Submit Feedback'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MealFeedbackForm;