'use client';

import { User, ArrowRight, Shield, Clock, Users, Heart, Zap } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">Q-Flow</span>
            </div>

            {!user ? (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <button className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 text-sm sm:text-base">
                    Sign In
                  </button>
                </Link>
                <Link href="/register">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-full font-medium transition-all duration-200 transform hover:scale-105 text-sm sm:text-base">
                    Get Started
                  </button>
                </Link>
              </div>
            ) : (
              <Link href="/profile">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-full font-medium transition-all duration-200 flex items-center space-x-2 text-sm sm:text-base">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Intelligent Patient Queueing System</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
              Less Waiting,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mt-2">
                More Caring.
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-2">
              Transform your clinic&apos;s waiting room experience with Q-Flow. Our intelligent token system automatically directs patients to the shortest queue, minimizing wait times and improving satisfaction.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              {!user ? (
                <>
                  <Link href="/register" className="w-full sm:w-auto">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 w-full sm:w-auto justify-center">
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-all duration-200 flex items-center space-x-2 w-full sm:w-auto justify-center">
                      <span>Login</span>
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/profile" className="w-full sm:w-auto">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 w-full justify-center">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Profile</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </Link>
                  <Link href="/services" className="w-full sm:w-auto">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 w-full justify-center mt-3 sm:mt-0">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Explore Services</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div className="p-4 sm:p-8">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">60%</div>
              <div className="text-gray-600 text-sm sm:text-base">Reduced Wait Times</div>
            </div>
            <div className="p-4 sm:p-8">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">95%</div>
              <div className="text-gray-600 text-sm sm:text-base">Patient Satisfaction</div>
            </div>
            <div className="p-4 sm:p-8">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">24/7</div>
              <div className="text-gray-600 text-sm sm:text-base">Reliable Service</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Smart Queue Management
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-2">
              Advanced features designed to make patient management seamless and efficient.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 items-center mb-16 sm:mb-20">
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Priority Queue System</h3>
              <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
                Dedicated priority queue for elderly and differently-abled patients, ensuring everyone receives the timely care they deserve.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-600 text-sm sm:text-base">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Automatic priority assignment
                </li>
                <li className="flex items-center text-gray-600 text-sm sm:text-base">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Fair and efficient queue management
                </li>
                <li className="flex items-center text-gray-600 text-sm sm:text-base">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Special accommodations when needed
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-6 sm:p-8 h-64 sm:h-80 flex items-center justify-center order-first lg:order-last">
              <div className="text-center">
                <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 mx-auto mb-4" />
                <div className="text-xl sm:text-2xl font-semibold text-gray-900">Compassionate Care</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 items-center mb-16 sm:mb-20">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-6 sm:p-8 h-64 sm:h-80 flex items-center justify-center">
              <div className="text-center">
                <Clock className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 mx-auto mb-4" />
                <div className="text-xl sm:text-2xl font-semibold text-gray-900">Real-time Updates</div>
              </div>
            </div>
            <div>
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Real-time Notifications</h3>
              <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
                Get instant notifications about token status and queue position. Patients stay informed every step of the way.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-600 text-sm sm:text-base">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  Live queue position updates
                </li>
                <li className="flex items-center text-gray-600 text-sm sm:text-base">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  Estimated wait times
                </li>
                <li className="flex items-center text-gray-600 text-sm sm:text-base">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  SMS and app notifications
                </li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 items-center">
            <div>
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Secure & Reliable</h3>
              <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
                Built on modern, reliable technology with enterprise-grade security to protect patient data and ensure system integrity.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-600 text-sm sm:text-base">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  HIPAA compliant data protection
                </li>
                <li className="flex items-center text-gray-600 text-sm sm:text-base">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  99.9% uptime guarantee
                </li>
                <li className="flex items-center text-gray-600 text-sm sm:text-base">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  End-to-end encryption
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 sm:p-8 h-64 sm:h-80 flex items-center justify-center">
              <div className="text-center">
                <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-purple-600 mx-auto mb-4" />
                <div className="text-xl sm:text-2xl font-semibold text-gray-900">Enterprise Security</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4 sm:mb-6">
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">Q-Flow</span>
            </div>
            <p className="text-gray-400 text-sm sm:text-base mb-4">
              © 2024 Q-Flow. The Intelligent Patient Queueing System.
            </p>
            <Link href="/admin">
              <button className="text-gray-400 hover:text-white font-medium text-sm sm:text-base transition-colors duration-200">
                Admin Portal
              </button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}