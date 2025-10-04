'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { User, Mail, Calendar, Ticket, Settings, ChevronRight, Star, Zap, Heart, Shield } from 'lucide-react';
import CompleteApplication from '@/components/CompleteApplication';

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  age: number | null;
  isSpecial: boolean;
  createdAt: string;
  tokens: Array<{
    id: string;
    tokenNumber: number;
    status: string;
    createdAt: string;
    isPriority: boolean;
    estimatedWait?: number;
    department?: string;
    counter?: string;
  }>;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tokens' | 'settings'>('overview');

  useEffect(() => {
    if (!authLoading && user) {
      checkUserStatus();
    }
  }, [authLoading, user]);

  const checkUserStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/signin');
      const data = await response.json();

      if (data.signedIn) {
        setUserData(data.user);
      } else {
        const createResponse = await fetch('/api/signin', { method: 'POST' });
        const createData = await createResponse.json();
        
        if (createData.success) {
          setUserData(createData.user);
        } else {
          setError('Failed to create user profile');
        }
      }
    } catch (err) {
      setError('Failed to load profile');
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileComplete = async (updatedData: { age: number; isSpecial: boolean }) => {
    if (userData) {
      setUserData({
        ...userData,
        age: updatedData.age,
        isSpecial: updatedData.isSpecial
      });
    }
  };

  const needsProfileCompletion = () => {
    return userData && (userData.age === null || userData.age === undefined);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status: string) => {
    const statusMap: { [key: string]: { color: string; bg: string; label: string } } = {
      'waiting': { color: 'text-orange-600', bg: 'bg-orange-50', label: 'In Queue' },
      'assigned': { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Assigned' },
      'completed': { color: 'text-green-600', bg: 'bg-green-50', label: 'Completed' },
      'cancelled': { color: 'text-gray-600', bg: 'bg-gray-50', label: 'Cancelled' }
    };
    return statusMap[status.toLowerCase()] || statusMap['waiting'];
  };

  const getWaitTimeColor = (minutes: number) => {
    if (minutes <= 10) return 'text-green-600';
    if (minutes <= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Profile</h2>
          <p className="text-gray-500">Getting your information ready...</p>
        </div>
      </div>
    );
  }

  // Show CompleteApplication component if profile needs completion
  if (userData && needsProfileCompletion()) {
    return (
      <CompleteApplication 
        userData={userData} 
        onComplete={handleProfileComplete}
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Profile</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={checkUserStatus}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{userData?.name || 'User'}</h1>
                <p className="text-gray-600 flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>{userData?.email}</span>
                </p>
              </div>
            </div>
            
            {userData?.isSpecial && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full flex items-center space-x-2">
                <Star className="w-4 h-4" fill="currentColor" />
                <span className="font-medium">Priority Member</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'tokens', label: 'My Tokens', icon: Ticket },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as 'overview' | 'tokens' | 'settings')}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total Tokens</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{userData?.tokens?.length || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Ticket className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Completed</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {userData?.tokens?.filter(t => t.status.toLowerCase() === 'completed').length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Member Since</p>
                    <p className="text-lg font-semibold text-gray-900 mt-2">
                      {userData?.createdAt ? formatDate(userData.createdAt) : 'N/A'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Full Name</span>
                    <span className="font-medium text-gray-900">{userData?.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Email</span>
                    <span className="font-medium text-gray-900">{userData?.email}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Age</span>
                    <span className="font-medium text-gray-900">
                      {userData?.age ? `${userData.age} years` : 'Not specified'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-600">Account Type</span>
                    <span className={`font-medium ${userData?.isSpecial ? 'text-purple-600' : 'text-gray-900'}`}>
                      {userData?.isSpecial ? 'Priority Access' : 'Standard'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {userData?.tokens?.slice(0, 3).map((token) => {
                    const statusConfig = getStatusConfig(token.status);
                    return (
                      <div key={token.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${statusConfig.bg} rounded-lg flex items-center justify-center`}>
                            <Ticket className={`w-5 h-5 ${statusConfig.color}`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Token #{token.tokenNumber}</p>
                            <p className={`text-sm ${statusConfig.color}`}>{statusConfig.label}</p>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          {formatDate(token.createdAt)}
                        </div>
                      </div>
                    );
                  })}
                  
                  {(!userData?.tokens || userData.tokens.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <Ticket className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tokens Tab */}
        {activeTab === 'tokens' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Tokens</h2>
                <p className="text-gray-600 mt-1">Manage and track your queue tokens</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Ticket className="w-4 h-4" />
                <span>{userData?.tokens?.length || 0} tokens</span>
              </div>
            </div>

            {userData?.tokens && userData.tokens.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {userData.tokens.map((token) => {
                  const statusConfig = getStatusConfig(token.status);
                  return (
                    <div key={token.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center">
                            <span className="text-2xl font-bold text-blue-600">#{token.tokenNumber}</span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                                {statusConfig.label}
                              </span>
                              {token.isPriority && (
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-600 flex items-center space-x-1">
                                  <Star className="w-3 h-3" fill="currentColor" />
                                  <span>Priority</span>
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm">
                              Created on {formatDate(token.createdAt)} at {formatTime(token.createdAt)}
                            </p>
                            {token.department && (
                              <p className="text-sm text-gray-500 mt-1">
                                Department: {token.department}
                                {token.counter && ` • Counter: ${token.counter}`}
                              </p>
                            )}
                            {token.estimatedWait && token.status.toLowerCase() === 'waiting' && (
                              <p className={`text-sm font-medium mt-1 ${getWaitTimeColor(token.estimatedWait)}`}>
                                Estimated wait: {token.estimatedWait} minutes
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <button 
                            onClick={() => {
                              // Show token details in an alert for now
                              alert(`Token #${token.tokenNumber}\nStatus: ${statusConfig.label}\nPriority: ${token.isPriority ? 'Yes' : 'No'}\nCreated: ${formatDate(token.createdAt)} at ${formatTime(token.createdAt)}${token.estimatedWait ? `\nEstimated Wait: ${token.estimatedWait} minutes` : ''}`);
                            }}
                            className="flex items-center space-x-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                          >
                            <span className="text-sm">View Details</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Ticket className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No tokens yet</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  You haven&apos;t created any queue tokens yet. Get started by requesting a token for your next visit.
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-colors duration-200">
                  Request Your First Token
                </button>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                <div className="space-y-4">

                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                        <Heart className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Priority Status</p>
                        <p className="text-sm text-gray-600">
                          {userData?.isSpecial ? 'Active - Priority access enabled' : 'Standard access'}
                        </p>
                      </div>
                    </div>
                    {userData?.isSpecial ? (
                      <Star className="w-5 h-5 text-purple-600" fill="currentColor" />
                    ) : (
                      <span className="text-sm text-gray-500">Not eligible</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Privacy & Data</p>
                        <p className="text-sm text-gray-600">Manage your data preferences</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}