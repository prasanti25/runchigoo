import Navbar from "../../components/Navbar.jsx";

import {
  Bell,
  Globe,
  Moon,
  Sun,
  Truck,
  Shield,
} from "lucide-react";

export default function DeliverySettings() {

  return (

    <>

      <Navbar />

      <main className="min-h-screen bg-[#fffaf7]">

        <section className="mx-auto max-w-7xl px-6 py-10">

          {/* Header */}

          <div className="mb-10">

            <p className="font-semibold text-orange-500">
              Delivery Partner
            </p>

            <h1 className="mt-2 text-4xl font-bold text-gray-900">
              Settings
            </h1>

            <p className="mt-3 text-gray-500">
              Manage your notifications, delivery preferences, privacy, and account settings.
            </p>

          </div>

          {/* Notification Settings */}

          <div className="rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-8 flex items-center gap-4">

              <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">

                <Bell size={28} />

              </div>

              <div>

                <h2 className="text-2xl font-bold text-gray-900">
                  Notification Settings
                </h2>

                <p className="text-gray-500">
                  Control alerts and updates.
                </p>

              </div>

            </div>

            <div className="space-y-6">

              {[
                "New Delivery Requests",
                "Order Status Updates",
                "Payment Notifications",
                "Promotional Offers",
              ].map((item) => (

                <div
                  key={item}
                  className="flex items-center justify-between rounded-2xl border p-5"
                >

                  <span className="font-medium text-gray-700">
                    {item}
                  </span>

                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-5 w-5 accent-orange-500"
                  />

                </div>

              ))}

            </div>

          </div>

          {/* Appearance & Language */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Appearance */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-8 flex items-center gap-4">

                <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600">

                  <Moon size={28} />

                </div>

                <div>

                  <h2 className="text-2xl font-bold text-gray-900">
                    Appearance
                  </h2>

                  <p className="text-gray-500">
                    Customize how the application looks.
                  </p>

                </div>

              </div>

              <div className="space-y-5">

                <label className="flex cursor-pointer items-center justify-between rounded-2xl border p-5">

                  <div className="flex items-center gap-3">

                    <Sun className="text-yellow-500" size={22} />

                    <span className="font-medium">
                      Light Mode
                    </span>

                  </div>

                  <input
                    type="radio"
                    name="theme"
                    defaultChecked
                    className="accent-orange-500"
                  />

                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-2xl border p-5">

                  <div className="flex items-center gap-3">

                    <Moon className="text-indigo-600" size={22} />

                    <span className="font-medium">
                      Dark Mode
                    </span>

                  </div>

                  <input
                    type="radio"
                    name="theme"
                    className="accent-orange-500"
                  />

                </label>

              </div>

            </div>

            {/* Language */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-8 flex items-center gap-4">

                <div className="rounded-2xl bg-blue-100 p-3 text-blue-600">

                  <Globe size={28} />

                </div>

                <div>

                  <h2 className="text-2xl font-bold text-gray-900">
                    Language
                  </h2>

                  <p className="text-gray-500">
                    Choose your preferred language.
                  </p>

                </div>

              </div>

              <select className="w-full rounded-2xl border p-4 outline-none focus:border-orange-500">

                <option>English</option>
                <option>తెలుగు</option>
                <option>हिन्दी</option>
                <option>தமிழ்</option>
                <option>ಕನ್ನಡ</option>

              </select>

            </div>

          </div>

          {/* Availability */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-8 flex items-center gap-4">

              <div className="rounded-2xl bg-green-100 p-3 text-green-600">

                <Truck size={28} />

              </div>

              <div>

                <h2 className="text-2xl font-bold text-gray-900">
                  Delivery Availability
                </h2>

                <p className="text-gray-500">
                  Control when you are available to accept delivery requests.
                </p>

              </div>

            </div>

            <div className="space-y-5">

              <div className="flex items-center justify-between rounded-2xl border p-5">

                <div>

                  <h3 className="font-semibold text-gray-900">
                    Go Online
                  </h3>

                  <p className="text-sm text-gray-500">
                    Receive new delivery requests.
                  </p>

                </div>

                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 w-5 accent-green-500"
                />

              </div>

              <div className="flex items-center justify-between rounded-2xl border p-5">

                <div>

                  <h3 className="font-semibold text-gray-900">
                    Auto Accept Orders
                  </h3>

                  <p className="text-sm text-gray-500">
                    Automatically accept nearby delivery requests.
                  </p>

                </div>

                <input
                  type="checkbox"
                  className="h-5 w-5 accent-green-500"
                />

              </div>

              <div className="flex items-center justify-between rounded-2xl border p-5">

                <div>

                  <h3 className="font-semibold text-gray-900">
                    Weekend Availability
                  </h3>

                  <p className="text-sm text-gray-500">
                    Stay available on Saturdays and Sundays.
                  </p>

                </div>

                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 w-5 accent-green-500"
                />

              </div>

            </div>

          </div>

          {/* Privacy & Security */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Privacy & Security */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-8 flex items-center gap-4">

                <div className="rounded-2xl bg-red-100 p-3 text-red-600">

                  <Shield size={28} />

                </div>

                <div>

                  <h2 className="text-2xl font-bold text-gray-900">
                    Privacy & Security
                  </h2>

                  <p className="text-gray-500">
                    Manage your account security and privacy preferences.
                  </p>

                </div>

              </div>

              <div className="space-y-5">

                <div className="flex items-center justify-between rounded-2xl border p-5">

                  <div>

                    <h3 className="font-semibold text-gray-900">
                      Two-Factor Authentication
                    </h3>

                    <p className="text-sm text-gray-500">
                      Secure your account with OTP verification.
                    </p>

                  </div>

                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-5 w-5 accent-red-500"
                  />

                </div>

                <div className="flex items-center justify-between rounded-2xl border p-5">

                  <div>

                    <h3 className="font-semibold text-gray-900">
                      Face ID / Fingerprint Login
                    </h3>

                    <p className="text-sm text-gray-500">
                      Use biometric authentication to sign in.
                    </p>

                  </div>

                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-red-500"
                  />

                </div>

                <div className="flex items-center justify-between rounded-2xl border p-5">

                  <div>

                    <h3 className="font-semibold text-gray-900">
                      Login Alerts
                    </h3>

                    <p className="text-sm text-gray-500">
                      Get notified whenever your account is accessed.
                    </p>

                  </div>

                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-5 w-5 accent-red-500"
                  />

                </div>

              </div>

            </div>

            {/* Change Password */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="mb-8 text-2xl font-bold text-gray-900">
                Change Password
              </h2>

              <div className="space-y-5">

                <div>

                  <label className="mb-2 block font-medium">
                    Current Password
                  </label>

                  <input
                    type="password"
                    placeholder="Enter current password"
                    className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    New Password
                  </label>

                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                  />

                </div>

                <button className="w-full rounded-2xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600">

                  Update Password

                </button>

              </div>

            </div>

          </div>

          {/* Location & App Permissions */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="mb-8 text-2xl font-bold text-gray-900">
              Location & App Permissions
            </h2>

            <div className="space-y-5">

              {[
                {
                  title: "Location Access",
                  desc: "Required for navigation and assigning nearby deliveries.",
                },
                {
                  title: "Camera Access",
                  desc: "Required for scanning QR codes and uploading documents.",
                },
                {
                  title: "Storage Access",
                  desc: "Required for downloading invoices and uploading files.",
                },
                {
                  title: "Push Notifications",
                  desc: "Receive delivery requests and important alerts instantly.",
                },
              ].map((permission) => (

                <div
                  key={permission.title}
                  className="flex items-center justify-between rounded-2xl border p-5"
                >

                  <div>

                    <h3 className="font-semibold text-gray-900">
                      {permission.title}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {permission.desc}
                    </p>

                  </div>

                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-5 w-5 accent-orange-500"
                  />

                </div>

              ))}

            </div>

          </div>

          {/* Account Actions */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Settings Tips */}

            <div className="rounded-3xl bg-green-50 p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-green-700">
                💡 Settings Tips
              </h2>

              <ul className="mt-6 list-disc space-y-3 pl-6 text-gray-700">

                <li>Enable Two-Factor Authentication for extra account security.</li>

                <li>Keep Location permission enabled to receive nearby delivery requests.</li>

                <li>Turn on Push Notifications so you never miss an order.</li>

                <li>Regularly update your password to protect your account.</li>

                <li>Use Light or Dark mode based on your preference.</li>

                <li>Review your notification settings to reduce unwanted alerts.</li>

              </ul>

            </div>

            {/* Account Actions */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-bold text-gray-900">
                Account Actions
              </h2>

              <p className="mt-2 text-gray-500">
                Manage your account or sign out from the application.
              </p>

              <div className="mt-8 space-y-5">

                <button
                  className="w-full rounded-2xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600"
                >
                  💾 Save Settings
                </button>

                <button
                  className="w-full rounded-2xl border border-gray-300 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  🔄 Reset to Default
                </button>

                <button
                  className="w-full rounded-2xl bg-red-500 py-3 font-semibold text-white transition hover:bg-red-600"
                >
                  🚪 Logout
                </button>

                <button
                  className="w-full rounded-2xl border border-red-500 py-3 font-semibold text-red-600 transition hover:bg-red-50"
                >
                  ❌ Delete Account
                </button>

              </div>

            </div>

          </div>

          {/* App Information */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="flex flex-col items-center justify-between gap-6 text-center lg:flex-row lg:text-left">

              <div>

                <h2 className="text-2xl font-bold text-gray-900">
                  RuchiGo Delivery Partner App
                </h2>

                <p className="mt-2 text-gray-500">
                  Version 1.0.0 • Build 2026.07
                </p>

                <p className="mt-2 text-sm text-gray-400">
                  © 2026 RuchiGo Technologies. All Rights Reserved.
                </p>

              </div>

              <button className="rounded-2xl border border-orange-500 px-6 py-3 font-semibold text-orange-600 transition hover:bg-orange-50">

                Check for Updates

              </button>

            </div>

          </div>

        </section>

      </main>

    </>

  );

}