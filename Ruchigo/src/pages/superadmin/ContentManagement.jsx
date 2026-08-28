import Navbar from "../../components/Navbar.jsx";

import {
  FileText,
  Image,
  Layout,
  Newspaper,
  BookOpen,
  ShieldCheck,
  Search,
  Filter,
  Download,
  TrendingUp,
  Plus,
} from "lucide-react";

export default function ContentManagement() {

  const stats = [
    {
      title: "Published Pages",
      value: "128",
      icon: FileText,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Active Banners",
      value: "42",
      icon: Image,
      color: "bg-pink-100 text-pink-600",
    },
    {
      title: "Blogs",
      value: "96",
      icon: Newspaper,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Policies",
      value: "18",
      icon: ShieldCheck,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const pages = [
    {
      title: "Home Page Banner",
      category: "Banner",
      updated: "Today",
      status: "Published",
    },
    {
      title: "About Us",
      category: "Page",
      updated: "Yesterday",
      status: "Published",
    },
    {
      title: "Privacy Policy",
      category: "Policy",
      updated: "3 Days Ago",
      status: "Draft",
    },
    {
      title: "Festival Offers",
      category: "Promotion",
      updated: "1 Week Ago",
      status: "Scheduled",
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

                Content Management System

              </h1>

              <p className="mt-3 max-w-3xl text-gray-500">

                Create, edit and publish website pages,
                banners, blogs, FAQs, promotional content,
                legal documents and landing pages across
                the RuchiGo platform.

              </p>

            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">

              <Plus size={20} />

              Create Content

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
                  placeholder="Search pages, blogs or banners..."
                  className="w-full rounded-xl border py-3 pl-12 pr-4 outline-none focus:border-blue-500"
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

          {/* Content Library */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold">

                Content Library

              </h2>

              <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600">

                {pages.length} Items

              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="px-4 py-4">Title</th>

                    <th className="px-4 py-4">Category</th>

                    <th className="px-4 py-4">Last Updated</th>

                    <th className="px-4 py-4">Status</th>

                    <th className="px-4 py-4">Action</th>

                  </tr>

                </thead>

                <tbody>

                  {pages.map((page) => (

                    <tr
                      key={page.title}
                      className="border-b transition hover:bg-blue-50"
                    >

                      <td className="px-4 py-5 font-semibold">

                        {page.title}

                      </td>

                      <td className="px-4 py-5">

                        {page.category}

                      </td>

                      <td className="px-4 py-5">

                        {page.updated}

                      </td>

                      <td className="px-4 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            page.status === "Published"
                              ? "bg-green-100 text-green-600"
                              : page.status === "Draft"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >

                          {page.status}

                        </span>

                      </td>

                      <td className="px-4 py-5">

                        <button className="rounded-lg bg-blue-100 px-4 py-2 text-blue-600 hover:bg-blue-200">

                          Edit

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* Banner & Landing Pages */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Image className="text-pink-600" />

                <h2 className="text-2xl font-bold">

                  Banner Management

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Homepage Hero Banner", "Active"],
                  ["Festival Banner", "Scheduled"],
                  ["Restaurant Promotion", "Published"],
                  ["Referral Banner", "Draft"],
                ].map(([title, status]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-pink-600">

                      {status}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Layout className="text-indigo-600" />

                <h2 className="text-2xl font-bold">

                  Landing Pages

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Home Page", "Published"],
                  ["Restaurant Partner", "Published"],
                  ["Delivery Partner", "Published"],
                  ["Corporate Catering", "Draft"],
                ].map(([title, status]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-indigo-600">

                      {status}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Blogs & FAQs */}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <Newspaper className="text-green-600" />

                <h2 className="text-2xl font-bold">

                  Blog Management

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Healthy Eating Tips", "12K Views"],
                  ["Top Restaurants", "8.6K Views"],
                  ["Food Safety Guide", "4.2K Views"],
                  ["Delivery Stories", "6.8K Views"],
                ].map(([title, views]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-green-600">

                      {views}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <BookOpen className="text-orange-600" />

                <h2 className="text-2xl font-bold">

                  FAQ Management

                </h2>

              </div>

              <div className="space-y-4">

                {[
                  ["Customer FAQs", "48 Questions"],
                  ["Restaurant FAQs", "26 Questions"],
                  ["Delivery FAQs", "31 Questions"],
                  ["Payments FAQs", "22 Questions"],
                ].map(([title, count]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-orange-600">

                      {count}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Legal Pages */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <ShieldCheck className="text-purple-600" />

              <h2 className="text-2xl font-bold">

                Legal & Policy Pages

              </h2>

            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

              {[
                "Privacy Policy",
                "Terms & Conditions",
                "Refund Policy",
                "Cookie Policy",
                "Cancellation Policy",
                "Community Guidelines",
                "Restaurant Agreement",
                "Delivery Partner Agreement",
              ].map((item) => (

                <div
                  key={item}
                  className="rounded-2xl border p-5 text-center font-semibold hover:bg-purple-50"
                >

                  {item}

                </div>

              ))}

            </div>

          </div>

          {/* Content Performance Analytics */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* Content Analytics */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <TrendingUp className="text-blue-600" />

                <h2 className="text-2xl font-bold">

                  Content Performance Analytics

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Monthly Visitors", "2.48 Million"],
                  ["Page Views", "8.64 Million"],
                  ["Average Session", "6m 42s"],
                  ["Bounce Rate", "21%"],
                ].map(([title, value]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-blue-600">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* Top Performing Content */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <FileText className="text-green-600" />

                <h2 className="text-2xl font-bold">

                  Top Performing Content

                </h2>

              </div>

              <div className="space-y-5">

                {[
                  ["Homepage Banner", "1.4M Views"],
                  ["Restaurant Partner Page", "842K Views"],
                  ["Festival Offers", "690K Views"],
                  ["Healthy Food Blog", "482K Views"],
                ].map(([title, value]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border p-5"
                  >

                    <span>{title}</span>

                    <span className="font-semibold text-green-600">

                      {value}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* AI Content Insights */}

          <div className="mt-10 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-700 p-8 text-white">

            <div className="flex items-center gap-3">

              <FileText size={32} />

              <h2 className="text-3xl font-bold">

                AI Content Insights

              </h2>

            </div>

            <p className="mt-4 text-blue-100">

              AI analyzes visitor behavior, engagement patterns,
              search trends, click-through rates, and content
              performance to recommend homepage improvements,
              optimize banners, increase conversions, and boost
              SEO rankings automatically.

            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

              {[
                {
                  title: "SEO Score",
                  value: "97%",
                },
                {
                  title: "Engagement",
                  value: "91%",
                },
                {
                  title: "Content Quality",
                  value: "95%",
                },
                {
                  title: "AI Confidence",
                  value: "99.4%",
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

          {/* Quick CMS Actions */}

          <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">

              Quick CMS Actions

            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              {[
                "Create Page",
                "Upload Banner",
                "Publish Blog",
                "Add FAQ",
                "Edit Policies",
                "SEO Report",
                "Export Content",
                "Content Analytics",
              ].map((action) => (

                <button
                  key={action}
                  className="rounded-2xl border p-5 font-semibold transition hover:border-blue-500 hover:bg-blue-50"
                >

                  {action}

                </button>

              ))}

            </div>

          </div>

          {/* Footer */}

          <footer className="mt-12 rounded-3xl bg-white p-8 text-center shadow-sm">

            <Layout
              size={42}
              className="mx-auto text-blue-600"
            />

            <h2 className="mt-4 text-2xl font-bold">

              Enterprise Content Management System

            </h2>

            <p className="mt-3 text-gray-500">

              Manage pages, banners, blogs, FAQs, landing pages,
              legal documents, promotional content, AI-powered
              recommendations, SEO optimization, and content
              analytics from one centralized CMS platform.

            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <button className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">

                Export CMS Report

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                SEO Dashboard

              </button>

              <button className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-100">

                Content Analytics

              </button>

            </div>

            <p className="mt-8 text-sm text-gray-400">

              © 2026 RuchiGo Technologies • Enterprise Content Management Suite

            </p>

          </footer>

        </section>

      </main>

    </>

  );

}