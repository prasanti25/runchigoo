import Navbar from "../../components/Navbar.jsx";

import {
  User,
  Bike,
  Camera,
} from "lucide-react";

export default function DeliveryProfile() {

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
              My Profile
            </h1>

            <p className="mt-3 text-gray-500">
              Update your personal details, vehicle information and documents.
            </p>

          </div>

          {/* Profile Card */}

          <div className="rounded-3xl bg-white p-8 shadow-sm">

            <div className="flex flex-col items-center gap-6 lg:flex-row">

              <div className="relative">

                <img
                  src="https://i.pravatar.cc/200"
                  alt="Profile"
                  className="h-36 w-36 rounded-full object-cover border-4 border-orange-200"
                />

                <button className="absolute bottom-2 right-2 rounded-full bg-orange-500 p-3 text-white hover:bg-orange-600 transition">

                  <Camera size={18} />

                </button>

              </div>

              <div>

                <h2 className="text-3xl font-bold text-gray-900">
                  Pavan Kunchanapalli
                </h2>

                <p className="mt-2 text-gray-500">
                  Delivery Partner since 2025
                </p>

                <div className="mt-4 inline-flex rounded-full bg-green-100 px-4 py-2 text-green-700 font-semibold">

                  ⭐ 4.9 Rating

                </div>

              </div>

            </div>

          </div>

          {/* Personal Information */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="mb-8 text-2xl font-bold text-gray-900">
              Personal Information
            </h2>

            <div className="grid gap-6 md:grid-cols-2">

              <div>

                <label className="mb-2 block font-medium">
                  Full Name
                </label>

                <input
                  type="text"
                  defaultValue="Pavan Kunchanapalli"
                  className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                />

              </div>

              <div>

                <label className="mb-2 block font-medium">
                  Mobile Number
                </label>

                <input
                  type="text"
                  defaultValue="+91 9876543210"
                  className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                />

              </div>

              <div>

                <label className="mb-2 block font-medium">
                  Email Address
                </label>

                <input
                  type="email"
                  defaultValue="pavan@example.com"
                  className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                />

              </div>

              <div>

                <label className="mb-2 block font-medium">
                  Date of Birth
                </label>

                <input
                  type="date"
                  className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                />

              </div>

            </div>

          </div>

          {/* Vehicle Information */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="mb-8 text-2xl font-bold text-gray-900">
              Vehicle Information
            </h2>

            <div className="grid gap-6 md:grid-cols-2">

              <div>

                <label className="mb-2 block font-medium">
                  Vehicle Type
                </label>

                <select className="w-full rounded-xl border p-3 outline-none focus:border-orange-500">

                  <option>Motorcycle</option>
                  <option>Scooter</option>
                  <option>Bicycle</option>

                </select>

              </div>

              <div>

                <label className="mb-2 block font-medium">
                  Vehicle Brand
                </label>

                <input
                  type="text"
                  defaultValue="Honda Activa 6G"
                  className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                />

              </div>

              <div>

                <label className="mb-2 block font-medium">
                  Vehicle Registration Number
                </label>

                <input
                  type="text"
                  defaultValue="AP39 AB 1234"
                  className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                />

              </div>

              <div>

                <label className="mb-2 block font-medium">
                  Vehicle Color
                </label>

                <input
                  type="text"
                  defaultValue="Black"
                  className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                />

              </div>

            </div>

          </div>

          {/* License & Documents */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="mb-8 text-2xl font-bold text-gray-900">
              License & Vehicle Documents
            </h2>

            <div className="grid gap-6 md:grid-cols-2">

              <div>

                <label className="mb-2 block font-medium">
                  Driving License Number
                </label>

                <input
                  type="text"
                  defaultValue="DL-142026987654"
                  className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                />

              </div>

              <div>

                <label className="mb-2 block font-medium">
                  License Expiry Date
                </label>

                <input
                  type="date"
                  className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                />

              </div>

              <div>

                <label className="mb-2 block font-medium">
                  RC Book Number
                </label>

                <input
                  type="text"
                  defaultValue="RC2026001245"
                  className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                />

              </div>

              <div>

                <label className="mb-2 block font-medium">
                  Insurance Policy Number
                </label>

                <input
                  type="text"
                  defaultValue="INS458796321"
                  className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                />

              </div>

            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">

              <div className="rounded-2xl border-2 border-dashed border-gray-300 p-6 text-center">

                <Bike className="mx-auto mb-3 text-orange-500" size={36} />

                <h3 className="font-semibold text-gray-900">
                  RC Book
                </h3>

                <button className="mt-4 rounded-xl bg-orange-500 px-4 py-2 text-white transition hover:bg-orange-600">
                  Upload RC
                </button>

              </div>

              <div className="rounded-2xl border-2 border-dashed border-gray-300 p-6 text-center">

                <User className="mx-auto mb-3 text-blue-500" size={36} />

                <h3 className="font-semibold text-gray-900">
                  Driving License
                </h3>

                <button className="mt-4 rounded-xl bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600">
                  Upload License
                </button>

              </div>

              <div className="rounded-2xl border-2 border-dashed border-gray-300 p-6 text-center">

                <Bike className="mx-auto mb-3 text-green-500" size={36} />

                <h3 className="font-semibold text-gray-900">
                  Insurance
                </h3>

                <button className="mt-4 rounded-xl bg-green-500 px-4 py-2 text-white transition hover:bg-green-600">
                  Upload Insurance
                </button>

              </div>

            </div>

          </div>

          {/* Bank Information */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="mb-8 text-2xl font-bold text-gray-900">
              Bank Information
            </h2>

            <div className="grid gap-6 md:grid-cols-2">

              <div>

                <label className="mb-2 block font-medium">
                  Account Holder Name
                </label>

                <input
                  type="text"
                  defaultValue="Pavan Kunchanapalli"
                  className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                />

              </div>

              <div>

                <label className="mb-2 block font-medium">
                  Bank Name
                </label>

                <input
                  type="text"
                  defaultValue="State Bank of India"
                  className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                />

              </div>

              <div>

                <label className="mb-2 block font-medium">
                  Account Number
                </label>

                <input
                  type="text"
                  defaultValue="XXXXXXXX4521"
                  className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                />

              </div>

              <div>

                <label className="mb-2 block font-medium">
                  IFSC Code
                </label>

                <input
                  type="text"
                  defaultValue="SBIN0001234"
                  className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                />

              </div>

            </div>

          </div>

          {/* Performance Statistics */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="mb-8 text-2xl font-bold text-gray-900">
              Performance Statistics
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Completed Deliveries",
                  value: "1,284",
                  color: "text-orange-600",
                },
                {
                  title: "Average Rating",
                  value: "4.9 ★",
                  color: "text-yellow-500",
                },
                {
                  title: "Acceptance Rate",
                  value: "97%",
                  color: "text-green-600",
                },
                {
                  title: "On-Time Delivery",
                  value: "98%",
                  color: "text-blue-600",
                },
              ].map((stat) => (

                <div
                  key={stat.title}
                  className="rounded-2xl border bg-orange-50 p-6 text-center"
                >

                  <h3 className={`text-3xl font-bold ${stat.color}`}>
                    {stat.value}
                  </h3>

                  <p className="mt-2 text-gray-600">
                    {stat.title}
                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* Achievement Badges */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="mb-8 text-2xl font-bold text-gray-900">
              Achievement Badges
            </h2>

            <div className="grid gap-6 md:grid-cols-3">

              {[
                {
                  emoji: "🏆",
                  title: "Top Performer",
                  desc: "Completed 1000+ successful deliveries.",
                },
                {
                  emoji: "⭐",
                  title: "Customer Favorite",
                  desc: "Maintained 4.8+ rating consistently.",
                },
                {
                  emoji: "⚡",
                  title: "Fast Delivery",
                  desc: "98% on-time delivery performance.",
                },
              ].map((badge) => (

                <div
                  key={badge.title}
                  className="rounded-2xl border bg-gradient-to-br from-orange-50 to-white p-6 text-center shadow-sm"
                >

                  <div className="text-5xl">
                    {badge.emoji}
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-gray-900">
                    {badge.title}
                  </h3>

                  <p className="mt-2 text-gray-500">
                    {badge.desc}
                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* Save Profile */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-3">

            {/* Profile Completion */}

            <div className="rounded-3xl bg-white p-8 shadow-sm lg:col-span-1">

              <h2 className="text-2xl font-bold text-gray-900">
                Profile Completion
              </h2>

              <div className="mt-8">

                <div className="mb-3 flex items-center justify-between">

                  <span className="text-gray-600">
                    Completion Status
                  </span>

                  <span className="font-bold text-green-600">
                    90%
                  </span>

                </div>

                <div className="h-3 rounded-full bg-gray-200">

                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: "90%" }}
                  />

                </div>

                <ul className="mt-6 space-y-3 text-sm text-gray-600">

                  <li>✅ Personal Information Completed</li>

                  <li>✅ Vehicle Details Added</li>

                  <li>✅ Bank Information Verified</li>

                  <li>⚠ Upload Insurance Document</li>

                  <li>⚠ Verify Emergency Contact</li>

                </ul>

              </div>

            </div>

            {/* Tips */}

            <div className="rounded-3xl bg-orange-50 p-8 shadow-sm lg:col-span-2">

              <h2 className="text-2xl font-bold text-orange-700">
                💡 Profile Tips
              </h2>

              <ul className="mt-6 list-disc space-y-3 pl-6 text-gray-700">

                <li>Keep your contact details up to date.</li>

                <li>Upload clear copies of all required documents.</li>

                <li>Renew your driving license and insurance before expiry.</li>

                <li>Maintain a customer rating above <strong>4.8</strong> to receive additional incentives.</li>

                <li>Verify your bank account to avoid payout delays.</li>

                <li>Update your profile photo for easier customer identification.</li>

              </ul>

            </div>

          </div>

          {/* Action Buttons */}

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-end">

            <button
              className="rounded-2xl border border-gray-300 px-8 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Reset Changes
            </button>

            <button
              className="rounded-2xl bg-orange-500 px-8 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              Save Changes
            </button>

          </div>

        </section>

      </main>

    </>

  );

}