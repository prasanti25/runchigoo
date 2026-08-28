import {
  Database,
  HardDrive,
  Cloud,
  ShieldCheck,
  RefreshCcw,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  BarChart3,
  Globe2,
  Clock3,
  Cpu,
  FolderArchive,
  Save,
  Workflow,
} from "lucide-react";

const backupCards = [
  {
    title: "Total Backups",
    value: "3,248",
    change: "+42 Today",
    icon: Database,
    color: "text-cyan-400",
    bg: "from-cyan-500/20 to-cyan-700/10",
  },
  {
    title: "Storage Used",
    value: "82.6 TB",
    change: "72% Capacity",
    icon: HardDrive,
    color: "text-green-400",
    bg: "from-green-500/20 to-green-700/10",
  },
  {
    title: "Backup Success",
    value: "99.98%",
    change: "Healthy",
    icon: ShieldCheck,
    color: "text-purple-400",
    bg: "from-purple-500/20 to-purple-700/10",
  },
  {
    title: "Recovery Points",
    value: "1,254",
    change: "+18",
    icon: RefreshCcw,
    color: "text-orange-400",
    bg: "from-orange-500/20 to-orange-700/10",
  },
];

const storageLocations = [
  {
    name: "AWS S3 Backup",
    capacity: "50 TB",
    used: "36 TB",
    status: "Healthy",
  },
  {
    name: "Azure Blob Storage",
    capacity: "30 TB",
    used: "18 TB",
    status: "Healthy",
  },
  {
    name: "Google Cloud Storage",
    capacity: "25 TB",
    used: "14 TB",
    status: "Healthy",
  },
  {
    name: "Local Backup Server",
    capacity: "15 TB",
    used: "12 TB",
    status: "Warning",
  },
];

