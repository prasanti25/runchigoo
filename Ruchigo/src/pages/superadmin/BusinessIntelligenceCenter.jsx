import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Store,
  Bike,
  Brain,
  Calendar,
  Download,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Award,
  Wallet,
} from "lucide-react";

const kpiCards = [
  {
    title: "Total Revenue",
    value: "₹12.48 Cr",
    growth: "+18.6%",
    icon: DollarSign,
    color: "from-emerald-500 to-green-600",
    positive: true,
  },
  {
    title: "Total Orders",
    value: "2,48,920",
    growth: "+12.4%",
    icon: ShoppingBag,
    color: "from-blue-500 to-cyan-600",
    positive: true,
  },
  {
    title: "Customers",
    value: "1,02,341",
    growth: "+9.8%",
    icon: Users,
    color: "from-purple-500 to-pink-600",
    positive: true,
  },
  {
    title: "Restaurants",
    value: "1,284",
    growth: "+5.2%",
    icon: Store,
    color: "from-orange-500 to-red-500",
    positive: true,
  },
  {
    title: "Delivery Partners",
    value: "4,916",
    growth: "+7.1%",
    icon: Bike,
    color: "from-cyan-500 to-blue-600",
    positive: true,
  },
  {
    title: "Profit Margin",
    value: "28.6%",
    growth: "+2.4%",
    icon: Wallet,
    color: "from-yellow-500 to-orange-500",
    positive: true,
  },
  {
    title: "Customer Satisfaction",
    value: "96.8%",
    growth: "+1.6%",
    icon: Award,
    color: "from-pink-500 to-rose-500",
    positive: true,
  },
  {
    title: "Business Growth",
    value: "34.5%",
    growth: "+6.7%",
    icon: TrendingUp,
    color: "from-indigo-500 to-violet-600",
    positive: true,
  },
];

const revenueStats = [
  {
    title: "Today's Revenue",
    value: "₹18.4L",
    progress: 82,
  },
  {
    title: "Weekly Revenue",
    value: "₹1.28Cr",
    progress: 71,
  },
  {
    title: "Monthly Revenue",
    value: "₹4.82Cr",
    progress: 90,
  },
  {
    title: "Yearly Revenue",
    value: "₹12.48Cr",
    progress: 96,
  },
];

