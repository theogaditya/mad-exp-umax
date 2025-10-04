'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { 
  Stethoscope, 
  Heart, 
  Brain, 
  Baby, 
  Bone, 
  Shield, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  ArrowRight,
  Star,
  Zap,
  Ticket,
  ArrowLeft
} from 'lucide-react';

interface Department {
  id: string;
  name: string;
  counters: Counter[];
}

interface Counter {
  id: string;
  name: string;
  isSpecial: boolean;
  queueLength: number;
}

interface UserData {
  id: string;
  age: number | null;
  isSpecial: boolean;
}

interface TokenAssignment {
  tokenNumber: number;
  counterId: string;
  counterName: string;
  departmentName: string;
  isPriority: boolean;
  estimatedWait?: number;
}

const departmentIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'General Medicine': Stethoscope,
  'Orthopedics': Bone,
  'Cardiology': Heart,
  'Neurology': Brain,
  'Pediatrics': Baby,
  'Dermatology': Shield,
  'Gynecology': Shield,
  'Emergency': Zap
};

export default function ServicesPage() {
  const { user, loading: authLoading } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenAssignment, setTokenAssignment] = useState<TokenAssignment | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      loadData();
    }
  }, [authLoading, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load departments with counter queue lengths
      console.log('Loading departments from:', window.location.origin + '/api/services/departments');
      const deptResponse = await fetch('/api/services/departments');
      const deptData = await deptResponse.json();
      
      console.log('Departments response:', deptData);
      
      if (deptData.success) {
        setDepartments(deptData.departments);
      } else {
        setError(deptData.message || 'Failed to load departments');
      }

      // Load user data for priority determination
      const userResponse = await fetch('/api/signin');
      const userData = await userResponse.json();
      
      if (userData.signedIn) {
        setUserData({
          id: userData.user.id,
          age: userData.user.age,
          isSpecial: userData.user.isSpecial
        });
      } else {
        // User is authenticated with Clerk but not in database yet
        // Create user profile first
        const createResponse = await fetch('/api/signin', { method: 'POST' });
        const createData = await createResponse.json();
        
        if (createData.success) {
          setUserData({
            id: createData.user.id,
            age: createData.user.age,
            isSpecial: createData.user.isSpecial
          });
        } else {
          setError('Failed to create user profile. Please try again.');
        }
      }
    } catch (err) {
      setError('Failed to load services');
      console.error('Services load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentSelect = (department: Department) => {
    setSelectedDepartment(department);
    setTokenAssignment(null);
    setShowConfirmation(false);
  };

  const handleAssignToken = async () => {
    if (!selectedDepartment || !userData) return;

    try {
      setAssigning(true);
      setError(null);

      const response = await fetch('/api/services/assign-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          departmentId: selectedDepartment.id,
          userId: userData.id,
          userAge: userData.age,
          isSpecial: userData.isSpecial
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTokenAssignment({
          tokenNumber: data.tokenNumber,
          counterId: data.counterId,
          counterName: data.counterName,
          departmentName: selectedDepartment.name,
          isPriority: data.isPriority,
          estimatedWait: data.estimatedWait
        });
        setShowConfirmation(true);
      } else {
        setError(data.message || 'Failed to assign token');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Token assignment error:', err);
    } finally {
      setAssigning(false);
    }
  };

  const handleConfirmToken = async () => {
    if (!tokenAssignment || !selectedDepartment) return;

    try {
      setAssigning(true);
      setError(null);
      
      const response = await fetch('/api/services/confirm-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenNumber: tokenAssignment.tokenNumber,
          departmentId: selectedDepartment.id,
          counterId: tokenAssignment.counterId,
          isPriority: tokenAssignment.isPriority
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh departments to update queue lengths
        await loadData();
        setShowConfirmation(false);
        setTokenAssignment(null);
        setSelectedDepartment(null);
        
        // Redirect to profile page
        window.location.href = '/profile';
      } else {
        setError(data.message || 'Failed to confirm token');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Token confirmation error:', err);
    } finally {
      setAssigning(false);
    }
  };

  const isEligibleForPriority = () => {
    return userData && (userData.isSpecial || (userData.age && userData.age >= 70));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center safe-area-padding">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Services</h2>
          <p className="text-gray-500">Getting available departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-b border-gray-200 safe-area-padding">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Medical Services</h1>
            <p className="text-gray-600 text-sm max-w-2xl mx-auto">
              Select a department to get your queue token. Priority access available for special members and seniors (70+).
            </p>
            {isEligibleForPriority() && (
              <div className="mt-3 inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs">
                <Star className="w-3 h-3" fill="currentColor" />
                <span className="font-medium">Priority Access Available</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 safe-area-padding">
        {error && (
          <div className="mb-4 flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-red-700 font-medium text-sm flex-1">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 text-lg flex-shrink-0"
            >
              ×
            </button>
          </div>
        )}

        {!selectedDepartment ? (
          /* Department Selection - Mobile Optimized */
          <div className="grid grid-cols-1 gap-4">
            {departments.map((department) => {
              const IconComponent = departmentIcons[department.name] || Stethoscope;
              const totalQueueLength = department.counters.reduce((sum, counter) => sum + counter.queueLength, 0);
              
              return (
                <div
                  key={department.id}
                  onClick={() => handleDepartmentSelect(department)}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{department.name}</h3>
                        <div className="flex items-center space-x-1 text-gray-500 text-xs">
                          <Users className="w-3 h-3" />
                          <span>{totalQueueLength} in queue</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                  
                  <div className="space-y-1.5">
                    {department.counters.slice(0, 2).map((counter) => (
                      <div key={counter.id} className="flex items-center justify-between text-xs">
                        <span className={`flex items-center space-x-1.5 ${
                          counter.isSpecial ? 'text-purple-600' : 'text-gray-600'
                        }`}>
                          {counter.isSpecial && <Star className="w-2.5 h-2.5" fill="currentColor" />}
                          <span className="truncate">{counter.name}</span>
                        </span>
                        <span className="font-medium bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                          {counter.queueLength}
                        </span>
                      </div>
                    ))}
                    {department.counters.length > 2 && (
                      <div className="text-xs text-gray-500 text-center pt-1">
                        +{department.counters.length - 2} more counters
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Counter Details and Token Assignment - Mobile Optimized */
          <div className="space-y-4">
            {/* Back Button */}
            <button
              onClick={() => setSelectedDepartment(null)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 p-2 -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Departments</span>
            </button>

            {/* Department Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  {(() => {
                    const IconComponent = departmentIcons[selectedDepartment.name] || Stethoscope;
                    return <IconComponent className="w-6 h-6 text-blue-600" />;
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-gray-900 truncate">{selectedDepartment.name}</h2>
                  <p className="text-gray-600 text-sm">Select a counter to get your token</p>
                </div>
              </div>
            </div>

            {/* Counters List */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Available Counters</h3>
              <div className="space-y-2">
                {selectedDepartment.counters.map((counter) => (
                  <div key={counter.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {counter.isSpecial && (
                        <Star className="w-3 h-3 text-purple-600" fill="currentColor" />
                      )}
                      <span className={`text-sm font-medium ${counter.isSpecial ? 'text-purple-700' : 'text-gray-700'}`}>
                        {counter.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-3 h-3 text-gray-500" />
                      <span className="text-sm font-semibold">{counter.queueLength}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        counter.queueLength === 0 ? 'bg-green-500' :
                        counter.queueLength < 3 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Token Assignment */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-3">Get Your Token</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {isEligibleForPriority() 
                    ? "You're eligible for priority access! We'll automatically assign you to the best available counter."
                    : "We'll assign you to the shortest queue in this department."
                  }
                </p>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Counters</span>
                      <span className="font-semibold">{selectedDepartment.counters.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total in Queue</span>
                      <span className="font-semibold">
                        {selectedDepartment.counters.reduce((sum, counter) => sum + counter.queueLength, 0)}
                      </span>
                    </div>
                    {isEligibleForPriority() && (
                      <div className="flex items-center justify-between col-span-2 pt-2 border-t border-gray-200">
                        <span className="text-purple-600 font-medium">Priority Access</span>
                        <Star className="w-3 h-3 text-purple-600" fill="currentColor" />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleAssignToken}
                  disabled={assigning}
                  className={`w-full px-6 py-3 rounded-lg font-semibold text-base transition-all duration-200 active:scale-95 ${
                    isEligibleForPriority()
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                  } disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed`}
                >
                  {assigning ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Getting Your Token...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Ticket className="w-4 h-4" />
                      <span>Get Token</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Token Confirmation Modal - Mobile Optimized */}
        {showConfirmation && tokenAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 safe-area-padding">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-sm mx-auto sm:max-w-md shadow-lg animate-slide-up">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">Token Assigned!</h3>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Token Number</span>
                      <span className="font-bold text-lg text-blue-600">#{tokenAssignment.tokenNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department</span>
                      <span className="font-medium text-right">{tokenAssignment.departmentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Counter</span>
                      <span className="font-medium">{tokenAssignment.counterName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority</span>
                      <span className={`font-medium ${tokenAssignment.isPriority ? 'text-purple-600' : 'text-gray-900'}`}>
                        {tokenAssignment.isPriority ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {tokenAssignment.estimatedWait && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Est. Wait Time</span>
                        <span className="font-medium">{tokenAssignment.estimatedWait} min</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    disabled={assigning}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmToken}
                    disabled={assigning}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 active:scale-95 text-sm"
                  >
                    {assigning ? (
                      <div className="flex items-center justify-center space-x-1.5">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Confirming...</span>
                      </div>
                    ) : (
                      'Confirm Token'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .safe-area-padding {
          padding-left: max(1rem, env(safe-area-inset-left));
          padding-right: max(1rem, env(safe-area-inset-right));
          padding-bottom: max(1rem, env(safe-area-inset-bottom));
        }
        
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}