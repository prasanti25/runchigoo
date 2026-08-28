import {
  Workflow,
  Bot,
  Play,
  Pause,
  Square,
  Plus,
  Clock,
  Mail,
  Bell,
  CreditCard,
  Bike,
  Store,
  Users,
  Brain,
  Zap,
  Activity,
  Settings,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

const workflowCards = [
  {
    title: "Active Workflows",
    value: "148",
    growth: "+12%",
    icon: Workflow,
    color: "from-cyan-500 to-blue-600",
  },
  {
    title: "AI Automations",
    value: "72",
    growth: "+18%",
    icon: Bot,
    color: "from-violet-500 to-purple-600",
  },
  {
    title: "Tasks Executed",
    value: "2.4M",
    growth: "+26%",
    icon: Zap,
    color: "from-yellow-500 to-orange-500",
  },
  {
    title: "Success Rate",
    value: "99.3%",
    growth: "+1.8%",
    icon: CheckCircle2,
    color: "from-green-500 to-emerald-600",
  },
];

const automationModules = [
  {
    name: "Email Automation",
    icon: Mail,
    status: "Running",
    progress: 96,
    color: "text-cyan-400",
  },
  {
    name: "Notification Engine",
    icon: Bell,
    status: "Running",
    progress: 91,
    color: "text-orange-400",
  },
  {
    name: "Payment Automation",
    icon: CreditCard,
    status: "Running",
    progress: 98,
    color: "text-green-400",
  },
  {
    name: "Delivery Automation",
    icon: Bike,
    status: "Running",
    progress: 94,
    color: "text-blue-400",
  },
];

const AutomationWorkflowCenter = () => {

  return (

    <div className="min-h-screen bg-[#07111F] text-white p-6">

      {/* Header */}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">

        <div>

          <h1 className="text-4xl font-bold flex items-center gap-3">

            <Workflow className="text-cyan-400" size={40} />

            Automation Workflow Center

          </h1>

          <p className="text-slate-400 mt-2">

            Enterprise automation, AI workflows and process orchestration.

          </p>

        </div>

        <div className="flex flex-wrap gap-3">

          <button className="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-500 flex items-center gap-2">

            <Play size={18} />

            Run All

          </button>

          <button className="px-5 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 flex items-center gap-2">

            <Pause size={18} />

            Pause

          </button>

          <button className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 flex items-center gap-2">

            <Square size={18} />

            Stop

          </button>

          <button className="px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 flex items-center gap-2">

            <Plus size={18} />

            New Workflow

          </button>

        </div>

      </div>

      {/* KPI Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

        {workflowCards.map((item,index)=>{

          const Icon=item.icon;

          return(

            <div
              key={index}
              className="rounded-3xl bg-slate-900 border border-slate-700 p-6 hover:border-cyan-500 transition"
            >

              <div className="flex justify-between">

                <div>

                  <p className="text-slate-400">

                    {item.title}

                  </p>

                  <h2 className="text-4xl font-bold mt-3">

                    {item.value}

                  </h2>

                </div>

                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>

                  <Icon size={30}/>

                </div>

              </div>

              <div className="flex items-center gap-2 mt-6 text-green-400">

                <ArrowUpRight size={18}/>

                <span>{item.growth}</span>

                <span className="text-slate-500">

                  vs last week

                </span>

              </div>

            </div>

          )

        })}

      </div>

      {/* Workflow Modules */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <Bot className="text-cyan-400"/>

                Automation Modules

              </h2>

              <p className="text-slate-400 mt-2">

                Live automation status

              </p>

            </div>

            <Activity className="text-green-400"/>

          </div>

          {automationModules.map((item,index)=>{

            const Icon=item.icon;

            return(

              <div key={index} className="mb-6">

                <div className="flex justify-between mb-2">

                  <div className="flex items-center gap-3">

                    <Icon className={item.color}/>

                    <span>{item.name}</span>

                  </div>

                  <span className="text-green-400">

                    {item.status}

                  </span>

                </div>

                <div className="w-full h-3 bg-slate-800 rounded-full">

                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{width:`${item.progress}%`}}
                  />

                </div>

              </div>

            )

          })}

        </div>
                <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <Brain className="text-purple-400" />

                AI Decision Engine

              </h2>

              <p className="text-slate-400 mt-2">

                Real-time AI workflow recommendations

              </p>

            </div>

            <Brain className="text-purple-400" size={28} />

          </div>

          <div className="space-y-5">

            <div className="bg-slate-800 rounded-2xl p-5">

              <div className="flex justify-between">

                <span>Smart Task Routing</span>

                <span className="text-green-400 font-semibold">
                  Enabled
                </span>

              </div>

            </div>

            <div className="bg-slate-800 rounded-2xl p-5">

              <div className="flex justify-between">

                <span>Fraud Detection</span>

                <span className="text-green-400 font-semibold">
                  Active
                </span>

              </div>

            </div>

            <div className="bg-slate-800 rounded-2xl p-5">

              <div className="flex justify-between">

                <span>Customer Prediction</span>

                <span className="text-cyan-400 font-semibold">
                  Running
                </span>

              </div>

            </div>

            <div className="bg-slate-800 rounded-2xl p-5">

              <div className="flex justify-between">

                <span>Demand Forecasting</span>

                <span className="text-orange-400 font-semibold">
                  Processing
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Scheduled Workflows */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 hover:border-cyan-500 transition">

          <Clock className="text-cyan-400 mb-5" size={34} />

          <h3 className="text-lg font-semibold">

            Scheduled Tasks

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            386

          </h2>

          <p className="text-slate-400 mt-3">

            Tasks waiting to execute

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 hover:border-green-500 transition">

          <Calendar className="text-green-400 mb-5" size={34} />

          <h3 className="text-lg font-semibold">

            Today's Executions

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            18,924

          </h2>

          <p className="text-slate-400 mt-3">

            Successfully completed

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 hover:border-orange-500 transition">

          <AlertTriangle className="text-orange-400 mb-5" size={34} />

          <h3 className="text-lg font-semibold">

            Failed Jobs

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            17

          </h2>

          <p className="text-slate-400 mt-3">

            Need administrator review

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 hover:border-purple-500 transition">

          <Settings className="text-purple-400 mb-5" size={34} />

          <h3 className="text-lg font-semibold">

            Workflow Templates

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            64

          </h2>

          <p className="text-slate-400 mt-3">

            Ready to deploy

          </p>

        </div>

      </div>

      {/* Automation Categories */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <div className="rounded-3xl bg-slate-900 border border-slate-700 p-6">

          <Users className="text-cyan-400 mb-4" size={34} />

          <h3 className="text-xl font-semibold">

            Customer Automation

          </h3>

          <ul className="mt-5 space-y-3 text-slate-300">

            <li>• Welcome Emails</li>
            <li>• Loyalty Rewards</li>
            <li>• Birthday Offers</li>
            <li>• Order Follow-up</li>
            <li>• AI Recommendations</li>

          </ul>

        </div>

        <div className="rounded-3xl bg-slate-900 border border-slate-700 p-6">

          <Store className="text-orange-400 mb-4" size={34} />

          <h3 className="text-xl font-semibold">

            Restaurant Automation

          </h3>

          <ul className="mt-5 space-y-3 text-slate-300">

            <li>• Auto Menu Sync</li>
            <li>• Inventory Alerts</li>
            <li>• Order Assignment</li>
            <li>• Sales Reports</li>
            <li>• AI Pricing</li>

          </ul>

        </div>

        <div className="rounded-3xl bg-slate-900 border border-slate-700 p-6">

          <Bike className="text-blue-400 mb-4" size={34} />

          <h3 className="text-xl font-semibold">

            Delivery Automation

          </h3>

          <ul className="mt-5 space-y-3 text-slate-300">

            <li>• Auto Rider Assignment</li>
            <li>• Route Optimization</li>
            <li>• Delay Detection</li>
            <li>• Live Tracking</li>
            <li>• ETA Prediction</li>

          </ul>

        </div>

      </div>
            {/* Workflow Builder & Execution Dashboard */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

        {/* Workflow Builder */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <Workflow className="text-cyan-400" />

                Workflow Builder

              </h2>

              <p className="text-slate-400 mt-2">

                Create and manage enterprise automation flows

              </p>

            </div>

            <Plus className="text-cyan-400" size={28} />

          </div>

          <div className="space-y-5">

            <div className="bg-slate-800 rounded-2xl p-5 flex justify-between items-center">

              <div>

                <h3 className="font-semibold">

                  Customer Welcome Flow

                </h3>

                <p className="text-slate-400 text-sm">

                  Email → Coupon → Notification

                </p>

              </div>

              <Play className="text-green-400" />

            </div>

            <div className="bg-slate-800 rounded-2xl p-5 flex justify-between items-center">

              <div>

                <h3 className="font-semibold">

                  Restaurant Approval

                </h3>

                <p className="text-slate-400 text-sm">

                  Verification → Approval → Activation

                </p>

              </div>

              <CheckCircle2 className="text-cyan-400" />

            </div>

            <div className="bg-slate-800 rounded-2xl p-5 flex justify-between items-center">

              <div>

                <h3 className="font-semibold">

                  Refund Processing

                </h3>

                <p className="text-slate-400 text-sm">

                  AI Review → Finance → Customer

                </p>

              </div>

              <CreditCard className="text-yellow-400" />

            </div>

            <div className="bg-slate-800 rounded-2xl p-5 flex justify-between items-center">

              <div>

                <h3 className="font-semibold">

                  Delivery Assignment

                </h3>

                <p className="text-slate-400 text-sm">

                  Order → Rider → Route

                </p>

              </div>

              <Bike className="text-blue-400" />

            </div>

          </div>

        </div>

        {/* Live Execution */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <Activity className="text-green-400" />

                Live Execution

              </h2>

              <p className="text-slate-400 mt-2">

                Real-time workflow execution status

              </p>

            </div>

            <Zap className="text-yellow-400" />

          </div>

          {[
            ["Orders Processing",95],
            ["Email Queue",88],
            ["Notifications",97],
            ["Payments",99],
            ["Delivery Jobs",93],
          ].map((item,index)=>(

            <div key={index} className="mb-6">

              <div className="flex justify-between mb-2">

                <span>{item[0]}</span>

                <span className="text-green-400 font-semibold">

                  {item[1]}%

                </span>

              </div>

              <div className="w-full h-3 rounded-full bg-slate-800">

                <div
                  className="h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                  style={{width:`${item[1]}%`}}
                />

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* Automation Performance */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <Activity className="text-cyan-400 mb-4" size={34}/>

          <h3 className="text-lg font-semibold">

            Executions Today

          </h3>

          <h1 className="text-4xl font-bold mt-3">

            86,240

          </h1>

          <p className="text-green-400 mt-3">

            +18% Today

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <Clock className="text-orange-400 mb-4" size={34}/>

          <h3 className="text-lg font-semibold">

            Avg Execution

          </h3>

          <h1 className="text-4xl font-bold mt-3">

            1.8s

          </h1>

          <p className="text-cyan-400 mt-3">

            Faster than last week

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <Bot className="text-purple-400 mb-4" size={34}/>

          <h3 className="text-lg font-semibold">

            AI Decisions

          </h3>

          <h1 className="text-4xl font-bold mt-3">

            1.2M

          </h1>

          <p className="text-purple-400 mt-3">

            This Month

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <CheckCircle2 className="text-green-400 mb-4" size={34}/>

          <h3 className="text-lg font-semibold">

            Success Rate

          </h3>

          <h1 className="text-4xl font-bold mt-3">

            99.84%

          </h1>

          <p className="text-green-400 mt-3">

            Enterprise Grade

          </p>

        </div>

      </div>
            {/* AI Workflow Analytics */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

        {/* AI Analytics */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <Brain className="text-purple-400" />

                AI Workflow Analytics

              </h2>

              <p className="text-slate-400 mt-2">

                Artificial Intelligence workflow performance

              </p>

            </div>

            <Bot className="text-purple-400" />

          </div>

          {[
            ["Smart Routing Accuracy",98],
            ["Fraud Detection",97],
            ["Demand Prediction",95],
            ["Recommendation Engine",99],
            ["Customer Segmentation",94],
          ].map((item,index)=>(

            <div key={index} className="mb-6">

              <div className="flex justify-between mb-2">

                <span>{item[0]}</span>

                <span className="font-semibold text-green-400">

                  {item[1]}%

                </span>

              </div>

              <div className="w-full h-3 rounded-full bg-slate-800">

                <div
                  className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{width:`${item[1]}%`}}
                />

              </div>

            </div>

          ))}

        </div>

        {/* Process Monitoring */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <Activity className="text-cyan-400"/>

                Process Monitoring

              </h2>

              <p className="text-slate-400 mt-2">

                Live enterprise process tracking

              </p>

            </div>

            <Workflow className="text-cyan-400"/>

          </div>

          <div className="space-y-5">

            <div className="flex justify-between bg-slate-800 rounded-xl p-4">

              <span>Running Processes</span>

              <span className="text-green-400 font-bold">

                428

              </span>

            </div>

            <div className="flex justify-between bg-slate-800 rounded-xl p-4">

              <span>Queued Processes</span>

              <span className="text-yellow-400 font-bold">

                81

              </span>

            </div>

            <div className="flex justify-between bg-slate-800 rounded-xl p-4">

              <span>Completed Today</span>

              <span className="text-cyan-400 font-bold">

                86,240

              </span>

            </div>

            <div className="flex justify-between bg-slate-800 rounded-xl p-4">

              <span>Failed Jobs</span>

              <span className="text-red-400 font-bold">

                17

              </span>

            </div>

            <div className="flex justify-between bg-slate-800 rounded-xl p-4">

              <span>Pending Review</span>

              <span className="text-orange-400 font-bold">

                5

              </span>

            </div>

          </div>

        </div>

      </div>

      {/* Workflow Logs */}

      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 mb-10">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold flex items-center gap-3">

            <Activity className="text-green-400"/>

            Recent Workflow Logs

          </h2>

          <Clock className="text-cyan-400"/>

        </div>

        <div className="space-y-4">

          {[
            ["Customer Welcome Email","Completed","2 sec ago"],
            ["Restaurant Verification","Completed","15 sec ago"],
            ["Payment Settlement","Running","30 sec ago"],
            ["Delivery Assignment","Completed","1 min ago"],
            ["Inventory Sync","Completed","3 mins ago"],
            ["Refund Approval","Pending","5 mins ago"],
          ].map((log,index)=>(

            <div
              key={index}
              className="flex justify-between items-center bg-slate-800 rounded-2xl p-4"
            >

              <div>

                <h3 className="font-semibold">

                  {log[0]}

                </h3>

                <p className="text-slate-400 text-sm">

                  {log[2]}

                </p>

              </div>

              <span className={`font-semibold ${
                log[1]==="Completed"
                ? "text-green-400"
                : log[1]==="Running"
                ? "text-cyan-400"
                : "text-yellow-400"
              }`}>

                {log[1]}

              </span>

            </div>

          ))}

        </div>

      </div>
            {/* Automation Trends & AI Optimization */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">

        {/* Automation Trends */}

        <div className="xl:col-span-2 bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <TrendingUp className="text-cyan-400" />

                Automation Trends

              </h2>

              <p className="text-slate-400 mt-2">

                Enterprise workflow growth over time

              </p>

            </div>

            <Activity className="text-green-400" />

          </div>

          <div className="space-y-5">

            {[
              ["January","68%"],
              ["February","74%"],
              ["March","81%"],
              ["April","88%"],
              ["May","93%"],
              ["June","97%"],
            ].map((item,index)=>(

              <div key={index}>

                <div className="flex justify-between mb-2">

                  <span>{item[0]}</span>

                  <span className="font-semibold text-cyan-400">

                    {item[1]}

                  </span>

                </div>

                <div className="w-full h-3 rounded-full bg-slate-800">

                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{width:item[1]}}
                  />

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* Performance Score */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex items-center gap-3 mb-6">

            <Zap className="text-yellow-400"/>

            <h2 className="text-2xl font-bold">

              Performance Score

            </h2>

          </div>

          <div className="text-center mb-8">

            <h1 className="text-7xl font-bold text-green-400">

              98%

            </h1>

            <p className="text-slate-400 mt-3">

              Enterprise Automation Health

            </p>

          </div>

          <div className="space-y-5">

            <div>

              <div className="flex justify-between mb-2">

                <span>Speed</span>

                <span>96%</span>

              </div>

              <div className="w-full h-2 rounded-full bg-slate-800">

                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{width:"96%"}}
                />

              </div>

            </div>

            <div>

              <div className="flex justify-between mb-2">

                <span>Accuracy</span>

                <span>99%</span>

              </div>

              <div className="w-full h-2 rounded-full bg-slate-800">

                <div
                  className="h-2 rounded-full bg-cyan-500"
                  style={{width:"99%"}}
                />

              </div>

            </div>

            <div>

              <div className="flex justify-between mb-2">

                <span>Reliability</span>

                <span>98%</span>

              </div>

              <div className="w-full h-2 rounded-full bg-slate-800">

                <div
                  className="h-2 rounded-full bg-purple-500"
                  style={{width:"98%"}}
                />

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* AI Optimization Center */}

      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 border border-purple-500 rounded-3xl p-8 mb-10">

        <div className="flex items-center gap-3 mb-6">

          <Brain className="text-purple-400" size={38}/>

          <div>

            <h2 className="text-3xl font-bold">

              AI Optimization Center

            </h2>

            <p className="text-slate-300">

              Intelligent recommendations for workflow optimization

            </p>

          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-5">

          <div className="bg-slate-800/50 rounded-2xl p-5">

            ⚡ Reduce payment workflow execution time by
            <span className="font-bold text-green-400"> 12%</span>.

          </div>

          <div className="bg-slate-800/50 rounded-2xl p-5">

            🤖 Increase AI routing confidence to
            <span className="font-bold text-cyan-400"> 99.5%</span>.

          </div>

          <div className="bg-slate-800/50 rounded-2xl p-5">

            📧 Optimize email batching to reduce server load.

          </div>

          <div className="bg-slate-800/50 rounded-2xl p-5">

            🚀 Deploy predictive delivery automation in
            high-demand cities.

          </div>

          <div className="bg-slate-800/50 rounded-2xl p-5">

            💳 Automate refund approvals for trusted customers.

          </div>

          <div className="bg-slate-800/50 rounded-2xl p-5">

            📈 AI predicts workflow efficiency will improve by
            <span className="font-bold text-yellow-400"> 18%</span>
            next month.

          </div>

        </div>

      </div>
            {/* Executive Action Center */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

        <button className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl py-5 font-semibold flex items-center justify-center gap-3 hover:scale-105 transition">

          <Play size={20} />

          Run All Workflows

        </button>

        <button className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl py-5 font-semibold flex items-center justify-center gap-3 hover:scale-105 transition">

          <CheckCircle2 size={20} />

          Deploy Changes

        </button>

        <button className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl py-5 font-semibold flex items-center justify-center gap-3 hover:scale-105 transition">

          <Brain size={20} />

          AI Optimization

        </button>

        <button className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl py-5 font-semibold flex items-center justify-center gap-3 hover:scale-105 transition">

          <Activity size={20} />

          Live Monitoring

        </button>

      </div>

      {/* Workflow Summary */}

      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 mb-10">

        <div className="flex items-center gap-3 mb-6">

          <Workflow className="text-cyan-400" size={34} />

          <h2 className="text-3xl font-bold">

            Enterprise Workflow Summary

          </h2>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          <div className="bg-slate-800 rounded-2xl p-5">

            <h3 className="text-slate-400">

              Total Workflows

            </h3>

            <h2 className="text-4xl font-bold mt-3 text-cyan-400">

              148

            </h2>

          </div>

          <div className="bg-slate-800 rounded-2xl p-5">

            <h3 className="text-slate-400">

              Running Jobs

            </h3>

            <h2 className="text-4xl font-bold mt-3 text-green-400">

              428

            </h2>

          </div>

          <div className="bg-slate-800 rounded-2xl p-5">

            <h3 className="text-slate-400">

              AI Decisions

            </h3>

            <h2 className="text-4xl font-bold mt-3 text-purple-400">

              1.2M

            </h2>

          </div>

          <div className="bg-slate-800 rounded-2xl p-5">

            <h3 className="text-slate-400">

              Success Rate

            </h3>

            <h2 className="text-4xl font-bold mt-3 text-emerald-400">

              99.84%

            </h2>

          </div>

        </div>

      </div>

      {/* Enterprise Footer */}

      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 p-8">

        <div className="text-center">

          <Bot className="mx-auto text-cyan-400 mb-4" size={50} />

          <h2 className="text-3xl font-bold mb-3">

            Enterprise Automation Platform

          </h2>

          <p className="text-slate-400 max-w-3xl mx-auto">

            The Automation Workflow Center provides centralized management
            for enterprise workflows, AI-driven automation, scheduled jobs,
            intelligent process optimization, live execution monitoring,
            analytics, and operational control across the entire RuchiGo
            ecosystem.

          </p>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">

          <div className="text-center">

            <h2 className="text-3xl font-bold text-cyan-400">

              99.84%

            </h2>

            <p className="text-slate-400 mt-2">

              Workflow Success

            </p>

          </div>

          <div className="text-center">

            <h2 className="text-3xl font-bold text-green-400">

              24×7

            </h2>

            <p className="text-slate-400 mt-2">

              AI Monitoring

            </p>

          </div>

          <div className="text-center">

            <h2 className="text-3xl font-bold text-purple-400">

              148

            </h2>

            <p className="text-slate-400 mt-2">

              Active Workflows

            </p>

          </div>

          <div className="text-center">

            <h2 className="text-3xl font-bold text-yellow-400">

              Enterprise

            </h2>

            <p className="text-slate-400 mt-2">

              Automation Ready

            </p>

          </div>

        </div>

      </div>

    </div>

  );

};

export default AutomationWorkflowCenter;