import Navbar from "../components/Navbar.jsx";

import {
  Settings as SettingsIcon,
  Bell,
  User,
  Lock,
  Moon,
  Globe,
  MapPin,
} from "lucide-react";

import { useState } from "react";

export default function Settings() {

  const [pushNotifications, setPushNotifications] =
    useState(true);

  const [orderUpdates, setOrderUpdates] =
    useState(true);

  const [offers, setOffers] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(false);

  const [locationEnabled, setLocationEnabled] =
    useState(true);

  return (

    <>

      <Navbar />

      <main className="min-h-screen bg-[#fffaf7]">

        <section className="mx-auto max-w-5xl px-6 py-10">

          {/* Header */}

          <div className="mb-10">

            <p className="font-semibold text-orange-500">
              Account
            </p>

            <h1 className="mt-2 text-4xl font-bold text-gray-900">
              Settings
            </h1>

            <p className="mt-3 text-gray-500">
              Manage your account preferences and privacy settings.
            </p>

          </div>

          {/* Account */}

          <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <User className="text-orange-500" />

              <h2 className="text-2xl font-bold">
                Account
              </h2>

            </div>

            <button className="mb-3 flex w-full items-center justify-between rounded-xl border border-orange-100 p-4 transition hover:bg-orange-50">

              <span>Edit Profile</span>

              ➜

            </button>

            <button className="flex w-full items-center justify-between rounded-xl border border-orange-100 p-4 transition hover:bg-orange-50">

              <span>Change Password</span>

              ➜

            </button>

          </div>

          {/* Notifications */}

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <Bell className="text-orange-500" />

              <h2 className="text-2xl font-bold">
                Notifications
              </h2>

            </div>
                        {/* Push Notifications */}

            <div className="mb-4 flex items-center justify-between rounded-xl border border-orange-100 p-4">

              <div>

                <h3 className="font-semibold text-gray-900">
                  Push Notifications
                </h3>

                <p className="text-sm text-gray-500">
                  Receive notifications about your account.
                </p>

              </div>

              <button
                onClick={() => setPushNotifications(!pushNotifications)}
                className={`h-7 w-14 rounded-full transition ${
                  pushNotifications ? "bg-orange-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-full bg-white transition ${
                    pushNotifications
                      ? "translate-x-7"
                      : "translate-x-1"
                  }`}
                />
              </button>

            </div>

            {/* Order Updates */}

            <div className="mb-4 flex items-center justify-between rounded-xl border border-orange-100 p-4">

              <div>

                <h3 className="font-semibold text-gray-900">
                  Order Updates
                </h3>

                <p className="text-sm text-gray-500">
                  Get notified about order status and delivery updates.
                </p>

              </div>

              <button
                onClick={() => setOrderUpdates(!orderUpdates)}
                className={`h-7 w-14 rounded-full transition ${
                  orderUpdates ? "bg-orange-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-full bg-white transition ${
                    orderUpdates
                      ? "translate-x-7"
                      : "translate-x-1"
                  }`}
                />
              </button>

            </div>

            {/* Promotional Offers */}

            <div className="flex items-center justify-between rounded-xl border border-orange-100 p-4">

              <div>

                <h3 className="font-semibold text-gray-900">
                  Promotional Offers
                </h3>

                <p className="text-sm text-gray-500">
                  Receive coupons and exclusive offers.
                </p>

              </div>

              <button
                onClick={() => setOffers(!offers)}
                className={`h-7 w-14 rounded-full transition ${
                  offers ? "bg-orange-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-full bg-white transition ${
                    offers
                      ? "translate-x-7"
                      : "translate-x-1"
                  }`}
                />
              </button>

            </div>

          </div>

          {/* Preferences */}

          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <SettingsIcon className="text-orange-500" />

              <h2 className="text-2xl font-bold">
                Preferences
              </h2>

            </div>

            {/* Dark Mode */}

            <div className="mb-4 flex items-center justify-between rounded-xl border border-orange-100 p-4">

              <div className="flex items-center gap-3">

                <Moon className="text-orange-500" />

                <span className="font-medium">
                  Dark Mode
                </span>

              </div>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`h-7 w-14 rounded-full transition ${
                  darkMode ? "bg-orange-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-full bg-white transition ${
                    darkMode
                      ? "translate-x-7"
                      : "translate-x-1"
                  }`}
                />
              </button>

            </div>

            {/* Language */}

            <div className="mb-4 flex items-center justify-between rounded-xl border border-orange-100 p-4">

              <div className="flex items-center gap-3">

                <Globe className="text-orange-500" />

                <span className="font-medium">
                  Language
                </span>

              </div>

              <select className="rounded-lg border border-orange-200 px-4 py-2 outline-none">

                <option>English</option>

                <option>తెలుగు</option>

                <option>Hindi</option>

              </select>

            </div>

            {/* Location */}

            <div className="flex items-center justify-between rounded-xl border border-orange-100 p-4">

              <div className="flex items-center gap-3">

                <MapPin className="text-orange-500" />

                <span className="font-medium">
                  Location Access
                </span>

              </div>

              <button
                onClick={() => setLocationEnabled(!locationEnabled)}
                className={`h-7 w-14 rounded-full transition ${
                  locationEnabled ? "bg-orange-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-full bg-white transition ${
                    locationEnabled
                      ? "translate-x-7"
                      : "translate-x-1"
                  }`}
                />
              </button>

            </div>

          </div>

          {/* Privacy */}

          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <Lock className="text-orange-500" />

              <h2 className="text-2xl font-bold">
                Privacy & Security
              </h2>

            </div>

            <button className="mb-3 flex w-full items-center justify-between rounded-xl border border-orange-100 p-4 transition hover:bg-orange-50">

              <span>Two-Factor Authentication</span>

              ➜

            </button>

            <button className="mb-3 flex w-full items-center justify-between rounded-xl border border-orange-100 p-4 transition hover:bg-orange-50">

              <span>Privacy Policy</span>

              ➜

            </button>

            <button className="flex w-full items-center justify-between rounded-xl border border-orange-100 p-4 transition hover:bg-orange-50">

              <span>Terms & Conditions</span>

              ➜

            </button>

          </div>
                    {/* Account Actions */}

          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">

            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Account Actions
            </h2>

            <div className="space-y-4">

              <button className="w-full rounded-xl bg-orange-500 px-6 py-4 font-semibold text-white transition hover:bg-orange-600">
                Logout
              </button>

              <button className="w-full rounded-xl border border-red-300 px-6 py-4 font-semibold text-red-600 transition hover:bg-red-500 hover:text-white">
                Delete Account
              </button>

            </div>

          </div>

        </section>

      </main>

    </>

  );

}