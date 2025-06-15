import React from 'react';
import { MessageCircle, ExternalLink, Bell, Users } from 'lucide-react';

const TelegramInfoCard: React.FC = () => {
  const handleTelegramClick = () => {
    window.open('https://t.me/ATTC_online', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Official Telegram Updates</h3>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">Live</span>
            </div>
          </div>

          <p className="text-gray-700 text-sm mb-4 leading-relaxed">
            Stay updated with the latest exam schedules, announcements, and important university news via our official Telegram channel. Get instant notifications for:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Bell className="h-4 w-4 text-blue-500" />
              <span>Exam schedules</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4 text-blue-500" />
              <span>University events</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MessageCircle className="h-4 w-4 text-blue-500" />
              <span>Important announcements</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <ExternalLink className="h-4 w-4 text-blue-500" />
              <span>Academic updates</span>
            </div>
          </div>

          <button
            onClick={handleTelegramClick}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Join Telegram Channel</span>
            <ExternalLink className="h-3 w-3" />
          </button>

          <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>2,766 members</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bell className="h-3 w-3" />
              <span>Daily updates</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramInfoCard;