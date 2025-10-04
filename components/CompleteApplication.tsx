'use client';

import { useState } from 'react';
import { User, Calendar, Star, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface CompleteApplicationProps {
  userData: {
    id: string;
    name: string;
    email: string;
    age: number | null;
    isSpecial: boolean;
  };
  onComplete: (updatedData: { age: number; isSpecial: boolean }) => void;
}

export default function CompleteApplication({ userData, onComplete }: CompleteApplicationProps) {
  const [age, setAge] = useState(userData.age?.toString() || '');
  const [isSpecial, setIsSpecial] = useState(userData.isSpecial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!age || isNaN(Number(age)) || Number(age) < 1 || Number(age) > 120) {
      setError('Please enter a valid age between 1 and 120');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age: Number(age),
          isSpecial,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onComplete({ age: Number(age), isSpecial });
        }, 1500);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Profile Complete!</h2>
          <p className="text-gray-600 mb-6">
            Your profile has been successfully updated. You can now access all features.
          </p>
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">Redirecting...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Complete Your Profile</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Help us personalize your experience by providing a few additional details about yourself.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm">
          <div className="p-8">
            {/* Current Info Display */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{userData.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{userData.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Age Input */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <label htmlFor="age" className="text-lg font-semibold text-gray-900">
                      Age
                    </label>
                    <p className="text-sm text-gray-600">Please provide your age for better service</p>
                  </div>
                </div>
                <div className="ml-13">
                  <input
                    type="number"
                    id="age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Enter your age"
                    min="1"
                    max="120"
                    className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                    required
                  />
                </div>
              </div>

              {/* Priority Status */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <label className="text-lg font-semibold text-gray-900">
                      Priority Access
                    </label>
                    <p className="text-sm text-gray-600">Enable priority access for faster service</p>
                  </div>
                </div>
                <div className="ml-13">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        checked={isSpecial}
                        onChange={() => setIsSpecial(true)}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-900 font-medium">Enable Priority Access</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        checked={!isSpecial}
                        onChange={() => setIsSpecial(false)}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-900 font-medium">Standard Access</span>
                    </label>
                  </div>
                  
                  {isSpecial && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                      <div className="flex items-start space-x-3">
                        <Star className="w-5 h-5 text-purple-600 mt-0.5" fill="currentColor" />
                        <div>
                          <p className="font-medium text-purple-900">Priority Access Benefits</p>
                          <ul className="text-sm text-purple-700 mt-2 space-y-1">
                            <li>• Faster queue processing</li>
                            <li>• Priority token assignment</li>
                            <li>• Reduced wait times</li>
                            <li>• Premium support</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Updating Profile...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Complete Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
