'use client'

import React, { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle, Shield, Clock, Users, ArrowRight, Sparkles, Menu, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      icon: FileText,
      title: "Fill the Form",
      description: "Complete your leave application with all required details",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Upload,
      title: "Upload Documents",
      description: "Securely upload supporting documents via Cloudinary",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: CheckCircle,
      title: "Submit & Track",
      description: "Submit your application and track approval status",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Admin Approval",
      description: "Streamlined approval workflow for administrators"
    },
    {
      icon: Clock,
      title: "Real-time Tracking",
      description: "Track your application status in real-time"
    },
    {
      icon: Users,
      title: "Team Management",
      description: "Comprehensive leave management for teams"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden p-10">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-20">
        {/* Hero Section */}
        <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="text-yellow-400 mr-3 h-8 w-8" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              LeaveLite
            </h1>
            <Sparkles className="text-yellow-400 ml-3 h-8 w-8" />
          </div>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl">
            Revolutionize your leave management with our intelligent, cloud-powered platform.
            Simple, secure, and lightning-fast.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-6 justify-center mb-16">
            <Link href="/register">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
                <span className="relative z-10 flex items-center">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </Link>
          </div>
        </div>

        {/* 3-Step Process */}
        <div className={`w-full max-w-6xl mb-16 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Submit Your Leave in
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> 3 Simple Steps</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;

              return (
                <div
                  key={index}
                  className={`relative group transform transition-all duration-500 ${isActive ? 'scale-105' : 'scale-100'
                    }`}
                >
                  {/* Step number */}
                  <div className="flex items-center mb-6">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-xl mr-4 transform transition-all duration-300 ${isActive ? 'animate-pulse shadow-lg' : ''
                      }`}>
                      {index + 1}
                    </div>
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-gray-600 to-transparent"></div>
                  </div>

                  {/* Card */}
                  <div className={`bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-2xl ${isActive ? 'shadow-2xl shadow-purple-500/20' : ''
                    }`}>
                    <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-xl flex items-center justify-center mb-6 transform transition-all duration-300 group-hover:rotate-6`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{step.description}</p>

                    {/* Animated progress bar */}
                    <div className="mt-6 w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 bg-gradient-to-r ${step.color} rounded-full transition-all duration-1000 ${isActive ? 'w-full' : 'w-0'
                          }`}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features Section */}
        <div className={`w-full max-w-4xl mb-16 transform transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Powerful Features for Modern Teams
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={index}
                  className="group text-center transform transition-all duration-300 hover:scale-105"
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300">
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technology Stack */}
        <div className={`text-center mb-12 transform transition-all duration-1000 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Powered by Modern Technology</h3>
            <div className="flex flex-wrap justify-center items-center gap-6 text-gray-300">
              <span className="px-4 py-2 bg-white/10 rounded-full text-sm">Next.js</span>
              <span className="px-4 py-2 bg-white/10 rounded-full text-sm">Cloudinary Storage</span>
              <span className="px-4 py-2 bg-white/10 rounded-full text-sm">Real-time Tracking</span>
              <span className="px-4 py-2 bg-white/10 rounded-full text-sm">Admin Dashboard</span>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className={`flex gap-6 transform transition-all duration-1000 delay-1200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
          <Link href="/login">
            <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-semibold transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 overflow-hidden">
              <span className="relative z-10 flex items-center">
                Login
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
            </button>
          </Link>

          <Link href="/register">
            <button className="group relative px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full font-semibold transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/25 overflow-hidden">
              <span className="relative z-10 flex items-center">
                Register
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-green-800 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
            </button>
          </Link>
        </div>

        {/* Floating elements for visual interest */}
        <div className="absolute top-1/4 left-10 animate-bounce delay-1000">
          <div className="w-4 h-4 bg-blue-400 rounded-full opacity-60"></div>
        </div>
        <div className="absolute top-1/3 right-16 animate-bounce delay-2000">
          <div className="w-3 h-3 bg-purple-400 rounded-full opacity-60"></div>
        </div>
        <div className="absolute bottom-1/4 left-1/4 animate-bounce delay-3000">
          <div className="w-2 h-2 bg-cyan-400 rounded-full opacity-60"></div>
        </div>
      </div>

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent animate-pulse"></div>
    </div>
  );
}