const DisasterRecoveryBackupCenter = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">

      {/* Header */}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10">

        <div>

          <h1 className="text-4xl font-bold flex items-center gap-3">

            <Database className="text-cyan-400" size={40} />

            Disaster Recovery & Backup Center

          </h1>

          <p className="text-slate-400 mt-3 max-w-3xl">

            Manage enterprise backups, disaster recovery, replication,
            restoration, storage health, and business continuity from one
            centralized dashboard.

          </p>

        </div>

        <button className="mt-6 lg:mt-0 bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:scale-105 transition">

          <Plus size={20} />

          Create Backup

        </button>

      </div>

      {/* Backup KPI Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

        {backupCards.map((card, index) => {

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

      {/* Enterprise Backup Overview */}

      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 mb-10">

        <div className="flex justify-between items-center mb-6">

          <div>

            <h2 className="text-2xl font-bold flex items-center gap-3">

              <BarChart3 className="text-cyan-400" />

              Enterprise Backup Overview

            </h2>

            <p className="text-slate-400 mt-2">

              Real-time backup infrastructure and storage health.

            </p>

          </div>

          <ShieldCheck className="text-green-400" size={30} />

        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">

          <div className="bg-slate-800 rounded-2xl p-5">

            <Database className="text-cyan-400 mb-4" />

            <h3 className="font-semibold">

              Active Backups

            </h3>

            <h2 className="text-4xl font-bold mt-3">

              3,248

            </h2>

          </div>

          <div className="bg-slate-800 rounded-2xl p-5">

            <Cloud className="text-green-400 mb-4" />

            <h3 className="font-semibold">

              Cloud Storage

            </h3>

            <h2 className="text-4xl font-bold mt-3">

              94 TB

            </h2>

          </div>

          <div className="bg-slate-800 rounded-2xl p-5">

            <Server className="text-orange-400 mb-4" />

            <h3 className="font-semibold">

              Recovery Sites

            </h3>

            <h2 className="text-4xl font-bold mt-3">

              3

            </h2>

          </div>

          <div className="bg-slate-800 rounded-2xl p-5">

            <Activity className="text-purple-400 mb-4" />

            <h3 className="font-semibold">

              System Health

            </h3>

            <h2 className="text-4xl font-bold mt-3">

              99.98%

            </h2>

          </div>

        </div>

      </div>
            {/* Backup Storage & Backup Types */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

        {/* Backup Storage Locations */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <Cloud className="text-cyan-400" />

                Backup Storage Locations

              </h2>

              <p className="text-slate-400 mt-2">

                Monitor enterprise backup storage across cloud and local infrastructure.

              </p>

            </div>

            <HardDrive className="text-cyan-400" size={30} />

          </div>

          <div className="space-y-5">

            {storageLocations.map((storage, index) => (

              <div
                key={index}
                className="bg-slate-800 rounded-2xl p-5 hover:bg-slate-700 transition"
              >

                <div className="flex justify-between items-center mb-4">

                  <div>

                    <h3 className="text-lg font-semibold">

                      {storage.name}

                    </h3>

                    <p className="text-slate-400">

                      Capacity: {storage.capacity}

                    </p>

                  </div>

                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      storage.status === "Healthy"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >

                    {storage.status}

                  </span>

                </div>

                <div className="flex justify-between mb-2">

                  <span className="text-slate-400">

                    Used Storage

                  </span>

                  <span className="text-cyan-400 font-semibold">

                    {storage.used}

                  </span>

                </div>

                <div className="w-full h-2 rounded-full bg-slate-700">

                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-green-500"
                    style={{
                      width: `${(parseFloat(storage.used) / parseFloat(storage.capacity)) * 100}%`,
                    }}
                  />

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* Backup Types */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <FolderArchive className="text-green-400" />

                Backup Types

              </h2>

              <p className="text-slate-400 mt-2">

                Available enterprise backup strategies.

              </p>

            </div>

            <Save className="text-green-400" size={30} />

          </div>

          {[
            ["Full Backup", 98],
            ["Incremental Backup", 94],
            ["Differential Backup", 90],
            ["Database Backup", 99],
            ["Media Backup", 87],
            ["Configuration Backup", 96],
          ].map((backup, index) => (

            <div key={index} className="mb-6">

              <div className="flex justify-between mb-2">

                <span>{backup[0]}</span>

                <span className="font-semibold text-green-400">

                  {backup[1]}%

                </span>

              </div>

              <div className="w-full h-3 rounded-full bg-slate-800">

                <div
                  className="h-3 rounded-full bg-gradient-to-r from-green-500 to-cyan-500"
                  style={{ width: `${backup[1]}%` }}
                />

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* Backup Infrastructure Statistics */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <Server className="text-cyan-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">

            Backup Servers

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            24

          </h2>

          <p className="text-cyan-400 mt-3">

            Online

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <Cloud className="text-green-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">

            Cloud Storage

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            94 TB

          </h2>

          <p className="text-green-400 mt-3">

            Available

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <Cpu className="text-purple-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">

            Replication Nodes

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            16

          </h2>

          <p className="text-purple-400 mt-3">

            Synchronized

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <Workflow className="text-orange-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">

            Daily Jobs

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            648

          </h2>

          <p className="text-orange-400 mt-3">

            Successfully Completed

          </p>

        </div>

      </div>
            {/* Disaster Recovery Center & Replication */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

        {/* Disaster Recovery Center */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <ShieldCheck className="text-green-400" />

                Disaster Recovery Center

              </h2>

              <p className="text-slate-400 mt-2">

                Monitor primary and disaster recovery infrastructure across all regions.

              </p>

            </div>

            <ShieldCheck className="text-green-400" size={30} />

          </div>

          <div className="space-y-5">

            {[
              {
                site: "Primary Data Center",
                location: "Hyderabad",
                status: "Online",
                health: 100,
              },
              {
                site: "Secondary Data Center",
                location: "Bangalore",
                status: "Standby",
                health: 99,
              },
              {
                site: "Disaster Recovery Site",
                location: "Mumbai",
                status: "Ready",
                health: 98,
              },
              {
                site: "International DR Site",
                location: "Singapore",
                status: "Ready",
                health: 97,
              },
            ].map((site, index) => (

              <div
                key={index}
                className="bg-slate-800 rounded-2xl p-5"
              >

                <div className="flex justify-between items-center mb-4">

                  <div>

                    <h3 className="font-semibold">

                      {site.site}

                    </h3>

                    <p className="text-slate-400">

                      {site.location}

                    </p>

                  </div>

                  <span className="px-4 py-2 rounded-full bg-green-500/20 text-green-400 text-sm font-semibold">

                    {site.status}

                  </span>

                </div>

                <div className="flex justify-between mb-2">

                  <span className="text-slate-400">

                    Health

                  </span>

                  <span className="text-cyan-400 font-semibold">

                    {site.health}%

                  </span>

                </div>

                <div className="w-full h-2 bg-slate-700 rounded-full">

                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-green-500 to-cyan-500"
                    style={{ width: `${site.health}%` }}
                  />

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* Replication Center */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <RefreshCcw className="text-cyan-400" />

                Replication Center

              </h2>

              <p className="text-slate-400 mt-2">

                Monitor enterprise replication services.

              </p>

            </div>

            <RefreshCcw className="text-cyan-400" size={30} />

          </div>

          {[
            ["PostgreSQL Replication",99],
            ["Redis Replication",98],
            ["Media Storage Sync",97],
            ["Object Storage",100],
            ["CDN Synchronization",96],
            ["Configuration Sync",99],
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
                  className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-green-500"
                  style={{width:`${item[1]}%`}}
                />

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* Recovery Analytics */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <Clock3 className="text-cyan-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">

            RPO

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            5 Min

          </h2>

          <p className="text-cyan-400 mt-2">

            Recovery Point Objective

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <Activity className="text-green-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">

            RTO

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            12 Min

          </h2>

          <p className="text-green-400 mt-2">

            Recovery Time Objective

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <CheckCircle2 className="text-purple-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">

            Recovery Success

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            99.98%

          </h2>

          <p className="text-purple-400 mt-2">

            Successful Restores

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <Globe2 className="text-orange-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">

            DR Availability

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            100%

          </h2>

          <p className="text-orange-400 mt-2">

            Business Continuity

          </p>

        </div>

      </div>
            {/* Backup Schedule & Disaster Alerts */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

        {/* Backup Schedule */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <Clock3 className="text-cyan-400" />

                Backup Schedule

              </h2>

              <p className="text-slate-400 mt-2">

                Automated enterprise backup schedules.

              </p>

            </div>

            <Save className="text-cyan-400" size={30} />

          </div>

          <div className="space-y-5">

            {[
              {
                type:"Daily Backup",
                time:"02:00 AM",
                status:"Completed",
              },
              {
                type:"Weekly Full Backup",
                time:"Sunday 01:00 AM",
                status:"Scheduled",
              },
              {
                type:"Monthly Archive",
                time:"1st Day 12:00 AM",
                status:"Scheduled",
              },
              {
                type:"Manual Backup",
                time:"On Demand",
                status:"Available",
              },
            ].map((item,index)=>(

              <div
                key={index}
                className="bg-slate-800 rounded-2xl p-5 flex justify-between items-center"
              >

                <div>

                  <h3 className="font-semibold">

                    {item.type}

                  </h3>

                  <p className="text-slate-400">

                    {item.time}

                  </p>

                </div>

                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    item.status==="Completed"
                      ? "bg-green-500/20 text-green-400"
                      : item.status==="Scheduled"
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

        {/* Disaster Alerts */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <AlertTriangle className="text-orange-400" />

                Disaster Alerts

              </h2>

              <p className="text-slate-400 mt-2">

                Active backup and infrastructure alerts.

              </p>

            </div>

            <AlertTriangle className="text-orange-400" size={30} />

          </div>

          <div className="space-y-4">

            {[
              {
                alert:"Replication Delay",
                severity:"Medium",
                time:"5 mins ago",
              },
              {
                alert:"Local Storage 82% Full",
                severity:"Low",
                time:"18 mins ago",
              },
              {
                alert:"Backup Verification Completed",
                severity:"Info",
                time:"42 mins ago",
              },
              {
                alert:"Weekly Backup Started",
                severity:"Info",
                time:"1 hour ago",
              },
              {
                alert:"Secondary DR Site Healthy",
                severity:"Good",
                time:"Live",
              },
            ].map((item,index)=>(

              <div
                key={index}
                className="bg-slate-800 rounded-2xl p-5 flex justify-between items-center"
              >

                <div>

                  <h3 className="font-semibold">

                    {item.alert}

                  </h3>

                  <p className="text-slate-400">

                    {item.time}

                  </p>

                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    item.severity==="Medium"
                      ? "bg-orange-500/20 text-orange-400"
                      : item.severity==="Low"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : item.severity==="Good"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-cyan-500/20 text-cyan-400"
                  }`}
                >

                  {item.severity}

                </span>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* Backup History */}

      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 mb-10">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold flex items-center gap-3">

            <FolderArchive className="text-purple-400" />

            Recent Backup History

          </h2>

          <Database className="text-purple-400" size={30} />

        </div>

        <div className="space-y-4">

          {[
            ["Full Database Backup","Today 02:00 AM","Success","4.8 TB"],
            ["Media Storage Backup","Today 01:30 AM","Success","8.2 TB"],
            ["Configuration Backup","Yesterday","Success","2.4 GB"],
            ["Redis Snapshot","Yesterday","Success","12 GB"],
            ["PostgreSQL Backup","2 Days Ago","Success","1.6 TB"],
            ["Disaster Recovery Sync","2 Days Ago","Success","Completed"],
          ].map((item,index)=>(

            <div
              key={index}
              className="grid grid-cols-4 bg-slate-800 rounded-2xl p-5"
            >

              <span>{item[0]}</span>

              <span className="text-slate-400">

                {item[1]}

              </span>

              <span className="text-green-400">

                {item[2]}

              </span>

              <span className="text-cyan-400">

                {item[3]}

              </span>

            </div>

          ))}

        </div>

      </div>

      {/* Recovery Testing Dashboard */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <CheckCircle2 className="text-green-400 mb-4" size={34} />

          <h3 className="font-semibold">

            DR Tests

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            184

          </h2>

          <p className="text-green-400 mt-2">

            Passed

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <RefreshCcw className="text-cyan-400 mb-4" size={34} />

          <h3 className="font-semibold">

            Restore Tests

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            96

          </h2>

          <p className="text-cyan-400 mt-2">

            Successful

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <ShieldCheck className="text-purple-400 mb-4" size={34} />

          <h3 className="font-semibold">

            Integrity Checks

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            99.99%

          </h2>

          <p className="text-purple-400 mt-2">

            Verified

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <Activity className="text-orange-400 mb-4" size={34} />

          <h3 className="font-semibold">

            Recovery Readiness

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            100%

          </h2>

          <p className="text-orange-400 mt-2">

            Enterprise Ready

          </p>

        </div>

      </div>
            {/* AI Backup Recommendations & Executive Recovery Insights */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

        {/* AI Backup Recommendations */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <Activity className="text-cyan-400" />

                AI Backup Recommendations

              </h2>

              <p className="text-slate-400 mt-2">

                Intelligent recommendations generated from backup analytics.

              </p>

            </div>

            <ShieldCheck className="text-green-400" size={30} />

          </div>

          <div className="space-y-5">

            {[
              {
                title: "Increase Local Storage Capacity",
                desc: "Local backup server utilization has exceeded 80%.",
                priority: "High",
              },
              {
                title: "Enable Cross-Region Replication",
                desc: "Improve disaster resilience by syncing overseas.",
                priority: "Medium",
              },
              {
                title: "Schedule Weekly Integrity Scan",
                desc: "Automatically validate backup consistency.",
                priority: "Medium",
              },
              {
                title: "Archive Older Backups",
                desc: "Move backups older than 180 days to cold storage.",
                priority: "Low",
              },
              {
                title: "Optimize Backup Window",
                desc: "Reduce production impact using AI scheduling.",
                priority: "High",
              },
            ].map((item,index)=>(

              <div
                key={index}
                className="bg-slate-800 rounded-2xl p-5"
              >

                <div className="flex justify-between items-center mb-2">

                  <h3 className="font-semibold">

                    {item.title}

                  </h3>

                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      item.priority==="High"
                        ? "bg-red-500/20 text-red-400"
                        : item.priority==="Medium"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >

                    {item.priority}

                  </span>

                </div>

                <p className="text-slate-400">

                  {item.desc}

                </p>

              </div>

            ))}

          </div>

        </div>

        {/* Executive Recovery Insights */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <BarChart3 className="text-purple-400" />

                Executive Recovery Insights

              </h2>

              <p className="text-slate-400 mt-2">

                Business continuity metrics powered by AI analytics.

              </p>

            </div>

            <Activity className="text-purple-400" size={30} />

          </div>

          <div className="space-y-5">

            {[
              {
                title:"Recovery Readiness",
                value:"100%",
                color:"text-green-400",
              },
              {
                title:"Infrastructure Availability",
                value:"99.99%",
                color:"text-cyan-400",
              },
              {
                title:"Replication Health",
                value:"98.8%",
                color:"text-purple-400",
              },
              {
                title:"Predicted Downtime",
                value:"< 3 Min",
                color:"text-orange-400",
              },
              {
                title:"Storage Growth",
                value:"+18%",
                color:"text-pink-400",
              },
            ].map((item,index)=>(

              <div
                key={index}
                className="bg-slate-800 rounded-2xl p-5 flex justify-between items-center"
              >

                <span className="font-medium">

                  {item.title}

                </span>

                <span className={`font-bold text-lg ${item.color}`}>

                  {item.value}

                </span>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* Business Continuity Dashboard */}

      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 mb-10">

        <div className="flex justify-between items-center mb-8">

          <div>

            <h2 className="text-2xl font-bold flex items-center gap-3">

              <Globe2 className="text-cyan-400" />

              Business Continuity Dashboard

            </h2>

            <p className="text-slate-400 mt-2">

              Enterprise continuity indicators across infrastructure, backups, and recovery services.

            </p>

          </div>

          <ShieldCheck className="text-green-400" size={30} />

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          <div className="bg-slate-800 rounded-2xl p-6">

            <Database className="text-cyan-400 mb-4" size={34} />

            <h3 className="font-semibold">

              Backup Coverage

            </h3>

            <h2 className="text-3xl font-bold mt-3">

              100%

            </h2>

            <p className="text-cyan-400 mt-2">

              Protected Assets

            </p>

          </div>

          <div className="bg-slate-800 rounded-2xl p-6">

            <Server className="text-green-400 mb-4" size={34} />

            <h3 className="font-semibold">

              Active Data Centers

            </h3>

            <h2 className="text-3xl font-bold mt-3">

              4

            </h2>

            <p className="text-green-400 mt-2">

              Operational

            </p>

          </div>

          <div className="bg-slate-800 rounded-2xl p-6">

            <RefreshCcw className="text-purple-400 mb-4" size={34} />

            <h3 className="font-semibold">

              Replication Health

            </h3>

            <h2 className="text-3xl font-bold mt-3">

              98.8%

            </h2>

            <p className="text-purple-400 mt-2">

              Synchronized

            </p>

          </div>

          <div className="bg-slate-800 rounded-2xl p-6">

            <ShieldCheck className="text-orange-400 mb-4" size={34} />

            <h3 className="font-semibold">

              Continuity Score

            </h3>

            <h2 className="text-3xl font-bold mt-3">

              99.95%

            </h2>

            <p className="text-orange-400 mt-2">

              Enterprise Grade

            </p>

          </div>

        </div>

      </div>
            {/* Executive Action Center */}

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">

        <button className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl py-5 font-semibold flex items-center justify-center gap-3 hover:scale-105 transition">

          <Database size={20} />

          Start Backup

        </button>

        <button className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl py-5 font-semibold flex items-center justify-center gap-3 hover:scale-105 transition">

          <RefreshCcw size={20} />

          Restore Data

        </button>

        <button className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl py-5 font-semibold flex items-center justify-center gap-3 hover:scale-105 transition">

          <ShieldCheck size={20} />

          DR Test

        </button>

        <button className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl py-5 font-semibold flex items-center justify-center gap-3 hover:scale-105 transition">

          <CheckCircle2 size={20} />

          Verify Backup

        </button>

        <button className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl py-5 font-semibold flex items-center justify-center gap-3 hover:scale-105 transition">

          <FolderArchive size={20} />

          Export Report

        </button>

        <button className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl py-5 font-semibold flex items-center justify-center gap-3 hover:scale-105 transition">

          <AlertTriangle size={20} />

          Emergency Failover

        </button>

      </div>

      {/* Disaster Recovery Summary */}

      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 mb-10">

        <div className="flex items-center gap-3 mb-6">

          <ShieldCheck className="text-green-400" size={34} />

          <h2 className="text-3xl font-bold">

            Disaster Recovery Summary

          </h2>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          <div className="bg-slate-800 rounded-2xl p-5">

            <h3 className="text-slate-400">

              Backup Success

            </h3>

            <h2 className="text-4xl font-bold mt-3 text-green-400">

              99.98%

            </h2>

          </div>

          <div className="bg-slate-800 rounded-2xl p-5">

            <h3 className="text-slate-400">

              Recovery Time

            </h3>

            <h2 className="text-4xl font-bold mt-3 text-cyan-400">

              12 Min

            </h2>

          </div>

          <div className="bg-slate-800 rounded-2xl p-5">

            <h3 className="text-slate-400">

              Protected Assets

            </h3>

            <h2 className="text-4xl font-bold mt-3 text-purple-400">

              100%

            </h2>

          </div>

          <div className="bg-slate-800 rounded-2xl p-5">

            <h3 className="text-slate-400">

              Recovery Readiness

            </h3>

            <h2 className="text-4xl font-bold mt-3 text-orange-400">

              Enterprise

            </h2>

          </div>

        </div>

      </div>

      {/* Enterprise Footer */}

      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 p-8">

        <div className="text-center">

          <Database className="mx-auto text-cyan-400 mb-4" size={52} />

          <h2 className="text-3xl font-bold mb-3">

            Disaster Recovery & Backup Center

          </h2>

          <p className="text-slate-400 max-w-3xl mx-auto">

            The Disaster Recovery & Backup Center provides enterprise-grade
            backup management, disaster recovery orchestration, replication,
            integrity verification, restoration, and business continuity
            monitoring to ensure critical systems remain resilient, secure,
            and highly available across the entire RuchiGo platform.

          </p>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">

          <div className="text-center">

            <h2 className="text-3xl font-bold text-cyan-400">

              3,248

            </h2>

            <p className="text-slate-400 mt-2">

              Total Backups

            </p>

          </div>

          <div className="text-center">

            <h2 className="text-3xl font-bold text-green-400">

              99.98%

            </h2>

            <p className="text-slate-400 mt-2">

              Success Rate

            </p>

          </div>

          <div className="text-center">

            <h2 className="text-3xl font-bold text-purple-400">

              4

            </h2>

            <p className="text-slate-400 mt-2">

              Data Centers

            </p>

          </div>

          <div className="text-center">

            <h2 className="text-3xl font-bold text-yellow-400">

              100%

            </h2>

            <p className="text-slate-400 mt-2">

              Recovery Readiness

            </p>

          </div>

        </div>

      </div>

    </div>

  );

};

export default DisasterRecoveryBackupCenter;