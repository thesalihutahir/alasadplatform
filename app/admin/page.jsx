// app/admin/page.jsx
"use client";

import { AdminRoute } from '@/components/AdminRoute';
import { useAuth } from '@/components/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { LogOut, Home, Users, Video, Gift } from 'lucide-react';

// Main component wrapped by the AdminRoute guard
export default function AdminDashboardPage() {
  // We use useAuth here to grab the user data for display (it's already checked by AdminRoute)
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // On successful sign out, Firebase context updates, and the AdminRoute 
      // will see !user and redirect to /admin/login.
      router.push('/admin/login');
    } catch (error) {
      console.error("Error signing out:", error);
      alert('Could not sign out. Check console for details.');
    }
  };

  const adminName = user?.email?.split('@')[0] || 'Admin';

  // The actual dashboard content
  const DashboardContent = () => (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-xl flex-shrink-0 p-4 border-r border-gray-200">
        <h2 className="text-2xl font-bold text-indigo-700 mb-8">Admin Panel</h2>
        
        {/* Nav Links */}
        <nav className="space-y-2">
          <NavLink icon={<Home className="w-5 h-5" />} href="/admin">Dashboard</NavLink>
          <NavLink icon={<Users className="w-5 h-5" />} href="/admin/news">Manage News</NavLink>
          <NavLink icon={<Gift className="w-5 h-5" />} href="/admin/programs">Manage Programs</NavLink>
          <NavLink icon={<Video className="w-5 h-5" />} href="/admin/multimedia">Manage Multimedia</NavLink>
        </nav>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="w-full mt-10 flex items-center justify-center p-3 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition duration-150 shadow-md"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center pb-6 mb-8 border-b border-gray-200">
          <h1 className="text-3xl font-semibold text-gray-800">Dashboard Overview</h1>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">Logged in as:</p>
            <p className="text-lg font-bold text-indigo-600 capitalize">{adminName}</p>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Donations" value="$12,500" icon="💰" />
          <StatCard title="Active Volunteers" value="45" icon="🤝" />
          <StatCard title="New Signups Today" value="8" icon="🆕" />
        </section>

        <div className="mt-10 p-6 bg-white rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Links</h3>
            <p className="text-gray-600">This is where you'll manage content for the foundation website.</p>
            {/* Future Content Management Components will go here */}
        </div>
      </div>
    </div>
  );

  // The main page structure
  return (
    <AdminRoute>
      <DashboardContent />
    </AdminRoute>
  );
}


// Helper Components (can be moved to a separate components/admin folder later)

const NavLink = ({ icon, href, children }) => (
    <Link 
      href={href}
      className="flex items-center p-3 text-base font-medium text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition duration-150"
    >
      {icon}
      <span className="ml-3">{children}</span>
    </Link>
);

const StatCard = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg transition duration-300 hover:shadow-xl border border-gray-100">
        <div className="flex items-center justify-between">
            <span className="text-4xl">{icon}</span>
            <p className="text-sm font-medium text-gray-500">{title}</p>
        </div>
        <p className="mt-2 text-3xl font-extrabold text-gray-900">{value}</p>
    </div>
);
