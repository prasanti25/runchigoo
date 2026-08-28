import {
  Globe2,
  MapPinned,
  Landmark,
  DollarSign,
  Languages,
  Clock3,
  CreditCard,
  TrendingUp,
  Users,
  Store,
  Truck,
  Building2,
  Brain,
  Sparkles,
  Activity,
  BarChart3,
  ArrowUpRight,
  Plus,
} from "lucide-react";

const countryCards = [
  {
    title: "Active Countries",
    value: "18",
    change: "+4 This Year",
    icon: Globe2,
    color: "text-cyan-400",
    bg: "from-cyan-500/20 to-cyan-600/10",
  },
  {
    title: "Global Revenue",
    value: "$12.8M",
    change: "+18.6%",
    icon: DollarSign,
    color: "text-green-400",
    bg: "from-green-500/20 to-green-600/10",
  },
  {
    title: "International Orders",
    value: "842K",
    change: "+12.4%",
    icon: Truck,
    color: "text-orange-400",
    bg: "from-orange-500/20 to-orange-600/10",
  },
  {
    title: "Global Customers",
    value: "2.6M",
    change: "+22.1%",
    icon: Users,
    color: "text-purple-400",
    bg: "from-purple-500/20 to-purple-600/10",
  },
];

const countries = [
  {
    name: "India",
    restaurants: 4250,
    revenue: "$5.4M",
    growth: "+18%",
    status: "Operational",
  },
  {
    name: "United States",
    restaurants: 2130,
    revenue: "$3.8M",
    growth: "+14%",
    status: "Operational",
  },
  {
    name: "United Kingdom",
    restaurants: 1240,
    revenue: "$1.6M",
    growth: "+11%",
    status: "Operational",
  },
  {
    name: "Singapore",
    restaurants: 720,
    revenue: "$980K",
    growth: "+21%",
    status: "Expanding",
  },
];

