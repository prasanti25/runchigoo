import Navbar from "../../components/Navbar.jsx";

import {
  Bell,
  Send,
  Mail,
  MessageSquare,
  Smartphone,
  Users,
  Search,
  Filter,
  Download,
  TrendingUp,
  CalendarDays,
  Activity,
} from "lucide-react";

export default function NotificationManagement() {

  const stats = [
    {
      title: "Notifications Sent",
      value: "2.84 M",
      icon: Bell,
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Email Campaigns",
      value: "148",
      icon: Mail,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "SMS Campaigns",
      value: "96",
      icon: MessageSquare,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Push Campaigns",
      value: "214",
      icon: Smartphone,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const campaigns = [
    {
      name: "Weekend Offer",
      channel: "Push",
      audience: "All Customers",
      status: "Running",
    },
    {
      name: "Festival Sale",
      channel: "Email",
      audience: "Premium Users",
      status: "Scheduled",
    },
    {
      name: "Referral Reminder",
      channel: "SMS",
      audience: "New Users",
      status: "Running",
    },
    {
      name: "Flash Deal",
      channel: "Push",
      audience: "Hyderabad",
      status: "Completed",
    },
  ];

  return (

    <>

      <Navbar />

      <main className="min-h-screen bg-[#fffaf7]">

        <section className="mx-auto max-w-7xl px-6 py-10">

          {/* Header */}

          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="font-semibold text-red-500">

                Super Administrator

              </p>

              <h1 className="mt-2 text-4xl font-bold">

                Notification Management Center

              </h1>

              <p className="mt-3 max-w-3xl text-gray-500">

                Create, schedule and monitor push notifications,
                emails, SMS campaigns and customer communication
                across the entire RuchiGo platform.

              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700">

              <Send size={20} />

              New Campaign

            </button>

          </div>

          {/* KPI Cards */}

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

                    <TrendingUp className="text-green-500" />

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

          {/* Search */}

          <div className="mt-10 rounded-3xl bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-4 lg:flex-row">

              <div className="relative flex-1">

                <Search
                  size={20}
                  className="absolute left-4 top-3.5 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search notification campaigns..."
                  className="w-full rounded-xl border py-3 pl-12 pr-4 outline-none focus:border-red-500"
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

          {/* Campaign Management */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold">

                Campaign Management

              </h2>

              <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-600">

                {campaigns.length} Campaigns

              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="px-4 py-4">Campaign</th>

                    <th className="px-4 py-4">Channel</th>

                    <th className="px-4 py-4">Audience</th>

                    <th className="px-4 py-4">Status</th>

                    <th className="px-4 py-4">Action</th>

                  </tr>

                </thead>

                <tbody>

                  {campaigns.map((campaign) => (

                    <tr
                      key={campaign.name}
                      className="border-b transition hover:bg-red-50"
                    >

                      <td className="px-4 py-5 font-semibold">

                        {campaign.name}

                      </td>

                      <td className="px-4 py-5">

                        {campaign.channel}

                      </td>

                      <td className="px-4 py-5">

                        {campaign.audience}

                      </td>

                      <td className="px-4 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            campaign.status === "Running"
                              ? "bg-green-100 text-green-600"
                              : campaign.status === "Scheduled"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >

                          {campaign.status}

                        </span>

                      </td>

                      <td className="px-4 py-5">

                        <button className="rounded-lg bg-red-100 px-4 py-2 text-red-600 hover:bg-red-200">

                          Manage

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* Customer Segmentation */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Users className="text-blue-600" />

                <h2 className="text-2xl font-bold">

                  Customer Segments

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["All Customers", "2.8 Million"],
                  ["Premium Members", "148,000"],
                  ["New Customers", "84,000"],
                  ["Inactive Users", "32,500"],
                  ["Restaurant Owners", "3,246"],
                  ["Delivery Partners", "5,428"],
                ].map(([segment, count]) => (

                  <div
                    key={segment}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{segment}</span>

                    <span className="font-semibold text-blue-600">

                      {count}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* Campaign Scheduler */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <CalendarDays className="text-purple-600" />

                <h2 className="text-2xl font-bold">

                  Campaign Scheduler

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Lunch Offer", "Today 12:00 PM"],
                  ["Weekend Sale", "Saturday 09:00 AM"],
                  ["Festival Campaign", "15 Aug 08:00 AM"],
                  ["Referral Reminder", "Every Friday"],
                  ["Cashback Offer", "1 Sep 10:00 AM"],
                ].map(([campaign, time]) => (

                  <div
                    key={campaign}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{campaign}</span>

                    <span className="font-semibold text-purple-600">

                      {time}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Notification Channels */}

          <div className="mt-10 grid gap-8 lg:grid-cols-3">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <Smartphone className="mb-4 text-purple-600" size={32} />

              <h2 className="text-2xl font-bold">

                Push Notifications

              </h2>

              <p className="mt-4 text-gray-500">

                Deliver instant alerts, order updates, offers,
                promotions, reminders and personalized notifications.

              </p>

              <button className="mt-6 rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700">

                Manage Push

              </button>

            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <Mail className="mb-4 text-blue-600" size={32} />

              <h2 className="text-2xl font-bold">

                Email Campaigns

              </h2>

              <p className="mt-4 text-gray-500">

                Create newsletters, promotional emails,
                transactional emails and customer engagement campaigns.

              </p>

              <button className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">

                Manage Emails

              </button>

            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <MessageSquare className="mb-4 text-green-600" size={32} />

              <h2 className="text-2xl font-bold">

                SMS Broadcast

              </h2>

              <p className="mt-4 text-gray-500">

                Send OTPs, delivery updates,
                reminders and marketing SMS campaigns.

              </p>

              <button className="mt-6 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700">

                Manage SMS

              </button>

            </div>

          </div>

          {/* Delivery Analytics */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Notification Analytics */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <TrendingUp className="text-red-600" />

                <h2 className="text-2xl font-bold">

                  Notification Analytics

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Notifications Delivered", "2.82 M"],
                  ["Open Rate", "81.4%"],
                  ["Click Through Rate", "42.8%"],
                  ["Conversion Rate", "19.6%"],
                ].map(([title, value]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-red-600">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* Live Activity */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Activity className="text-indigo-600" />

                <h2 className="text-2xl font-bold">

                  Live Notification Activity

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Order Delivered Alert", "12 sec ago"],
                  ["Festival Push Sent", "1 min ago"],
                  ["OTP SMS Delivered", "2 mins ago"],
                  ["Email Campaign Started", "5 mins ago"],
                  ["Referral Notification", "8 mins ago"],
                ].map(([title, time]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-indigo-600">

                      {time}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* AI Campaign Insights */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-red-600 via-pink-600 to-purple-700 p-8 text-white">

            <div className="flex items-center gap-3">

              <Bell size={32} />

              <h2 className="text-3xl font-bold">

                AI Campaign Insights

              </h2>

            </div>

            <p className="mt-4 text-red-100">

              AI analyzes user engagement, predicts campaign performance,
              recommends the best sending time, identifies high-value
              customer segments, optimizes notification frequency,
              and improves delivery and conversion rates automatically.

            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "Best Send Time",
                  value: "7:30 PM",
                },
                {
                  title: "Predicted CTR",
                  value: "45%",
                },
                {
                  title: "AI Confidence",
                  value: "98.7%",
                },
                {
                  title: "Audience Match",
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

                  <p className="mt-4 text-3xl font-bold">

                    {item.value}

                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* Quick Actions */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">

              Quick Notification Actions

            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              {[
                "Create Campaign",
                "Send Push Notification",
                "Broadcast SMS",
                "Compose Email",
                "Schedule Campaign",
                "View Analytics",
                "Export Reports",
                "Notification History",
              ].map((action) => (

                <button
                  key={action}
                  className="rounded-2xl border p-5 font-semibold transition hover:border-red-500 hover:bg-red-50"
                >

                  {action}

                </button>

              ))}

            </div>

          </div>

          {/* Footer */}

          <footer className="mt-12 rounded-3xl bg-white p-8 text-center shadow-sm">

            <Bell
              size={42}
              className="mx-auto text-red-600"
            />

            <h2 className="mt-4 text-2xl font-bold">

              Enterprise Notification Management Center

            </h2>

            <p className="mt-3 text-gray-500">

              Manage push notifications, email campaigns, SMS broadcasts,
              customer segmentation, scheduling, AI-powered engagement,
              delivery analytics, and enterprise communication from one
              centralized dashboard.

            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <button className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700">

                Export Campaign Report

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Campaign Analytics

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Notification Logs

              </button>

            </div>

            <p className="mt-8 text-sm text-gray-400">

              © 2026 RuchiGo Technologies • Enterprise Notification Suite

            </p>

          </footer>

        </section>

      </main>

    </>

  );

}