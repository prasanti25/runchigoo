import Navbar from "../../components/Navbar.jsx";

import {
  Building2,
  Palette,
  Globe,
  Save,
} from "lucide-react";

export default function PlatformSettings() {

  return (

    <>

      <Navbar />

      <main className="min-h-screen bg-[#fffaf7]">

        <section className="mx-auto max-w-7xl px-6 py-10">

          {/* Header */}

          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="font-semibold text-orange-500">
                Administrator Panel
              </p>

              <h1 className="mt-2 text-4xl font-bold text-gray-900">
                Platform Settings
              </h1>

              <p className="mt-3 text-gray-500">
                Configure branding, payments, delivery, security and overall platform preferences.
              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600">

              <Save size={18} />

              Save Changes

            </button>

          </div>

          {/* Company Information */}

          <div className="rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-8 flex items-center gap-3">

              <Building2 className="text-orange-500" />

              <h2 className="text-2xl font-bold">
                Company Information
              </h2>

            </div>

            <div className="grid gap-6 md:grid-cols-2">

              <div>

                <label className="mb-2 block font-medium">
                  Company Name
                </label>

                <input
                  type="text"
                  defaultValue="RuchiGo Technologies"
                  className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                />

              </div>

              <div>

                <label className="mb-2 block font-medium">
                  Brand Name
                </label>

                <input
                  type="text"
                  defaultValue="RuchiGo"
                  className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                />

              </div>

              <div>

                <label className="mb-2 block font-medium">
                  Support Email
                </label>

                <input
                  type="email"
                  defaultValue="support@ruchigo.com"
                  className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                />

              </div>

              <div>

                <label className="mb-2 block font-medium">
                  Contact Number
                </label>

                <input
                  type="text"
                  defaultValue="+91 9876543210"
                  className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                />

              </div>

            </div>

          </div>

          {/* Branding */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Branding Settings */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-8 flex items-center gap-3">

                <Palette className="text-orange-500" />

                <h2 className="text-2xl font-bold">
                  Branding Settings
                </h2>

              </div>

              <div className="space-y-6">

                <div>

                  <label className="mb-2 block font-medium">
                    Primary Color
                  </label>

                  <input
                    type="color"
                    defaultValue="#f97316"
                    className="h-12 w-full rounded-xl border"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    Secondary Color
                  </label>

                  <input
                    type="color"
                    defaultValue="#0f172a"
                    className="h-12 w-full rounded-xl border"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    Logo URL
                  </label>

                  <input
                    type="text"
                    placeholder="https://example.com/logo.png"
                    className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    Favicon URL
                  </label>

                  <input
                    type="text"
                    placeholder="https://example.com/favicon.ico"
                    className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                  />

                </div>

                <div className="flex items-center justify-between rounded-2xl border p-4">

                  <div>

                    <h3 className="font-semibold">
                      Enable Dark Mode
                    </h3>

                    <p className="text-sm text-gray-500">
                      Allow dark theme across the admin panel.
                    </p>

                  </div>

                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-orange-500"
                  />

                </div>

              </div>

            </div>

            {/* Delivery Settings */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-8 flex items-center gap-3">

                <Globe className="text-orange-500" />

                <h2 className="text-2xl font-bold">
                  Delivery Settings
                </h2>

              </div>

              <div className="space-y-6">

                <div>

                  <label className="mb-2 block font-medium">
                    Delivery Radius (km)
                  </label>

                  <input
                    type="number"
                    defaultValue="15"
                    className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    Minimum Order Value
                  </label>

                  <input
                    type="number"
                    defaultValue="149"
                    className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    Delivery Charge
                  </label>

                  <input
                    type="number"
                    defaultValue="30"
                    className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    Free Delivery Above
                  </label>

                  <input
                    type="number"
                    defaultValue="499"
                    className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    Service Cities
                  </label>

                  <textarea
                    rows={4}
                    defaultValue="Hyderabad, Bengaluru, Chennai, Mumbai, Pune"
                    className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                  />

                </div>

              </div>

            </div>

          </div>

          {/* Commission & Payment Gateway */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Commission Settings */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="mb-8 text-2xl font-bold">
                Commission Settings
              </h2>

              <div className="space-y-6">

                <div>

                  <label className="mb-2 block font-medium">
                    Restaurant Commission (%)
                  </label>

                  <input
                    type="number"
                    defaultValue="18"
                    className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    Delivery Partner Commission (%)
                  </label>

                  <input
                    type="number"
                    defaultValue="82"
                    className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    Platform Service Fee (₹)
                  </label>

                  <input
                    type="number"
                    defaultValue="5"
                    className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    GST (%)
                  </label>

                  <input
                    type="number"
                    defaultValue="18"
                    className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                  />

                </div>

              </div>

            </div>

            {/* Payment Gateway */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="mb-8 text-2xl font-bold">
                Payment Gateway Settings
              </h2>

              <div className="space-y-5">

                {[
                  "Razorpay",
                  "Stripe",
                  "PayPal",
                  "PhonePe",
                  "Google Pay",
                  "Cash On Delivery",
                ].map((gateway) => (

                  <div
                    key={gateway}
                    className="flex items-center justify-between rounded-2xl border p-4"
                  >

                    <div>

                      <h3 className="font-semibold">
                        {gateway}
                      </h3>

                      <p className="text-sm text-gray-500">
                        Enable or disable this payment option.
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

          </div>

          {/* Notifications & Security */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Notification Settings */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="mb-8 text-2xl font-bold">
                Notification Settings
              </h2>

              <div className="space-y-5">

                {[
                  {
                    title: "Push Notifications",
                    desc: "Send instant mobile notifications."
                  },
                  {
                    title: "Email Notifications",
                    desc: "Send transactional emails."
                  },
                  {
                    title: "SMS Notifications",
                    desc: "Notify users through SMS."
                  },
                  {
                    title: "Promotional Notifications",
                    desc: "Marketing campaigns and offers."
                  },
                  {
                    title: "Order Alerts",
                    desc: "Real-time order status updates."
                  },
                  {
                    title: "Admin Alerts",
                    desc: "Receive important platform alerts."
                  },
                ].map((item) => (

                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <div>

                      <h3 className="font-semibold">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {item.desc}
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

            {/* Security Settings */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="mb-8 text-2xl font-bold">
                Security Settings
              </h2>

              <div className="space-y-6">

                <div>

                  <label className="mb-2 block font-medium">
                    Session Timeout (Minutes)
                  </label>

                  <input
                    type="number"
                    defaultValue="30"
                    className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    Maximum Login Attempts
                  </label>

                  <input
                    type="number"
                    defaultValue="5"
                    className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    Password Policy
                  </label>

                  <select className="w-full rounded-xl border p-3 outline-none">

                    <option>Strong</option>
                    <option>Medium</option>
                    <option>Basic</option>

                  </select>

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    API Key
                  </label>

                  <input
                    type="password"
                    defaultValue="RG-8DJ29XK2-3KLMN-XXXX"
                    className="w-full rounded-xl border p-3 outline-none"
                  />

                </div>

                <div className="flex items-center justify-between rounded-2xl border p-5">

                  <div>

                    <h3 className="font-semibold">
                      Two Factor Authentication
                    </h3>

                    <p className="text-sm text-gray-500">
                      Require OTP verification for admin accounts.
                    </p>

                  </div>

                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-5 w-5 accent-orange-500"
                  />

                </div>

              </div>

            </div>

          </div>

          {/* Roles & Localization */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Roles & Permissions */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="mb-8 text-2xl font-bold">
                Roles & Permissions
              </h2>

              <div className="space-y-4">

                {[
                  "Super Admin",
                  "Admin",
                  "Restaurant Manager",
                  "Delivery Manager",
                  "Customer Support",
                ].map((role) => (

                  <div
                    key={role}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <div>

                      <h3 className="font-semibold">
                        {role}
                      </h3>

                      <p className="text-sm text-gray-500">
                        Manage permissions and access.
                      </p>

                    </div>

                    <button className="rounded-xl bg-orange-500 px-5 py-2 font-semibold text-white hover:bg-orange-600">

                      Configure

                    </button>

                  </div>

                ))}

              </div>

            </div>

            {/* Localization */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="mb-8 text-2xl font-bold">
                Localization
              </h2>

              <div className="space-y-6">

                <div>

                  <label className="mb-2 block font-medium">
                    Default Language
                  </label>

                  <select className="w-full rounded-xl border p-3">

                    <option>English</option>
                    <option>Telugu</option>
                    <option>Hindi</option>
                    <option>Tamil</option>

                  </select>

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    Currency
                  </label>

                  <select className="w-full rounded-xl border p-3">

                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>

                  </select>

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    Time Zone
                  </label>

                  <select className="w-full rounded-xl border p-3">

                    <option>Asia/Kolkata (IST)</option>
                    <option>UTC</option>
                    <option>America/New_York</option>

                  </select>

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    Date Format
                  </label>

                  <select className="w-full rounded-xl border p-3">

                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>

                  </select>

                </div>

              </div>

            </div>

          </div>

          {/* Backup & Maintenance */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Backup & Restore */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="mb-8 text-2xl font-bold">
                Backup & Restore
              </h2>

              <div className="space-y-6">

                <div>

                  <label className="mb-2 block font-medium">
                    Backup Frequency
                  </label>

                  <select className="w-full rounded-xl border p-3 outline-none">

                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>

                  </select>

                </div>

                <div className="flex items-center justify-between rounded-2xl border p-5">

                  <div>

                    <h3 className="font-semibold">
                      Automatic Backup
                    </h3>

                    <p className="text-sm text-gray-500">
                      Automatically backup database and media files.
                    </p>

                  </div>

                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-5 w-5 accent-orange-500"
                  />

                </div>

                <div className="flex flex-wrap gap-4">

                  <button className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600">

                    Create Backup

                  </button>

                  <button className="rounded-xl border px-5 py-3 font-semibold hover:bg-gray-100">

                    Download Backup

                  </button>

                </div>

                <button className="w-full rounded-xl border border-green-500 py-3 font-semibold text-green-600 hover:bg-green-50">

                  Restore Latest Backup

                </button>

              </div>

            </div>

            {/* Maintenance Mode */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <h2 className="mb-8 text-2xl font-bold">
                Maintenance Settings
              </h2>

              <div className="space-y-6">

                <div className="flex items-center justify-between rounded-2xl border p-5">

                  <div>

                    <h3 className="font-semibold">
                      Maintenance Mode
                    </h3>

                    <p className="text-sm text-gray-500">
                      Temporarily disable customer access.
                    </p>

                  </div>

                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-orange-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    Maintenance Message
                  </label>

                  <textarea
                    rows={4}
                    defaultValue="We're improving your experience. Please check back shortly."
                    className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    Scheduled Maintenance
                  </label>

                  <input
                    type="datetime-local"
                    className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                  />

                </div>

              </div>

            </div>

          </div>

          {/* System Information */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">
              System Information
            </h2>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Platform Version",
                  value: "v2.4.1",
                },
                {
                  title: "Database",
                  value: "PostgreSQL 16",
                },
                {
                  title: "Backend",
                  value: "Spring Boot",
                },
                {
                  title: "Frontend",
                  value: "React + Tailwind",
                },
                {
                  title: "API Status",
                  value: "Operational",
                },
                {
                  title: "Server",
                  value: "AWS Cloud",
                },
                {
                  title: "SSL",
                  value: "Active",
                },
                {
                  title: "Last Backup",
                  value: "Today 02:15 AM",
                },
              ].map((item) => (

                <div
                  key={item.title}
                  className="rounded-2xl border p-5 hover:bg-orange-50 transition"
                >

                  <h3 className="text-sm text-gray-500">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-lg font-bold text-gray-900">
                    {item.value}
                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* Admin Recommendations */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-8 text-white">

            <h2 className="text-3xl font-bold">
              Platform Recommendations
            </h2>

            <p className="mt-3 text-orange-100">
              AI-powered suggestions to improve platform performance and security.
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">

                <h3 className="font-semibold">
                  🔐 Security
                </h3>

                <p className="mt-3 text-sm text-orange-100">
                  Rotate API keys every 90 days for enhanced security.
                </p>

              </div>

              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">

                <h3 className="font-semibold">
                  🚀 Performance
                </h3>

                <p className="mt-3 text-sm text-orange-100">
                  Enable CDN caching to improve page load speed.
                </p>

              </div>

              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">

                <h3 className="font-semibold">
                  ☁️ Backup
                </h3>

                <p className="mt-3 text-sm text-orange-100">
                  Keep weekly off-site backups for disaster recovery.
                </p>

              </div>

              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">

                <h3 className="font-semibold">
                  📈 Growth
                </h3>

                <p className="mt-3 text-sm text-orange-100">
                  Launch weekend promotions to increase order volume.
                </p>

              </div>

            </div>

          </div>

        </section>

      </main>

    </>

  );

}