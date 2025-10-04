'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  XCircle, 
  RefreshCw,
  Trash2,
  Play,
  Loader2,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import AdminLogin from '@/components/AdminLogin';

interface QueueStats {
  counterId: string;
  counterName: string;
  isSpecial: boolean;
  queueLength: number;
  tokens: Array<{
    tokenNumber: number;
    isPriority: boolean;
    createdAt: string;
  }>;
}

interface DepartmentStats {
  id: string;
  name: string;
  counters: QueueStats[];
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [departments, setDepartments] = useState<DepartmentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadQueueStats();
    }
  }, [isAuthenticated]);

  const loadQueueStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/services/queue');
      const data = await response.json();
      
      if (data.success) {
        setDepartments(data.departments);
      } else {
        setError(data.message || 'Failed to load queue stats');
      }
    } catch (err) {
      setError('Failed to load queue statistics');
      console.error('Queue stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  const processNextToken = async (counterId: string) => {
    try {
      setProcessing(counterId);
      
      // Check if there are any priority counters with tokens before processing regular counters
      const department = departments.find(dept => 
        dept.counters.some(counter => counter.counterId === counterId)
      );
      
      if (department) {
        const priorityCounters = department.counters.filter(counter => counter.isSpecial);
        const regularCounters = department.counters.filter(counter => !counter.isSpecial);
        
        // If trying to process a regular counter, check if any priority counter has tokens
        const isRegularCounter = regularCounters.some(counter => counter.counterId === counterId);
        if (isRegularCounter) {
          const priorityHasTokens = priorityCounters.some(counter => counter.queueLength > 0);
          if (priorityHasTokens) {
            setError('Cannot process regular counter while priority counter has waiting tokens');
            setProcessing(null);
            return;
          }
        }
      }
      
      const response = await fetch('/api/services/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'process_next',
          counterId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await loadQueueStats(); // Refresh stats
      } else {
        setError(data.message || 'Failed to process token');
      }
    } catch (err) {
      setError('Failed to process next token');
      console.error('Process token error:', err);
    } finally {
      setProcessing(null);
    }
  };

  const removeToken = async (counterId: string, tokenNumber: number) => {
    try {
      setProcessing(`${counterId}-${tokenNumber}`);
      
      const response = await fetch('/api/services/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'remove_token',
          counterId,
          tokenNumber
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await loadQueueStats(); // Refresh stats
      } else {
        setError(data.message || 'Failed to remove token');
      }
    } catch (err) {
      setError('Failed to remove token');
      console.error('Remove token error:', err);
    } finally {
      setProcessing(null);
    }
  };

  const clearAllQueues = async () => {
    if (!confirm('Are you sure you want to clear all queues? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessing('clear-all');
      
      const response = await fetch('/api/services/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'clear_queues'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await loadQueueStats(); // Refresh stats
      } else {
        setError(data.message || 'Failed to clear queues');
      }
    } catch (err) {
      setError('Failed to clear queues');
      console.error('Clear queues error:', err);
    } finally {
      setProcessing(null);
    }
  };

  const handleAdminLogin = async (username: string, password: string): Promise<boolean> => {
    // Simple admin authentication - in production, this should be more secure
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleAdminLogin} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center safe-area-padding">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Queue Dashboard</h2>
          <p className="text-gray-500">Getting queue statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 border-b border-gray-200 safe-area-padding">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Mobile Header */}
          <div className="block sm:hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Queue Dashboard</h1>
                <p className="text-gray-600 text-xs">Manage token queues</p>
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 bg-white rounded-lg border border-gray-200"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
                <button
                  onClick={loadQueueStats}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={clearAllQueues}
                  disabled={processing === 'clear-all'}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
                >
                  {processing === 'clear-all' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Clear All</span>
                </button>
                <button
                  onClick={() => setIsAuthenticated(false)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Desktop Header */}
          <div className="hidden sm:flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Queue Management Dashboard</h1>
              <p className="text-gray-600 text-sm">Monitor and manage token queues across all departments</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={loadQueueStats}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={clearAllQueues}
                disabled={processing === 'clear-all'}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 text-sm"
              >
                {processing === 'clear-all' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>Clear All</span>
              </button>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 safe-area-padding">
        {error && (
          <div className="mb-4 flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-xl">
            <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-red-700 font-medium text-sm flex-1">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 text-lg flex-shrink-0"
            >
              ×
            </button>
          </div>
        )}

        <div className="space-y-4">
          {departments.map((department) => (
            <div key={department.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">{department.name}</h2>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {department.counters.reduce((sum, counter) => sum + counter.queueLength, 0)} total
                </div>
              </div>

              <div className="space-y-3">
                {department.counters.map((counter) => (
                  <div
                    key={counter.counterId}
                    className={`rounded-xl border p-4 ${
                      counter.isSpecial 
                        ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{counter.counterName}</h3>
                        {counter.isSpecial ? (
                          <p className="text-xs text-purple-600 font-medium truncate">Priority Counter</p>
                        ) : (
                          <p className="text-xs text-gray-600 truncate">
                            {counter.counterName.includes('Counter 1') 
                              ? 'Dr. Anya Sharma'
                              : counter.counterName.includes('Counter 2')
                              ? 'Dr. Michael Chen'
                              : 'General Counter'
                            }
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded-full border">
                        <Users className="w-3 h-3 text-gray-500" />
                        <span className="text-sm font-medium">{counter.queueLength}</span>
                      </div>
                    </div>

                    {/* Queue Tokens */}
                    <div className="space-y-1.5 mb-3 max-h-32 overflow-y-auto">
                      {counter.tokens.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-3">No tokens in queue</p>
                      ) : (
                        counter.tokens.map((token) => (
                          <div
                            key={token.tokenNumber}
                            className="flex items-center justify-between p-2 bg-white rounded-lg border text-sm"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">#{token.tokenNumber}</span>
                              {token.isPriority && (
                                <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">
                                  Priority
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => removeToken(counter.counterId, token.tokenNumber)}
                              disabled={processing === `${counter.counterId}-${token.tokenNumber}`}
                              className="text-red-600 hover:text-red-700 disabled:text-gray-400 p-1"
                            >
                              {processing === `${counter.counterId}-${token.tokenNumber}` ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Process Next Button */}
                    <button
                      onClick={() => processNextToken(counter.counterId)}
                      disabled={processing === counter.counterId || counter.queueLength === 0}
                      className={`w-full px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-sm active:scale-95 ${
                        counter.isSpecial
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                      } disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed`}
                    >
                      {processing === counter.counterId ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                      <span>Process Next</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions Footer - Mobile Only */}
        <div className="fixed bottom-4 left-4 right-4 sm:hidden safe-area-padding">
          <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-lg">
            <div className="flex justify-between items-center">
              <button
                onClick={loadQueueStats}
                className="flex items-center space-x-2 text-blue-600 text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <button
                onClick={clearAllQueues}
                disabled={processing === 'clear-all'}
                className="flex items-center space-x-2 text-red-600 text-sm font-medium disabled:text-gray-400"
              >
                {processing === 'clear-all' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>Clear All</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .safe-area-padding {
          padding-left: max(1rem, env(safe-area-inset-left));
          padding-right: max(1rem, env(safe-area-inset-right));
          padding-bottom: max(1rem, env(safe-area-inset-bottom));
        }
      `}</style>
    </div>
  );
}