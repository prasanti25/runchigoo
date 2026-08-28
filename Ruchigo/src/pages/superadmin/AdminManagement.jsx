import Navbar from "../../components/Navbar.jsx";

import {
  Shield,
  UserPlus,
  Search,
  Filter,
  Download,
  Users,
  Activity,
  UserCheck,
  UserX,
  MoreVertical,
} from "lucide-react";

export default function AdminManagement() {

  const stats = [
    {
      title: "Total Admins",
      value: "42",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Active Admins",
      value: "39",
      icon: UserCheck,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Suspended",
      value: "3",
      icon: UserX,
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Today's Activities",
      value: "128",
      icon: Activity,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const admins = [
    {
      name: "Rahul Sharma",
      email: "rahul@ruchigo.com",
      role: "Platform Admin",
      city: "Hyderabad",
      status: "Active",
      lastLogin: "5 mins ago",
    },
    {
      name: "Priya Reddy",
      email: "priya@ruchigo.com",
      role: "Operations Admin",
      city: "Bengaluru",
      status: "Active",
      lastLogin: "20 mins ago",
    },
    {
      name: "Amit Kumar",
      email: "amit@ruchigo.com",
      role: "Finance Admin",
      city: "Chennai",
      status: "Suspended",
      lastLogin: "Yesterday",
    },
    {
      name: "Sneha Patel",
      email: "sneha@ruchigo.com",
      role: "Support Admin",
      city: "Mumbai",
      status: "Active",
      lastLogin: "2 hrs ago",
    },
    {
      name: "Vikram Singh",
      email: "vikram@ruchigo.com",
      role: "Regional Admin",
      city: "Pune",
      status: "Active",
      lastLogin: "1 hr ago",
    },
  ];

  return (

    <>

      <Navbar />

      <main className="min-h-screen bg-[#fffaf7]">

        <section className="mx-auto max-w-7xl px-6 py-10">

          {/* Header */}

          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="font-semibold text-red-500">
                Super Administrator
              </p>

              <h1 className="mt-2 text-4xl font-bold text-gray-900">
                Admin Management
              </h1>

              <p className="mt-3 max-w-3xl text-gray-500">
                Create, monitor, manage, suspend, and assign permissions to platform administrators across the RuchiGo ecosystem.
              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600">

              <UserPlus size={20} />

              Add New Admin

            </button>

          </div>

          {/* Statistics */}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            {stats.map((item) => {

              const Icon = item.icon;

              return (

                <div
                  key={item.title}
                  className="rounded-3xl bg-white p-6 shadow-sm"
                >

                  <div className="flex items-center justify-between">

                    <div className={`rounded-2xl p-4 ${item.color}`}>

                      <Icon size={28} />

                    </div>

                    <Shield
                      size={22}
                      className="text-orange-500"
                    />

                  </div>

                  <h3 className="mt-5 text-gray-500">

                    {item.title}

                  </h3>

                  <h2 className="mt-2 text-3xl font-bold">

                    {item.value}

                  </h2>

                </div>

              );

            })}

          </div>

          {/* Search & Filters */}

          <div className="mt-10 rounded-3xl bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

              <div className="relative flex-1">

                <Search
                  className="absolute left-4 top-3.5 text-gray-400"
                  size={20}
                />

                <input
                  type="text"
                  placeholder="Search admin..."
                  className="w-full rounded-xl border py-3 pl-12 pr-4 outline-none focus:border-orange-500"
                />

              </div>

              <button className="flex items-center gap-2 rounded-xl border px-5 py-3 hover:bg-gray-100">

                <Filter size={18} />

                Filter

              </button>

              <button className="flex items-center gap-2 rounded-xl border px-5 py-3 hover:bg-gray-100">

                <Download size={18} />

                Export

              </button>

            </div>

          </div>

          {/* Admin Table */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold">
                Platform Administrators
              </h2>

              <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600">
                {admins.length} Admins
              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="px-4 py-4">Admin</th>
                    <th className="px-4 py-4">Role</th>
                    <th className="px-4 py-4">City</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Last Login</th>
                    <th className="px-4 py-4">Actions</th>

                  </tr>

                </thead>

                <tbody>

                  {admins.map((admin) => (

                    <tr
                      key={admin.email}
                      className="border-b hover:bg-orange-50 transition"
                    >

                      <td className="px-4 py-5">

                        <div>

                          <h3 className="font-semibold">
                            {admin.name}
                          </h3>

                          <p className="text-sm text-gray-500">
                            {admin.email}
                          </p>

                        </div>

                      </td>

                      <td className="px-4 py-5">

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-600">

                          {admin.role}

                        </span>

                      </td>

                      <td className="px-4 py-5">

                        {admin.city}

                      </td>

                      <td className="px-4 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            admin.status === "Active"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >

                          {admin.status}

                        </span>

                      </td>

                      <td className="px-4 py-5 text-gray-500">

                        {admin.lastLogin}

                      </td>

                      <td className="px-4 py-5">

                        <div className="flex items-center gap-3">

                          <button className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200">

                            Edit

                          </button>

                          <button className="rounded-lg bg-purple-100 px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-200">

                            Permissions

                          </button>

                          <button
                            className={`rounded-lg px-3 py-2 text-sm font-medium ${
                              admin.status === "Active"
                                ? "bg-red-100 text-red-600 hover:bg-red-200"
                                : "bg-green-100 text-green-600 hover:bg-green-200"
                            }`}
                          >

                            {admin.status === "Active"
                              ? "Suspend"
                              : "Activate"}

                          </button>

                          <button className="rounded-lg border p-2 hover:bg-gray-100">

                            <MoreVertical size={18} />

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* Admin Activity Summary */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Recent Activities */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">
                Recent Admin Activities
              </h2>

              <div className="mt-8 space-y-4">

                {[
                  "✅ Rahul Sharma approved 14 restaurants.",
                  "🔐 Priya Reddy updated platform permissions.",
                  "📊 Vikram Singh generated revenue report.",
                  "👤 Sneha Patel created 3 support accounts.",
                  "🚫 Amit Kumar account suspended by Super Admin.",
                  "📧 Platform announcement sent to all admins.",
                ].map((activity, index) => (

                  <div
                    key={index}
                    className="rounded-2xl border-l-4 border-orange-500 bg-orange-50 p-4"
                  >

                    {activity}

                  </div>

                ))}

              </div>

            </div>

            {/* Admin Performance */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">
                Admin Performance
              </h2>

              <div className="mt-8 space-y-6">

                {[
                  {
                    name: "Rahul Sharma",
                    score: "98%",
                    width: "98%",
                  },
                  {
                    name: "Priya Reddy",
                    score: "95%",
                    width: "95%",
                  },
                  {
                    name: "Sneha Patel",
                    score: "92%",
                    width: "92%",
                  },
                  {
                    name: "Vikram Singh",
                    score: "89%",
                    width: "89%",
                  },
                ].map((admin) => (

                  <div key={admin.name}>

                    <div className="mb-2 flex justify-between">

                      <span className="font-medium">
                        {admin.name}
                      </span>

                      <span className="font-semibold text-orange-600">
                        {admin.score}
                      </span>

                    </div>

                    <div className="h-3 rounded-full bg-gray-200">

                      <div
                        className="h-3 rounded-full bg-orange-500"
                        style={{ width: admin.width }}
                      />

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Security & Access */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Security Overview */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">
                Security & Access
              </h2>

              <div className="mt-8 space-y-5">

                {[
                  {
                    title: "Two-Factor Authentication",
                    status: "Enabled",
                  },
                  {
                    title: "Failed Login Attempts",
                    status: "18 Today",
                  },
                  {
                    title: "Password Expiry Policy",
                    status: "90 Days",
                  },
                  {
                    title: "Active Sessions",
                    status: "39",
                  },
                  {
                    title: "Suspicious Activities",
                    status: "0 Detected",
                  },
                ].map((item) => (

                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span className="font-medium">

                      {item.title}

                    </span>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-600">

                      {item.status}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* Region Assignment */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">
                Region Assignments
              </h2>

              <div className="mt-8 space-y-4">

                {[
                  ["Rahul Sharma", "Hyderabad Region"],
                  ["Priya Reddy", "Bengaluru Region"],
                  ["Sneha Patel", "Mumbai Region"],
                  ["Vikram Singh", "Pune Region"],
                ].map(([name, region]) => (

                  <div
                    key={name}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <div>

                      <h3 className="font-semibold">

                        {name}

                      </h3>

                      <p className="text-sm text-gray-500">

                        {region}

                      </p>

                    </div>

                    <button className="rounded-xl bg-orange-500 px-4 py-2 text-white hover:bg-orange-600">

                      Reassign

                    </button>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Broadcast & Analytics */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Broadcast */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">

                Broadcast Announcement

              </h2>

              <div className="mt-8">

                <textarea
                  rows={6}
                  placeholder="Write an announcement for all platform administrators..."
                  className="w-full rounded-2xl border p-4 outline-none focus:border-orange-500"
                />

                <div className="mt-6 flex gap-4">

                  <button className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600">

                    Send Announcement

                  </button>

                  <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                    Save Draft

                  </button>

                </div>

              </div>

            </div>

            {/* Analytics */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">

                Admin Analytics

              </h2>

              <div className="mt-8 space-y-6">

                {[
                  {
                    title: "Tasks Completed",
                    value: "1,842",
                    width: "94%",
                  },
                  {
                    title: "Restaurants Approved",
                    value: "628",
                    width: "88%",
                  },
                  {
                    title: "Support Tickets",
                    value: "1,240",
                    width: "79%",
                  },
                  {
                    title: "Average Response",
                    value: "4 min",
                    width: "91%",
                  },
                ].map((item) => (

                  <div key={item.title}>

                    <div className="mb-2 flex justify-between">

                      <span className="font-medium">

                        {item.title}

                      </span>

                      <span className="font-semibold text-orange-600">

                        {item.value}

                      </span>

                    </div>

                    <div className="h-3 rounded-full bg-gray-200">

                      <div
                        className="h-3 rounded-full bg-orange-500"
                        style={{ width: item.width }}
                      />

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* AI Insights */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">

            <h2 className="text-3xl font-bold">

              AI Management Insights

            </h2>

            <p className="mt-3 text-indigo-100">

              AI continuously evaluates administrator performance and platform operations.

            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Best Performer",
                  value: "Rahul Sharma",
                },
                {
                  title: "Fastest Response",
                  value: "3.8 Minutes",
                },
                {
                  title: "Most Approvals",
                  value: "154",
                },
                {
                  title: "Efficiency Score",
                  value: "96%",
                },
              ].map((item) => (

                <div
                  key={item.title}
                  className="rounded-2xl bg-white/10 p-6 backdrop-blur"
                >

                  <h3 className="font-semibold">

                    {item.title}

                  </h3>

                  <p className="mt-4 text-2xl font-bold">

                    {item.value}

                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* Footer */}

          <footer className="mt-12 rounded-3xl bg-white p-8 text-center shadow-sm">

            <h3 className="text-2xl font-bold">

              Administrator Management Console

            </h3>

            <p className="mt-3 text-gray-500">

              Manage platform administrators, assign permissions, monitor activities,
              and maintain secure access across the RuchiGo ecosystem.

            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <button className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600">

                Export Admin Report

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Download Activity Logs

              </button>

            </div>

            <p className="mt-8 text-sm text-gray-400">

              © 2026 RuchiGo Technologies • Super Admin Console

            </p>

          </footer>

        </section>

      </main>

    </>

  );

}