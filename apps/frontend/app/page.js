"use client";

import Link from "next/link";
import { Building2, Users, UtensilsCrossed, Bell, Shield, Clock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Building2 className="text-indigo-600" size={32} />
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                DormSync
              </span>
            </div>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-6 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition shadow-lg shadow-indigo-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              DormSync
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your all-in-one hostel and mess management solution. Streamline attendance,
            manage rooms, handle issues, and coordinate meals - all in one place.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-lg transition shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white hover:bg-gray-50 text-indigo-600 rounded-xl font-semibold text-lg transition shadow-xl"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything You Need
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Clock className="text-indigo-600" size={40} />}
            title="Attendance Tracking"
            description="Night check-ins after 9 PM with automated tracking and reporting for wardens."
          />
          <FeatureCard
            icon={<Building2 className="text-purple-600" size={40} />}
            title="Room Management"
            description="Efficient room allocation, transfer requests, and occupancy monitoring."
          />
          <FeatureCard
            icon={<UtensilsCrossed className="text-pink-600" size={40} />}
            title="Mess Management"
            description="Meal opt-outs, credit system, menu suggestions, and dietary preferences."
          />
          <FeatureCard
            icon={<Users className="text-blue-600" size={40} />}
            title="Issue Reporting"
            description="Report and track maintenance issues with priority levels and status updates."
          />
          <FeatureCard
            icon={<Bell className="text-orange-600" size={40} />}
            title="Announcements"
            description="Stay updated with hostel announcements, events, and important notices."
          />
          <FeatureCard
            icon={<Shield className="text-green-600" size={40} />}
            title="Secure & Reliable"
            description="Role-based access control ensuring data privacy and security."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Hostel Management?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join hundreds of students and wardens using DormSync for seamless hostel operations.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-white hover:bg-gray-100 text-indigo-600 rounded-xl font-semibold text-lg transition shadow-2xl"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="text-indigo-400" size={28} />
            <span className="text-2xl font-bold text-white">DormSync</span>
          </div>
          <p className="mb-4">Hostel & Mess Management Made Simple</p>
          <p className="text-sm">© 2025 DormSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition border border-gray-100 hover:border-indigo-200">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}