const BusinessIntelligenceCenter = () => {
  return (
    <div className="min-h-screen bg-[#07111F] text-white p-6">

      {/* Header */}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">

        <div>

          <h1 className="text-4xl font-bold flex items-center gap-3">
            <BarChart3 className="text-cyan-400" size={38} />
            Business Intelligence Center
          </h1>

          <p className="text-slate-400 mt-2">
            Enterprise analytics, revenue insights, forecasting &
            executive business dashboard.
          </p>

        </div>

        <div className="flex flex-wrap gap-3">

          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-500 transition">
            <Calendar size={18} />
            Last 30 Days
          </button>

          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 transition">
            <Download size={18} />
            Export Report
          </button>

          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:scale-105 transition">
            <Sparkles size={18} />
            AI Insights
          </button>

        </div>

      </div>

      {/* KPI Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

        {kpiCards.map((item, index) => {

          const Icon = item.icon;

          return (

            <div
              key={index}
              className="rounded-3xl border border-slate-700 bg-slate-900/70 backdrop-blur-xl p-6 hover:border-cyan-500 transition duration-300"
            >

              <div className="flex justify-between items-center">

                <div>

                  <p className="text-slate-400 text-sm">
                    {item.title}
                  </p>

                  <h2 className="text-3xl font-bold mt-2">
                    {item.value}
                  </h2>

                </div>

                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center`}
                >
                  <Icon size={30} />
                </div>

              </div>

              <div className="mt-6 flex items-center gap-2">

                {item.positive ? (
                  <ArrowUpRight
                    size={18}
                    className="text-green-400"
                  />
                ) : (
                  <ArrowDownRight
                    size={18}
                    className="text-red-400"
                  />
                )}

                <span
                  className={`font-semibold ${
                    item.positive
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {item.growth}
                </span>

                <span className="text-slate-500 text-sm">
                  vs last month
                </span>

              </div>

            </div>

          );
        })}

      </div>

      {/* Revenue Analytics */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

        <div className="bg-slate-900/70 rounded-3xl border border-slate-700 p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">
                <TrendingUp className="text-green-400" />
                Revenue Analytics
              </h2>

              <p className="text-slate-400 mt-1">
                Overall financial performance
              </p>

            </div>

            <Activity className="text-cyan-400" />

          </div>

          {revenueStats.map((item, index) => (

            <div key={index} className="mb-6">

              <div className="flex justify-between mb-2">

                <span>{item.title}</span>

                <span className="font-semibold">
                  {item.value}
                </span>

              </div>

              <div className="w-full h-3 bg-slate-800 rounded-full">

                <div
                  className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  style={{
                    width: `${item.progress}%`,
                  }}
                />

              </div>

            </div>

          ))}

        </div>
                <div className="bg-slate-900/70 rounded-3xl border border-slate-700 p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Target className="text-orange-400" />
                Orders Analytics
              </h2>

              <p className="text-slate-400 mt-1">
                Order performance across the platform
              </p>

            </div>

            <ShoppingBag className="text-orange-400" />

          </div>

          <div className="space-y-6">

            <div>
              <div className="flex justify-between mb-2">
                <span>Completed Orders</span>
                <span className="font-semibold text-green-400">92%</span>
              </div>

              <div className="w-full h-3 bg-slate-800 rounded-full">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                  style={{ width: "92%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span>Cancelled Orders</span>
                <span className="font-semibold text-red-400">4%</span>
              </div>

              <div className="w-full h-3 bg-slate-800 rounded-full">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-red-500 to-rose-500"
                  style={{ width: "4%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span>Pending Orders</span>
                <span className="font-semibold text-yellow-400">4%</span>
              </div>

              <div className="w-full h-3 bg-slate-800 rounded-full">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
                  style={{ width: "4%" }}
                />
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Analytics Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

        <div className="rounded-3xl bg-slate-900 border border-slate-700 p-6 hover:border-cyan-500 transition">

          <div className="flex justify-between items-center mb-5">
            <Users className="text-cyan-400" size={34} />
            <TrendingUp className="text-green-400" />
          </div>

          <h3 className="text-lg font-semibold">
            Customer Analytics
          </h3>

          <h2 className="text-4xl font-bold mt-3">
            102K
          </h2>

          <p className="text-slate-400 mt-3">
            Active customers this month
          </p>

          <div className="mt-6 flex items-center gap-2 text-green-400">
            <ArrowUpRight size={18} />
            <span>+14.2%</span>
          </div>

        </div>

        <div className="rounded-3xl bg-slate-900 border border-slate-700 p-6 hover:border-orange-500 transition">

          <div className="flex justify-between items-center mb-5">
            <Store className="text-orange-400" size={34} />
            <TrendingUp className="text-green-400" />
          </div>

          <h3 className="text-lg font-semibold">
            Restaurant Analytics
          </h3>

          <h2 className="text-4xl font-bold mt-3">
            1,284
          </h2>

          <p className="text-slate-400 mt-3">
            Partner restaurants
          </p>

          <div className="mt-6 flex items-center gap-2 text-green-400">
            <ArrowUpRight size={18} />
            <span>+8.5%</span>
          </div>

        </div>

        <div className="rounded-3xl bg-slate-900 border border-slate-700 p-6 hover:border-blue-500 transition">

          <div className="flex justify-between items-center mb-5">
            <Bike className="text-blue-400" size={34} />
            <TrendingUp className="text-green-400" />
          </div>

          <h3 className="text-lg font-semibold">
            Delivery Analytics
          </h3>

          <h2 className="text-4xl font-bold mt-3">
            4,916
          </h2>

          <p className="text-slate-400 mt-3">
            Active delivery partners
          </p>

          <div className="mt-6 flex items-center gap-2 text-green-400">
            <ArrowUpRight size={18} />
            <span>+6.4%</span>
          </div>

        </div>

        <div className="rounded-3xl bg-slate-900 border border-slate-700 p-6 hover:border-purple-500 transition">

          <div className="flex justify-between items-center mb-5">
            <Brain className="text-purple-400" size={34} />
            <Sparkles className="text-pink-400" />
          </div>

          <h3 className="text-lg font-semibold">
            AI Performance
          </h3>

          <h2 className="text-4xl font-bold mt-3">
            98.7%
          </h2>

          <p className="text-slate-400 mt-3">
            AI recommendation accuracy
          </p>

          <div className="mt-6 flex items-center gap-2 text-green-400">
            <ArrowUpRight size={18} />
            <span>+3.8%</span>
          </div>

        </div>

      </div>
            {/* Financial & Marketing Analytics */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

        {/* Financial Dashboard */}

        <div className="bg-slate-900/70 rounded-3xl border border-slate-700 p-6">

          <div className="flex justify-between items-center mb-6">

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <DollarSign className="text-emerald-400" />
                Financial Dashboard
              </h2>

              <p className="text-slate-400 mt-1">
                Complete financial overview
              </p>
            </div>

            <Wallet className="text-emerald-400" size={28} />

          </div>

          <div className="space-y-5">

            <div className="flex justify-between items-center p-4 rounded-xl bg-slate-800">

              <div>
                <h4 className="font-semibold">Gross Revenue</h4>
                <p className="text-slate-400 text-sm">
                  Total platform revenue
                </p>
              </div>

              <span className="text-2xl font-bold text-green-400">
                ₹12.48 Cr
              </span>

            </div>

            <div className="flex justify-between items-center p-4 rounded-xl bg-slate-800">

              <div>
                <h4 className="font-semibold">Net Profit</h4>
                <p className="text-slate-400 text-sm">
                  After expenses
                </p>
              </div>

              <span className="text-2xl font-bold text-cyan-400">
                ₹3.84 Cr
              </span>

            </div>

            <div className="flex justify-between items-center p-4 rounded-xl bg-slate-800">

              <div>
                <h4 className="font-semibold">Operating Cost</h4>
                <p className="text-slate-400 text-sm">
                  Monthly expenses
                </p>
              </div>

              <span className="text-2xl font-bold text-red-400">
                ₹1.24 Cr
              </span>

            </div>

            <div className="flex justify-between items-center p-4 rounded-xl bg-slate-800">

              <div>
                <h4 className="font-semibold">Profit Margin</h4>
                <p className="text-slate-400 text-sm">
                  Current business margin
                </p>
              </div>

              <span className="text-2xl font-bold text-yellow-400">
                28.6%
              </span>

            </div>

          </div>

        </div>

        {/* Geographic Analytics */}

        <div className="bg-slate-900/70 rounded-3xl border border-slate-700 p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Target className="text-cyan-400" />
                Geographic Analytics
              </h2>

              <p className="text-slate-400 mt-1">
                Top performing cities
              </p>

            </div>

            <Activity className="text-cyan-400" />

          </div>

          {[
            ["Hyderabad", "₹2.84 Cr", "95%"],
            ["Bangalore", "₹2.15 Cr", "88%"],
            ["Chennai", "₹1.92 Cr", "81%"],
            ["Mumbai", "₹3.12 Cr", "98%"],
            ["Pune", "₹1.48 Cr", "73%"],
          ].map((city, index) => (

            <div key={index} className="mb-5">

              <div className="flex justify-between mb-2">

                <span>{city[0]}</span>

                <span className="font-semibold">
                  {city[1]}
                </span>

              </div>

              <div className="w-full h-3 rounded-full bg-slate-800">

                <div
                  className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  style={{ width: city[2] }}
                />

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* Marketing Analytics */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

        <div className="bg-slate-900 rounded-3xl border border-slate-700 p-6">

          <TrendingUp className="text-green-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">
            Campaign Reach
          </h3>

          <h1 className="text-4xl font-bold mt-3">
            8.6M
          </h1>

          <p className="text-slate-400 mt-2">
            Users reached
          </p>

        </div>

        <div className="bg-slate-900 rounded-3xl border border-slate-700 p-6">

          <Users className="text-cyan-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">
            New Customers
          </h3>

          <h1 className="text-4xl font-bold mt-3">
            24,620
          </h1>

          <p className="text-slate-400 mt-2">
            This month
          </p>

        </div>

        <div className="bg-slate-900 rounded-3xl border border-slate-700 p-6">

          <ShoppingBag className="text-orange-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">
            Conversion Rate
          </h3>

          <h1 className="text-4xl font-bold mt-3">
            42.8%
          </h1>

          <p className="text-slate-400 mt-2">
            Marketing conversion
          </p>

        </div>

        <div className="bg-slate-900 rounded-3xl border border-slate-700 p-6">

          <Brain className="text-purple-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">
            AI Predictions
          </h3>

          <h1 className="text-4xl font-bold mt-3">
            97.2%
          </h1>

          <p className="text-slate-400 mt-2">
            Forecast accuracy
          </p>

        </div>

      </div>
            {/* Revenue Breakdown & Customer Insights */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

        {/* Revenue Breakdown */}

        <div className="bg-slate-900/70 rounded-3xl border border-slate-700 p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">
                <BarChart3 className="text-green-400" />
                Revenue Breakdown
              </h2>

              <p className="text-slate-400 mt-1">
                Revenue contribution by business category
              </p>

            </div>

            <TrendingUp className="text-green-400" />

          </div>

          {[
            ["Food Orders", "52%", "₹6.48 Cr"],
            ["Delivery Charges", "18%", "₹2.24 Cr"],
            ["Restaurant Commission", "15%", "₹1.87 Cr"],
            ["Subscriptions", "9%", "₹1.12 Cr"],
            ["Advertisements", "6%", "₹0.77 Cr"],
          ].map((item, index) => (

            <div key={index} className="mb-5">

              <div className="flex justify-between mb-2">

                <span>{item[0]}</span>

                <span className="font-semibold">
                  {item[2]}
                </span>

              </div>

              <div className="w-full h-3 rounded-full bg-slate-800">

                <div
                  className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"
                  style={{ width: item[1] }}
                />

              </div>

            </div>

          ))}

        </div>

        {/* Customer Behaviour */}

        <div className="bg-slate-900/70 rounded-3xl border border-slate-700 p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Users className="text-cyan-400" />
                Customer Behaviour
              </h2>

              <p className="text-slate-400 mt-1">
                AI generated customer insights
              </p>

            </div>

            <Brain className="text-purple-400" />

          </div>

          <div className="space-y-5">

            <div className="p-4 rounded-xl bg-slate-800">
              <div className="flex justify-between">
                <span>Repeat Customers</span>
                <span className="text-green-400 font-bold">
                  74%
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800">
              <div className="flex justify-between">
                <span>Average Order Value</span>
                <span className="text-cyan-400 font-bold">
                  ₹482
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800">
              <div className="flex justify-between">
                <span>Peak Ordering Time</span>
                <span className="text-orange-400 font-bold">
                  7 PM - 9 PM
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800">
              <div className="flex justify-between">
                <span>Highest Retention</span>
                <span className="text-pink-400 font-bold">
                  Hyderabad
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Coupon Analytics */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <div className="rounded-3xl bg-slate-900 border border-slate-700 p-6">

          <Award className="text-yellow-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">
            Coupons Redeemed
          </h3>

          <h1 className="text-4xl font-bold mt-3">
            1,24,560
          </h1>

          <p className="text-slate-400 mt-2">
            This month
          </p>

        </div>

        <div className="rounded-3xl bg-slate-900 border border-slate-700 p-6">

          <TrendingUp className="text-green-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">
            Campaign ROI
          </h3>

          <h1 className="text-4xl font-bold mt-3">
            368%
          </h1>

          <p className="text-slate-400 mt-2">
            Return on investment
          </p>

        </div>

        <div className="rounded-3xl bg-slate-900 border border-slate-700 p-6">

          <Target className="text-red-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">
            Conversion Rate
          </h3>

          <h1 className="text-4xl font-bold mt-3">
            48.9%
          </h1>

          <p className="text-slate-400 mt-2">
            Promotional campaigns
          </p>

        </div>

      </div>

      {/* AI Business Insights */}

      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 border border-indigo-600 p-8 mb-10">

        <div className="flex items-center gap-3 mb-6">

          <Brain className="text-purple-400" size={36} />

          <div>

            <h2 className="text-3xl font-bold">
              AI Business Insights
            </h2>

            <p className="text-slate-300">
              Enterprise Intelligence Recommendations
            </p>

          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-5">

          <div className="bg-slate-800/50 rounded-2xl p-5">
            ✅ Increase marketing budget in Hyderabad by 12%.
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-5">
            🚀 Weekend demand expected to grow by 18%.
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-5">
            🍕 Fast Food category is generating highest profits.
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-5">
            🤖 AI predicts 15% monthly revenue growth.
          </div>

        </div>

      </div>
            {/* Executive Summary */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">

        <div className="xl:col-span-2 bg-slate-900/70 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">
                <BarChart3 className="text-cyan-400" />
                Executive Summary
              </h2>

              <p className="text-slate-400 mt-1">
                Overall enterprise performance snapshot
              </p>

            </div>

            <TrendingUp className="text-green-400" size={28} />

          </div>

          <div className="grid md:grid-cols-2 gap-5">

            <div className="rounded-2xl bg-slate-800 p-5">

              <p className="text-slate-400">
                Total Transactions
              </p>

              <h2 className="text-4xl font-bold mt-3">
                5.24M
              </h2>

              <p className="text-green-400 mt-2">
                ↑ 14.8% from last month
              </p>

            </div>

            <div className="rounded-2xl bg-slate-800 p-5">

              <p className="text-slate-400">
                Platform Growth
              </p>

              <h2 className="text-4xl font-bold mt-3">
                +34%
              </h2>

              <p className="text-cyan-400 mt-2">
                Excellent Growth Rate
              </p>

            </div>

            <div className="rounded-2xl bg-slate-800 p-5">

              <p className="text-slate-400">
                Restaurant Retention
              </p>

              <h2 className="text-4xl font-bold mt-3">
                96%
              </h2>

              <p className="text-green-400 mt-2">
                Stable Partnership
              </p>

            </div>

            <div className="rounded-2xl bg-slate-800 p-5">

              <p className="text-slate-400">
                Customer Loyalty
              </p>

              <h2 className="text-4xl font-bold mt-3">
                92%
              </h2>

              <p className="text-pink-400 mt-2">
                High Repeat Orders
              </p>

            </div>

          </div>

        </div>

        {/* Business Health */}

        <div className="bg-slate-900/70 border border-slate-700 rounded-3xl p-6">

          <div className="flex items-center gap-3 mb-6">

            <Activity className="text-green-400" />

            <h2 className="text-2xl font-bold">
              Business Health
            </h2>

          </div>

          <div className="space-y-6">

            <div>

              <div className="flex justify-between mb-2">

                <span>Revenue Health</span>

                <span className="text-green-400 font-bold">
                  96%
                </span>

              </div>

              <div className="w-full h-3 bg-slate-800 rounded-full">

                <div
                  className="h-3 rounded-full bg-green-500"
                  style={{ width: "96%" }}
                />

              </div>

            </div>

            <div>

              <div className="flex justify-between mb-2">

                <span>Operational Health</span>

                <span className="text-cyan-400 font-bold">
                  91%
                </span>

              </div>

              <div className="w-full h-3 bg-slate-800 rounded-full">

                <div
                  className="h-3 rounded-full bg-cyan-500"
                  style={{ width: "91%" }}
                />

              </div>

            </div>

            <div>

              <div className="flex justify-between mb-2">

                <span>Customer Satisfaction</span>

                <span className="text-pink-400 font-bold">
                  98%
                </span>

              </div>

              <div className="w-full h-3 bg-slate-800 rounded-full">

                <div
                  className="h-3 rounded-full bg-pink-500"
                  style={{ width: "98%" }}
                />

              </div>

            </div>

            <div>

              <div className="flex justify-between mb-2">

                <span>AI Efficiency</span>

                <span className="text-purple-400 font-bold">
                  97%
                </span>

              </div>

              <div className="w-full h-3 bg-slate-800 rounded-full">

                <div
                  className="h-3 rounded-full bg-purple-500"
                  style={{ width: "97%" }}
                />

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Risk Analysis */}

      <div className="bg-slate-900/70 border border-slate-700 rounded-3xl p-6 mb-10">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold flex items-center gap-3">

            <Target className="text-red-400" />

            Risk Analysis

          </h2>

          <TrendingDown className="text-red-400" />

        </div>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-slate-800 rounded-2xl p-5">

            <h3 className="text-lg font-semibold text-red-400">
              High Risk
            </h3>

            <p className="text-slate-300 mt-3">
              Delivery delays increased by
              <span className="font-bold text-red-400"> 6% </span>
              during weekends.
            </p>

          </div>

          <div className="bg-slate-800 rounded-2xl p-5">

            <h3 className="text-lg font-semibold text-yellow-400">
              Medium Risk
            </h3>

            <p className="text-slate-300 mt-3">
              Restaurant onboarding speed
              dropped by 3%.
            </p>

          </div>

          <div className="bg-slate-800 rounded-2xl p-5">

            <h3 className="text-lg font-semibold text-green-400">
              Low Risk
            </h3>

            <p className="text-slate-300 mt-3">
              Platform uptime remains at
              99.98% this month.
            </p>

          </div>

        </div>

      </div>
            {/* AI Strategic Recommendations */}

      <div className="bg-gradient-to-r from-cyan-900/30 via-slate-900 to-indigo-900/30 border border-cyan-500/30 rounded-3xl p-8 mb-10">

        <div className="flex items-center gap-3 mb-8">

          <Brain className="text-cyan-400" size={40} />

          <div>

            <h2 className="text-3xl font-bold">
              AI Strategic Recommendations
            </h2>

            <p className="text-slate-400">
              Machine learning powered business optimization suggestions
            </p>

          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700">
            <h3 className="text-xl font-semibold text-green-400 mb-3">
              Revenue Optimization
            </h3>

            <p className="text-slate-300">
              Increase weekend promotional campaigns to improve revenue
              by approximately <span className="font-bold text-green-400">12%</span>.
            </p>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700">
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">
              Delivery Optimization
            </h3>

            <p className="text-slate-300">
              Add more delivery partners in Hyderabad and Bangalore
              during peak hours.
            </p>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700">
            <h3 className="text-xl font-semibold text-yellow-400 mb-3">
              Customer Retention
            </h3>

            <p className="text-slate-300">
              Launch personalized loyalty rewards for premium users to
              improve retention by 8–10%.
            </p>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700">
            <h3 className="text-xl font-semibold text-pink-400 mb-3">
              Restaurant Expansion
            </h3>

            <p className="text-slate-300">
              Expand partner onboarding in Tier-2 cities where demand
              is growing rapidly.
            </p>
          </div>

        </div>

      </div>

      {/* Enterprise Action Center */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

        <button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:scale-105 transition rounded-2xl py-5 font-semibold flex items-center justify-center gap-3">
          <Download size={20} />
          Export PDF Report
        </button>

        <button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:scale-105 transition rounded-2xl py-5 font-semibold flex items-center justify-center gap-3">
          <BarChart3 size={20} />
          Analytics Report
        </button>

        <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 transition rounded-2xl py-5 font-semibold flex items-center justify-center gap-3">
          <Sparkles size={20} />
          Generate AI Report
        </button>

        <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:scale-105 transition rounded-2xl py-5 font-semibold flex items-center justify-center gap-3">
          <Activity size={20} />
          Live Dashboard
        </button>

      </div>

      {/* Footer */}

      <div className="rounded-3xl border border-slate-700 bg-slate-900/60 p-8 text-center">

        <h2 className="text-2xl font-bold mb-3">
          Enterprise Business Intelligence Dashboard
        </h2>

        <p className="text-slate-400 max-w-3xl mx-auto">
          This dashboard provides executives with real-time insights into
          revenue, customer engagement, operational performance,
          marketing effectiveness, AI-driven forecasting, and strategic
          decision-making to support enterprise growth.
        </p>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">

          <div>
            <h3 className="text-3xl font-bold text-cyan-400">99.98%</h3>
            <p className="text-slate-400 text-sm mt-2">
              Platform Uptime
            </p>
          </div>

          <div>
            <h3 className="text-3xl font-bold text-green-400">24/7</h3>
            <p className="text-slate-400 text-sm mt-2">
              AI Monitoring
            </p>
          </div>

          <div>
            <h3 className="text-3xl font-bold text-yellow-400">100+</h3>
            <p className="text-slate-400 text-sm mt-2">
              KPI Metrics
            </p>
          </div>

          <div>
            <h3 className="text-3xl font-bold text-pink-400">AI Ready</h3>
            <p className="text-slate-400 text-sm mt-2">
              Predictive Analytics
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default BusinessIntelligenceCenter;