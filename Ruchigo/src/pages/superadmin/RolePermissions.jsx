import Navbar from "../../components/Navbar.jsx";

import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Copy,
  Edit,
  Trash2,
  Users,
  Lock,
} from "lucide-react";

export default function RolePermissions() {

  const stats = [
    {
      title: "Total Roles",
      value: "12",
      icon: ShieldCheck,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Custom Roles",
      value: "5",
      icon: Lock,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Assigned Users",
      value: "86",
      icon: Users,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Permission Sets",
      value: "148",
      icon: ShieldCheck,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const roles = [
    {
      role: "Super Admin",
      users: 2,
      permissions: "Full Access",
      status: "Active",
    },
    {
      role: "Platform Admin",
      users: 8,
      permissions: "High",
      status: "Active",
    },
    {
      role: "Operations Admin",
      users: 10,
      permissions: "Medium",
      status: "Active",
    },
    {
      role: "Finance Admin",
      users: 5,
      permissions: "Finance Only",
      status: "Active",
    },
    {
      role: "Support Admin",
      users: 15,
      permissions: "Support",
      status: "Active",
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

              <h1 className="mt-2 text-4xl font-bold">
                Roles & Permissions
              </h1>

              <p className="mt-3 max-w-3xl text-gray-500">
                Create custom roles, assign permissions, and control access
                across every module of the RuchiGo platform.
              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600">

              <Plus size={20} />

              Create Role

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
                  size={20}
                  className="absolute left-4 top-3.5 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search role..."
                  className="w-full rounded-xl border py-3 pl-12 pr-4 outline-none focus:border-orange-500"
                />

              </div>

              <button className="flex items-center gap-2 rounded-xl border px-5 py-3 hover:bg-gray-100">

                <Filter size={18} />

                Filter

              </button>

            </div>

          </div>

          {/* Roles Table */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold">
                Role Management
              </h2>

              <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600">
                {roles.length} Roles
              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="px-4 py-4">Role</th>
                    <th className="px-4 py-4">Assigned Users</th>
                    <th className="px-4 py-4">Permission Level</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Actions</th>

                  </tr>

                </thead>

                <tbody>

                  {roles.map((role) => (

                    <tr
                      key={role.role}
                      className="border-b hover:bg-orange-50 transition"
                    >

                      <td className="px-4 py-5">

                        <div>

                          <h3 className="font-semibold">
                            {role.role}
                          </h3>

                          <p className="text-sm text-gray-500">
                            Enterprise Access Role
                          </p>

                        </div>

                      </td>

                      <td className="px-4 py-5 font-medium">

                        {role.users}

                      </td>

                      <td className="px-4 py-5">

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-600">

                          {role.permissions}

                        </span>

                      </td>

                      <td className="px-4 py-5">

                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-600">

                          {role.status}

                        </span>

                      </td>

                      <td className="px-4 py-5">

                        <div className="flex flex-wrap gap-2">

                          <button className="flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200">

                            <Edit size={16} />

                            Edit

                          </button>

                          <button className="flex items-center gap-1 rounded-lg bg-purple-100 px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-200">

                            <Copy size={16} />

                            Clone

                          </button>

                          <button className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-200">

                            <Trash2 size={16} />

                            Delete

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* Module Permission Matrix */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">
              Module Permission Matrix
            </h2>

            <p className="mt-2 text-gray-500">
              Configure access permissions for every major platform module.
            </p>

            <div className="mt-8 overflow-x-auto">

              <table className="min-w-full border">

                <thead className="bg-orange-50">

                  <tr>

                    <th className="border px-4 py-3 text-left">
                      Module
                    </th>

                    <th className="border px-4 py-3">
                      View
                    </th>

                    <th className="border px-4 py-3">
                      Create
                    </th>

                    <th className="border px-4 py-3">
                      Update
                    </th>

                    <th className="border px-4 py-3">
                      Delete
                    </th>

                    <th className="border px-4 py-3">
                      Export
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {[
                    "Customers",
                    "Restaurants",
                    "Orders",
                    "Delivery Partners",
                    "Payments",
                    "Reports",
                    "Analytics",
                    "Coupons",
                    "Settings",
                    "Notifications",
                  ].map((module) => (

                    <tr
                      key={module}
                      className="hover:bg-orange-50"
                    >

                      <td className="border px-4 py-4 font-medium">

                        {module}

                      </td>

                      {[1,2,3,4,5].map((item)=>(

                        <td
                          key={item}
                          className="border text-center"
                        >

                          <input
                            type="checkbox"
                            defaultChecked
                            className="h-5 w-5 accent-orange-500"
                          />

                        </td>

                      ))}

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* Permission Summary */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">
                Permission Summary
              </h2>

              <div className="mt-8 space-y-5">

                {[
                  {
                    title:"Platform Modules",
                    value:"24"
                  },
                  {
                    title:"Enabled Permissions",
                    value:"148"
                  },
                  {
                    title:"Restricted Actions",
                    value:"32"
                  },
                  {
                    title:"Custom Policies",
                    value:"12"
                  },
                ].map((item)=>(

                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span className="font-medium">

                      {item.title}

                    </span>

                    <span className="font-bold text-orange-600">

                      {item.value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white">

              <h2 className="text-2xl font-bold">
                Role Overview
              </h2>

              <div className="mt-8 space-y-4">

                <div className="rounded-2xl bg-white/10 p-5">

                  <h3 className="font-semibold">
                    Highest Privilege
                  </h3>

                  <p className="mt-2 text-orange-100">
                    Super Admin has unrestricted access across all platform modules.
                  </p>

                </div>

                <div className="rounded-2xl bg-white/10 p-5">

                  <h3 className="font-semibold">
                    Security Recommendation
                  </h3>

                  <p className="mt-2 text-orange-100">
                    Review role assignments every 90 days and remove unused permissions.
                  </p>

                </div>

                <div className="rounded-2xl bg-white/10 p-5">

                  <h3 className="font-semibold">
                    Compliance
                  </h3>

                  <p className="mt-2 text-orange-100">
                    All permission changes are recorded in the Audit Logs module.
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* Audit Logs */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Permission Change Logs */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">
                Permission Change Logs
              </h2>

              <div className="mt-8 space-y-4">

                {[
                  "Super Admin granted Payment access to Finance Admin.",
                  "Operations Admin role updated with Reports permission.",
                  "Support Admin export permission removed.",
                  "Platform Admin cloned into Regional Admin.",
                  "Security policy updated for Finance module.",
                  "Audit log exported by Super Admin.",
                ].map((log, index) => (

                  <div
                    key={index}
                    className="rounded-2xl border-l-4 border-orange-500 bg-orange-50 p-4"
                  >

                    {log}

                  </div>

                ))}

              </div>

            </div>

            {/* Role Usage Analytics */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold">
                Role Usage Analytics
              </h2>

              <div className="mt-8 space-y-6">

                {[
                  {
                    title: "Platform Admin",
                    value: "94%",
                    width: "94%",
                  },
                  {
                    title: "Operations Admin",
                    value: "89%",
                    width: "89%",
                  },
                  {
                    title: "Finance Admin",
                    value: "83%",
                    width: "83%",
                  },
                  {
                    title: "Support Admin",
                    value: "78%",
                    width: "78%",
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

          {/* AI Recommendations */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">

            <h2 className="text-3xl font-bold">
              AI Permission Insights
            </h2>

            <p className="mt-3 text-indigo-100">
              AI analyzes permission usage and recommends security improvements.
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Unused Permissions",
                  value: "14",
                },
                {
                  title: "High Risk Roles",
                  value: "2",
                },
                {
                  title: "Security Score",
                  value: "96%",
                },
                {
                  title: "Policy Compliance",
                  value: "98%",
                },
              ].map((item) => (

                <div
                  key={item.title}
                  className="rounded-2xl bg-white/10 p-6 backdrop-blur"
                >

                  <h3 className="font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-4 text-3xl font-bold">
                    {item.value}
                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* Security Alerts */}

          <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 p-8">

            <h2 className="text-3xl font-bold text-red-700">
              Security Alerts
            </h2>

            <div className="mt-8 space-y-4">

              {[
                "Review inactive administrator accounts older than 90 days.",
                "Enable mandatory MFA for all privileged roles.",
                "Rotate API credentials this month.",
                "Audit Super Admin permissions every quarter.",
              ].map((alert, index) => (

                <div
                  key={index}
                  className="rounded-xl bg-white p-4 shadow-sm"
                >

                  ⚠️ {alert}

                </div>

              ))}

            </div>

          </div>

          {/* Footer */}

          <footer className="mt-12 rounded-3xl bg-white p-8 text-center shadow-sm">

            <h3 className="text-2xl font-bold">
              Enterprise Role Management
            </h3>

            <p className="mt-3 text-gray-500">
              Securely manage roles, permissions, policies, and administrator access
              across the entire RuchiGo platform with enterprise-grade controls.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <button className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600">

                Export Permission Report

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Download Audit Logs

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                View Security Policies

              </button>

            </div>

            <p className="mt-8 text-sm text-gray-400">
              © 2026 RuchiGo Technologies • Enterprise Identity & Access Management
            </p>

          </footer>

        </section>

      </main>

    </>

  );

}