const MultiCountryOperationsCenter = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">

      {/* Header */}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10">

        <div>

          <h1 className="text-4xl font-bold flex items-center gap-3">

            <Globe2 className="text-cyan-400" size={40} />

            Multi-Country Operations Center

          </h1>

          <p className="text-slate-400 mt-3 max-w-3xl">

            Manage global operations, countries, currencies, languages,
            regional analytics, international payments, delivery networks,
            and worldwide restaurant expansion from a centralized enterprise dashboard.

          </p>

        </div>

        <button className="mt-6 lg:mt-0 bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:scale-105 transition">

          <Plus size={20} />

          Add Country

        </button>

      </div>

      {/* KPI Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

        {countryCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              key={index}
              className={`rounded-3xl border border-slate-700 bg-gradient-to-br ${card.bg} p-6 hover:border-cyan-500 transition`}
            >
              <div className="flex justify-between items-center">

                <div>

                  <p className="text-slate-400">

                    {card.title}

                  </p>

                  <h2 className="text-4xl font-bold mt-3">

                    {card.value}

                  </h2>

                  <p className={`${card.color} mt-3 flex items-center gap-2`}>

                    <ArrowUpRight size={18} />

                    {card.change}

                  </p>

                </div>

                <Icon size={40} className={card.color} />

              </div>

            </div>
          );
        })}

      </div>

      {/* Global Overview */}

      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 mb-10">

        <div className="flex justify-between items-center mb-6">

          <div>

            <h2 className="text-2xl font-bold flex items-center gap-3">

              <BarChart3 className="text-cyan-400" />

              Global Operations Overview

            </h2>

            <p className="text-slate-400 mt-2">

              Performance across international markets

            </p>

          </div>

          <Sparkles className="text-yellow-400" size={30} />

        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">

          <div className="bg-slate-800 rounded-2xl p-5">

            <Landmark className="text-green-400 mb-4" />

            <h3 className="font-semibold">

              Countries Live

            </h3>

            <h2 className="text-4xl font-bold mt-3">

              18

            </h2>

          </div>

          <div className="bg-slate-800 rounded-2xl p-5">

            <Store className="text-orange-400 mb-4" />

            <h3 className="font-semibold">

              Restaurants

            </h3>

            <h2 className="text-4xl font-bold mt-3">

              8,340

            </h2>

          </div>

          <div className="bg-slate-800 rounded-2xl p-5">

            <Truck className="text-cyan-400 mb-4" />

            <h3 className="font-semibold">

              Delivery Partners

            </h3>

            <h2 className="text-4xl font-bold mt-3">

              26,850

            </h2>

          </div>

          <div className="bg-slate-800 rounded-2xl p-5">

            <Building2 className="text-purple-400 mb-4" />

            <h3 className="font-semibold">

              Regional Offices

            </h3>

            <h2 className="text-4xl font-bold mt-3">

              24

            </h2>

          </div>

        </div>

      </div>
            {/* Country Management & Currency Management */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

        {/* Country Management */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <MapPinned className="text-cyan-400" />

                Country Management

              </h2>

              <p className="text-slate-400 mt-2">

                Monitor all active countries and regional performance

              </p>

            </div>

            <Globe2 className="text-cyan-400" size={28} />

          </div>

          <div className="space-y-5">

            {countries.map((country,index)=>(

              <div
                key={index}
                className="bg-slate-800 rounded-2xl p-5 hover:bg-slate-700 transition"
              >

                <div className="flex justify-between items-center mb-4">

                  <div>

                    <h3 className="text-xl font-semibold">

                      {country.name}

                    </h3>

                    <p className="text-slate-400">

                      {country.restaurants.toLocaleString()} Restaurants

                    </p>

                  </div>

                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      country.status === "Operational"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >

                    {country.status}

                  </span>

                </div>

                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <p className="text-slate-400 text-sm">

                      Revenue

                    </p>

                    <p className="text-lg font-bold text-green-400">

                      {country.revenue}

                    </p>

                  </div>

                  <div>

                    <p className="text-slate-400 text-sm">

                      Growth

                    </p>

                    <p className="text-lg font-bold text-cyan-400">

                      {country.growth}

                    </p>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* Currency Management */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <DollarSign className="text-green-400" />

                Currency Management

              </h2>

              <p className="text-slate-400 mt-2">

                Supported currencies and live exchange rates

              </p>

            </div>

            <DollarSign className="text-green-400" size={28} />

          </div>

          <div className="space-y-4">

            {[
              {
                currency:"Indian Rupee",
                code:"INR",
                rate:"₹1.00",
                status:"Base Currency",
              },
              {
                currency:"US Dollar",
                code:"USD",
                rate:"₹83.12",
                status:"Live",
              },
              {
                currency:"Euro",
                code:"EUR",
                rate:"₹96.44",
                status:"Live",
              },
              {
                currency:"British Pound",
                code:"GBP",
                rate:"₹111.72",
                status:"Live",
              },
              {
                currency:"Singapore Dollar",
                code:"SGD",
                rate:"₹64.58",
                status:"Live",
              },
            ].map((item,index)=>(

              <div
                key={index}
                className="bg-slate-800 rounded-2xl p-5 flex justify-between items-center"
              >

                <div>

                  <h3 className="font-semibold">

                    {item.currency}

                  </h3>

                  <p className="text-slate-400">

                    {item.code}

                  </p>

                </div>

                <div className="text-right">

                  <h3 className="font-bold text-green-400">

                    {item.rate}

                  </h3>

                  <p
                    className={`text-sm ${
                      item.status === "Base Currency"
                        ? "text-yellow-400"
                        : "text-cyan-400"
                    }`}
                  >

                    {item.status}

                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* Country Growth Analytics */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <TrendingUp className="text-green-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">

            Fastest Growing

          </h3>

          <h2 className="text-3xl font-bold mt-3">

            Singapore

          </h2>

          <p className="text-green-400 mt-2">

            +21% Growth

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <Store className="text-orange-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">

            Largest Market

          </h3>

          <h2 className="text-3xl font-bold mt-3">

            India

          </h2>

          <p className="text-orange-400 mt-2">

            4,250 Restaurants

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <Users className="text-cyan-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">

            Global Users

          </h3>

          <h2 className="text-3xl font-bold mt-3">

            2.6M

          </h2>

          <p className="text-cyan-400 mt-2">

            Active Customers

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <Activity className="text-purple-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">

            Expansion Score

          </h3>

          <h2 className="text-3xl font-bold mt-3">

            94%

          </h2>

          <p className="text-purple-400 mt-2">

            AI Confidence

          </p>

        </div>

      </div>
            {/* Language Management & Time Zone Management */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

        {/* Language Management */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <Languages className="text-cyan-400" />

                Language Management

              </h2>

              <p className="text-slate-400 mt-2">

                Supported languages across all countries

              </p>

            </div>

            <Languages className="text-cyan-400" size={28} />

          </div>

          <div className="space-y-4">

            {[
              {
                language:"English",
                users:"1.42M",
                status:"Default",
              },
              {
                language:"Hindi",
                users:"760K",
                status:"Active",
              },
              {
                language:"Telugu",
                users:"420K",
                status:"Active",
              },
              {
                language:"Tamil",
                users:"285K",
                status:"Active",
              },
              {
                language:"Spanish",
                users:"165K",
                status:"Beta",
              },
              {
                language:"French",
                users:"118K",
                status:"Beta",
              },
            ].map((item,index)=>(

              <div
                key={index}
                className="bg-slate-800 rounded-2xl p-5 flex justify-between items-center"
              >

                <div>

                  <h3 className="font-semibold">

                    {item.language}

                  </h3>

                  <p className="text-slate-400">

                    {item.users} Users

                  </p>

                </div>

                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    item.status==="Default"
                      ? "bg-green-500/20 text-green-400"
                      : item.status==="Active"
                      ? "bg-cyan-500/20 text-cyan-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >

                  {item.status}

                </span>

              </div>

            ))}

          </div>

        </div>

        {/* Time Zone Management */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <Clock3 className="text-orange-400" />

                Time Zone Management

              </h2>

              <p className="text-slate-400 mt-2">

                Business hours and regional time synchronization

              </p>

            </div>

            <Clock3 className="text-orange-400" size={28} />

          </div>

          <div className="space-y-4">

            {[
              {
                zone:"Asia/Kolkata",
                time:"GMT +5:30",
                status:"Primary",
              },
              {
                zone:"America/New_York",
                time:"GMT -4:00",
                status:"Active",
              },
              {
                zone:"Europe/London",
                time:"GMT +1:00",
                status:"Active",
              },
              {
                zone:"Asia/Singapore",
                time:"GMT +8:00",
                status:"Active",
              },
              {
                zone:"Australia/Sydney",
                time:"GMT +10:00",
                status:"Monitoring",
              },
            ].map((item,index)=>(

              <div
                key={index}
                className="bg-slate-800 rounded-2xl p-5 flex justify-between items-center"
              >

                <div>

                  <h3 className="font-semibold">

                    {item.zone}

                  </h3>

                  <p className="text-slate-400">

                    {item.time}

                  </p>

                </div>

                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    item.status==="Primary"
                      ? "bg-green-500/20 text-green-400"
                      : item.status==="Active"
                      ? "bg-cyan-500/20 text-cyan-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >

                  {item.status}

                </span>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* International Payment Gateways */}

      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 mb-10">

        <div className="flex justify-between items-center mb-6">

          <div>

            <h2 className="text-2xl font-bold flex items-center gap-3">

              <CreditCard className="text-green-400" />

              International Payment Gateways

            </h2>

            <p className="text-slate-400 mt-2">

              Supported payment providers across global regions

            </p>

          </div>

          <CreditCard className="text-green-400" size={30} />

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

          {[
            "Stripe",
            "PayPal",
            "Razorpay",
            "Apple Pay",
            "Google Pay",
            "Adyen",
            "Square",
            "Amazon Pay",
          ].map((gateway,index)=>(

            <div
              key={index}
              className="bg-slate-800 rounded-2xl p-5 hover:bg-slate-700 transition"
            >

              <CreditCard
                className="text-green-400 mb-4"
                size={32}
              />

              <h3 className="font-semibold text-lg">

                {gateway}

              </h3>

              <p className="text-slate-400 mt-2">

                Operational

              </p>

            </div>

          ))}

        </div>

      </div>
            {/* Regional Performance & Global Delivery Network */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

        {/* Regional Performance */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <TrendingUp className="text-cyan-400" />

                Regional Performance

              </h2>

              <p className="text-slate-400 mt-2">

                Country-wise operational performance

              </p>

            </div>

            <BarChart3 className="text-cyan-400" size={30} />

          </div>

          {[
            ["India",95],
            ["United States",91],
            ["United Kingdom",88],
            ["Singapore",93],
            ["Australia",84],
          ].map((item,index)=>(

            <div key={index} className="mb-6">

              <div className="flex justify-between mb-2">

                <span>{item[0]}</span>

                <span className="font-semibold text-cyan-400">

                  {item[1]}%

                </span>

              </div>

              <div className="w-full h-3 rounded-full bg-slate-800">

                <div
                  className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  style={{width:`${item[1]}%`}}
                />

              </div>

            </div>

          ))}

        </div>

        {/* Global Delivery Network */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <Truck className="text-green-400" />

                Global Delivery Network

              </h2>

              <p className="text-slate-400 mt-2">

                Worldwide logistics and delivery operations

              </p>

            </div>

            <Truck className="text-green-400" size={30} />

          </div>

          <div className="space-y-5">

            <div className="bg-slate-800 rounded-2xl p-5 flex justify-between">

              <span>Active Delivery Partners</span>

              <span className="text-green-400 font-bold">

                26,850

              </span>

            </div>

            <div className="bg-slate-800 rounded-2xl p-5 flex justify-between">

              <span>Countries Covered</span>

              <span className="text-cyan-400 font-bold">

                18

              </span>

            </div>

            <div className="bg-slate-800 rounded-2xl p-5 flex justify-between">

              <span>Daily Deliveries</span>

              <span className="text-orange-400 font-bold">

                412K

              </span>

            </div>

            <div className="bg-slate-800 rounded-2xl p-5 flex justify-between">

              <span>Average Delivery Time</span>

              <span className="text-purple-400 font-bold">

                27 mins

              </span>

            </div>

            <div className="bg-slate-800 rounded-2xl p-5 flex justify-between">

              <span>Fleet Availability</span>

              <span className="text-green-400 font-bold">

                98.7%

              </span>

            </div>

          </div>

        </div>

      </div>

      {/* Regional Restaurant Analytics */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <Store className="text-orange-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">

            Total Restaurants

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            8,340

          </h2>

          <p className="text-orange-400 mt-3">

            Across 18 Countries

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <Users className="text-cyan-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">

            Global Customers

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            2.6M

          </h2>

          <p className="text-cyan-400 mt-3">

            Active Users

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <DollarSign className="text-green-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">

            Monthly Revenue

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            $12.8M

          </h2>

          <p className="text-green-400 mt-3">

            +18.6%

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <Activity className="text-purple-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">

            Expansion Index

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            94%

          </h2>

          <p className="text-purple-400 mt-3">

            AI Confidence

          </p>

        </div>

      </div>

      {/* Country Revenue Breakdown */}

      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 mb-10">

        <div className="flex justify-between items-center mb-6">

          <div>

            <h2 className="text-2xl font-bold flex items-center gap-3">

              <DollarSign className="text-green-400" />

              Country Revenue Breakdown

            </h2>

            <p className="text-slate-400 mt-2">

              Top-performing markets by monthly revenue

            </p>

          </div>

          <TrendingUp className="text-green-400" size={30} />

        </div>

        <div className="space-y-5">

          {[
            ["India","$5.4M","+18%"],
            ["United States","$3.8M","+14%"],
            ["United Kingdom","$1.6M","+11%"],
            ["Singapore","$980K","+21%"],
            ["Australia","$620K","+10%"],
          ].map((country,index)=>(

            <div
              key={index}
              className="bg-slate-800 rounded-2xl p-5 flex justify-between items-center"
            >

              <div>

                <h3 className="font-semibold">

                  {country[0]}

                </h3>

                <p className="text-slate-400">

                  Monthly Revenue

                </p>

              </div>

              <div className="text-right">

                <h3 className="font-bold text-green-400">

                  {country[1]}

                </h3>

                <p className="text-cyan-400">

                  {country[2]}

                </p>

              </div>

            </div>

          ))}

        </div>

      </div>
            {/* AI Global Intelligence Center */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">

        {/* AI Global Insights */}

        <div className="xl:col-span-2 bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <Brain className="text-purple-400" />

                AI Global Intelligence

              </h2>

              <p className="text-slate-400 mt-2">

                AI-powered international market analysis and expansion recommendations

              </p>

            </div>

            <Sparkles className="text-yellow-400" size={30} />

          </div>

          {[
            ["Market Expansion Readiness",96],
            ["Customer Growth Prediction",94],
            ["Regional Demand Forecast",97],
            ["Currency Stability",91],
            ["Restaurant Success Rate",95],
            ["Delivery Network Efficiency",98],
          ].map((item,index)=>(

            <div key={index} className="mb-6">

              <div className="flex justify-between mb-2">

                <span>{item[0]}</span>

                <span className="font-semibold text-cyan-400">

                  {item[1]}%

                </span>

              </div>

              <div className="w-full h-3 rounded-full bg-slate-800">

                <div
                  className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                  style={{width:`${item[1]}%`}}
                />

              </div>

            </div>

          ))}

        </div>

        {/* Business Health */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex items-center gap-3 mb-6">

            <Activity className="text-green-400"/>

            <h2 className="text-2xl font-bold">

              Global Health

            </h2>

          </div>

          <div className="text-center mb-8">

            <h1 className="text-7xl font-bold text-green-400">

              97%

            </h1>

            <p className="text-slate-400 mt-3">

              Worldwide Operations Health

            </p>

          </div>

          <div className="space-y-5">

            <div>

              <div className="flex justify-between mb-2">

                <span>Operations</span>

                <span>98%</span>

              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full">

                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{width:"98%"}}
                />

              </div>

            </div>

            <div>

              <div className="flex justify-between mb-2">

                <span>Growth</span>

                <span>94%</span>

              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full">

                <div
                  className="h-2 rounded-full bg-cyan-500"
                  style={{width:"94%"}}
                />

              </div>

            </div>

            <div>

              <div className="flex justify-between mb-2">

                <span>Customer Satisfaction</span>

                <span>96%</span>

              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full">

                <div
                  className="h-2 rounded-full bg-purple-500"
                  style={{width:"96%"}}
                />

              </div>

            </div>

            <div>

              <div className="flex justify-between mb-2">

                <span>Delivery Success</span>

                <span>99%</span>

              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full">

                <div
                  className="h-2 rounded-full bg-orange-500"
                  style={{width:"99%"}}
                />

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* AI Expansion Recommendations */}

      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 border border-purple-500 rounded-3xl p-8 mb-10">

        <div className="flex items-center gap-3 mb-6">

          <Brain className="text-purple-400" size={38} />

          <div>

            <h2 className="text-3xl font-bold">

              AI Expansion Recommendations

            </h2>

            <p className="text-slate-300">

              Strategic recommendations generated by Enterprise AI

            </p>

          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-5">

          <div className="bg-slate-800/50 rounded-2xl p-5">

            🌏 Expand into <span className="font-bold text-cyan-400">Malaysia</span> with an estimated success rate of <span className="font-bold text-green-400">93%</span>.

          </div>

          <div className="bg-slate-800/50 rounded-2xl p-5">

            🇦🇪 Launch operations in <span className="font-bold text-orange-400">UAE</span> to increase Middle East presence.

          </div>

          <div className="bg-slate-800/50 rounded-2xl p-5">

            💳 Enable additional regional payment gateways to improve transaction success.

          </div>

          <div className="bg-slate-800/50 rounded-2xl p-5">

            🚚 Increase delivery fleet capacity by <span className="font-bold text-green-400">15%</span> in high-demand cities.

          </div>

          <div className="bg-slate-800/50 rounded-2xl p-5">

            🏪 Add 500+ new restaurant partners in fast-growing regions.

          </div>

          <div className="bg-slate-800/50 rounded-2xl p-5">

            📈 AI forecasts <span className="font-bold text-yellow-400">22% global revenue growth</span> over the next 12 months.

          </div>

        </div>

      </div>
            {/* Executive Action Center */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

        <button className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl py-5 font-semibold flex items-center justify-center gap-3 hover:scale-105 transition">

          <Plus size={20} />

          Add Country

        </button>

        <button className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl py-5 font-semibold flex items-center justify-center gap-3 hover:scale-105 transition">

          <TrendingUp size={20} />

          Expansion Report

        </button>

        <button className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl py-5 font-semibold flex items-center justify-center gap-3 hover:scale-105 transition">

          <Brain size={20} />

          AI Strategy

        </button>

        <button className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl py-5 font-semibold flex items-center justify-center gap-3 hover:scale-105 transition">

          <Activity size={20} />

          Live Monitoring

        </button>

      </div>

      {/* Global Operations Summary */}

      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 mb-10">

        <div className="flex items-center gap-3 mb-6">

          <Globe2 className="text-cyan-400" size={34} />

          <h2 className="text-3xl font-bold">

            Global Operations Summary

          </h2>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          <div className="bg-slate-800 rounded-2xl p-5">

            <h3 className="text-slate-400">

              Countries

            </h3>

            <h2 className="text-4xl font-bold mt-3 text-cyan-400">

              18

            </h2>

          </div>

          <div className="bg-slate-800 rounded-2xl p-5">

            <h3 className="text-slate-400">

              Restaurants

            </h3>

            <h2 className="text-4xl font-bold mt-3 text-orange-400">

              8,340

            </h2>

          </div>

          <div className="bg-slate-800 rounded-2xl p-5">

            <h3 className="text-slate-400">

              Global Revenue

            </h3>

            <h2 className="text-4xl font-bold mt-3 text-green-400">

              $12.8M

            </h2>

          </div>

          <div className="bg-slate-800 rounded-2xl p-5">

            <h3 className="text-slate-400">

              Growth Rate

            </h3>

            <h2 className="text-4xl font-bold mt-3 text-purple-400">

              +18.6%

            </h2>

          </div>

        </div>

      </div>

      {/* Enterprise Footer */}

      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 p-8">

        <div className="text-center">

          <Globe2 className="mx-auto text-cyan-400 mb-4" size={50} />

          <h2 className="text-3xl font-bold mb-3">

            Global Enterprise Operations Platform

          </h2>

          <p className="text-slate-400 max-w-3xl mx-auto">

            The Multi-Country Operations Center enables centralized management
            of international markets, currencies, languages, regional delivery
            networks, payment systems, restaurant operations, and AI-powered
            expansion strategies across the entire RuchiGo ecosystem.

          </p>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">

          <div className="text-center">

            <h2 className="text-3xl font-bold text-cyan-400">

              18

            </h2>

            <p className="text-slate-400 mt-2">

              Countries Live

            </p>

          </div>

          <div className="text-center">

            <h2 className="text-3xl font-bold text-green-400">

              $12.8M

            </h2>

            <p className="text-slate-400 mt-2">

              Monthly Revenue

            </p>

          </div>

          <div className="text-center">

            <h2 className="text-3xl font-bold text-purple-400">

              2.6M

            </h2>

            <p className="text-slate-400 mt-2">

              Active Customers

            </p>

          </div>

          <div className="text-center">

            <h2 className="text-3xl font-bold text-yellow-400">

              97%

            </h2>

            <p className="text-slate-400 mt-2">

              Global Health Score

            </p>

          </div>

        </div>

      </div>

    </div>

  );

};

export default MultiCountryOperationsCenter;