import {
  ShieldCheck,
  FileCheck,
  Scale,
  Lock,
  Users,
  UserCog,
  BarChart3,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Activity,
  Globe2,
  CheckCircle2,
  ClipboardCheck,
  Building2,
  Database,
  Brain,
  Gavel,
} from "lucide-react";

const complianceCards = [
  {
    title: "Compliance Score",
    value: "98.9%",
    change: "+1.4%",
    icon: ShieldCheck,
    color: "text-cyan-400",
    bg: "from-cyan-500/20 to-cyan-700/10",
  },
  {
    title: "Active Policies",
    value: "124",
    change: "+8",
    icon: FileCheck,
    color: "text-green-400",
    bg: "from-green-500/20 to-green-700/10",
  },
  {
    title: "Audit Readiness",
    value: "100%",
    change: "Ready",
    icon: ClipboardCheck,
    color: "text-purple-400",
    bg: "from-purple-500/20 to-purple-700/10",
  },
  {
    title: "Risk Score",
    value: "Low",
    change: "Stable",
    icon: AlertTriangle,
    color: "text-orange-400",
    bg: "from-orange-500/20 to-orange-700/10",
  },
];

const ComplianceGovernanceCenter = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">

      {/* Header */}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10">

        <div>

          <h1 className="text-4xl font-bold flex items-center gap-3">

            <ShieldCheck className="text-cyan-400" size={40} />

            Compliance & Governance Center

          </h1>

          <p className="text-slate-400 mt-3 max-w-3xl">

            Monitor enterprise compliance, governance, security policies,
            audit readiness, regulatory standards, risk management,
            and organizational controls from a centralized dashboard.

          </p>

        </div>

        <button className="mt-6 lg:mt-0 bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:scale-105 transition">

          <Plus size={20} />

          New Compliance Audit

        </button>

      </div>

      {/* KPI Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

        {complianceCards.map((card, index) => {

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

      {/* Compliance Overview */}

      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 mb-10">

        <div className="flex justify-between items-center mb-6">

          <div>

            <h2 className="text-2xl font-bold flex items-center gap-3">

              <BarChart3 className="text-cyan-400" />

              Enterprise Compliance Overview

            </h2>

            <p className="text-slate-400 mt-2">

              Real-time governance and compliance status across the RuchiGo platform.

            </p>

          </div>

          <ShieldCheck className="text-green-400" size={30} />

        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">

          <div className="bg-slate-800 rounded-2xl p-5">

            <Scale className="text-cyan-400 mb-4" />

            <h3 className="font-semibold">

              Regulations

            </h3>

            <h2 className="text-4xl font-bold mt-3">

              18

            </h2>

          </div>

          <div className="bg-slate-800 rounded-2xl p-5">

            <FileCheck className="text-green-400 mb-4" />

            <h3 className="font-semibold">

              Policies

            </h3>

            <h2 className="text-4xl font-bold mt-3">

              124

            </h2>

          </div>

          <div className="bg-slate-800 rounded-2xl p-5">

            <Users className="text-purple-400 mb-4" />

            <h3 className="font-semibold">

              Governed Users

            </h3>

            <h2 className="text-4xl font-bold mt-3">

              25.4K

            </h2>

          </div>

          <div className="bg-slate-800 rounded-2xl p-5">

            <CheckCircle2 className="text-orange-400 mb-4" />

            <h3 className="font-semibold">

              Overall Health

            </h3>

            <h2 className="text-4xl font-bold mt-3">

              99.6%

            </h2>

          </div>

        </div>

      </div>
            {/* Regulatory Compliance & Security Governance */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

        {/* Regulatory Compliance */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <Scale className="text-cyan-400" />

                Regulatory Compliance

              </h2>

              <p className="text-slate-400 mt-2">

                Compliance status across international and local standards.

              </p>

            </div>

            <Gavel className="text-cyan-400" size={30} />

          </div>

          <div className="space-y-5">

            {[
              {
                standard: "GDPR",
                score: "100%",
                status: "Compliant",
              },
              {
                standard: "ISO 27001",
                score: "99%",
                status: "Compliant",
              },
              {
                standard: "PCI DSS",
                score: "98%",
                status: "Compliant",
              },
              {
                standard: "SOC 2",
                score: "97%",
                status: "Compliant",
              },
              {
                standard: "HIPAA",
                score: "96%",
                status: "Compliant",
              },
              {
                standard: "FSSAI",
                score: "100%",
                status: "Compliant",
              },
              {
                standard: "RBI Guidelines",
                score: "98%",
                status: "Compliant",
              },
              {
                standard: "Data Protection Act",
                score: "99%",
                status: "Compliant",
              },
            ].map((item, index) => (

              <div
                key={index}
                className="bg-slate-800 rounded-2xl p-5 hover:bg-slate-700 transition"
              >

                <div className="flex justify-between items-center mb-4">

                  <div>

                    <h3 className="font-semibold">

                      {item.standard}

                    </h3>

                    <p className="text-slate-400">

                      Enterprise Regulatory Standard

                    </p>

                  </div>

                  <span className="px-4 py-2 rounded-full bg-green-500/20 text-green-400 text-sm font-semibold">

                    {item.status}

                  </span>

                </div>

                <div className="flex justify-between mb-2">

                  <span className="text-slate-400">

                    Compliance Score

                  </span>

                  <span className="text-cyan-400 font-semibold">

                    {item.score}

                  </span>

                </div>

                <div className="w-full h-2 rounded-full bg-slate-700">

                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-green-500"
                    style={{ width: item.score }}
                  />

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* Security Governance */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <Lock className="text-green-400" />

                Security Governance

              </h2>

              <p className="text-slate-400 mt-2">

                Enterprise security governance and policy compliance.

              </p>

            </div>

            <ShieldCheck className="text-green-400" size={30} />

          </div>

          {[
            ["Password Policy",100],
            ["Multi-Factor Authentication",98],
            ["Encryption Compliance",100],
            ["Access Control",99],
            ["Device Compliance",97],
            ["Network Security",99],
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
                  className="h-3 rounded-full bg-gradient-to-r from-green-500 to-cyan-500"
                  style={{ width: `${item[1]}%` }}
                />

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* Governance Statistics */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <ShieldCheck className="text-cyan-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">

            Compliance Checks

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            4,582

          </h2>

          <p className="text-cyan-400 mt-3">

            Passed

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <UserCog className="text-green-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">

            Managed Roles

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            156

          </h2>

          <p className="text-green-400 mt-3">

            RBAC Enabled

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <Database className="text-purple-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">

            Protected Assets

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            8,942

          </h2>

          <p className="text-purple-400 mt-3">

            Encrypted

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <Building2 className="text-orange-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">

            Business Units

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            18

          </h2>

          <p className="text-orange-400 mt-3">

            Governed

          </p>

        </div>

      </div>
            {/* Identity & Access Governance */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

        {/* Identity & Access Governance */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <Users className="text-cyan-400" />

                Identity & Access Governance

              </h2>

              <p className="text-slate-400 mt-2">

                Enterprise identity management, RBAC and privileged access monitoring.

              </p>

            </div>

            <UserCog className="text-cyan-400" size={30} />

          </div>

          <div className="space-y-5">

            {[
              {
                role: "Super Administrators",
                users: 8,
                status: "Protected",
                health: 100,
              },
              {
                role: "Platform Administrators",
                users: 24,
                status: "Protected",
                health: 99,
              },
              {
                role: "Restaurant Managers",
                users: 324,
                status: "Protected",
                health: 98,
              },
              {
                role: "Delivery Managers",
                users: 86,
                status: "Protected",
                health: 99,
              },
              {
                role: "Support Team",
                users: 142,
                status: "Protected",
                health: 97,
              },
            ].map((role,index)=>(

              <div
                key={index}
                className="bg-slate-800 rounded-2xl p-5"
              >

                <div className="flex justify-between items-center mb-4">

                  <div>

                    <h3 className="font-semibold">

                      {role.role}

                    </h3>

                    <p className="text-slate-400">

                      {role.users} Active Users

                    </p>

                  </div>

                  <span className="px-4 py-2 rounded-full bg-green-500/20 text-green-400 text-sm font-semibold">

                    {role.status}

                  </span>

                </div>

                <div className="flex justify-between mb-2">

                  <span className="text-slate-400">

                    Access Compliance

                  </span>

                  <span className="text-cyan-400 font-semibold">

                    {role.health}%

                  </span>

                </div>

                <div className="w-full h-2 rounded-full bg-slate-700">

                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-green-500"
                    style={{ width: `${role.health}%` }}
                  />

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* Audit Center */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <ClipboardCheck className="text-green-400" />

                Enterprise Audit Center

              </h2>

              <p className="text-slate-400 mt-2">

                Internal and external audit tracking with remediation status.

              </p>

            </div>

            <ClipboardCheck className="text-green-400" size={30} />

          </div>

          <div className="space-y-4">

            {[
              {
                audit:"Internal Security Audit",
                status:"Completed",
                score:"100%",
              },
              {
                audit:"ISO 27001 Audit",
                status:"Completed",
                score:"99%",
              },
              {
                audit:"PCI DSS Assessment",
                status:"Completed",
                score:"98%",
              },
              {
                audit:"Vendor Compliance Review",
                status:"Running",
                score:"92%",
              },
              {
                audit:"Privacy Assessment",
                status:"Scheduled",
                score:"--",
              },
            ].map((audit,index)=>(

              <div
                key={index}
                className="bg-slate-800 rounded-2xl p-5 flex justify-between items-center"
              >

                <div>

                  <h3 className="font-semibold">

                    {audit.audit}

                  </h3>

                  <p className="text-slate-400">

                    Enterprise Compliance Audit

                  </p>

                </div>

                <div className="text-right">

                  <p
                    className={`font-semibold ${
                      audit.status==="Completed"
                        ? "text-green-400"
                        : audit.status==="Running"
                        ? "text-cyan-400"
                        : "text-yellow-400"
                    }`}
                  >

                    {audit.status}

                  </p>

                  <p className="text-slate-400">

                    {audit.score}

                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* Governance Analytics */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <ClipboardCheck className="text-cyan-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">

            Audits Completed

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            486

          </h2>

          <p className="text-cyan-400 mt-2">

            This Year

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <Users className="text-green-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">

            RBAC Roles

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            156

          </h2>

          <p className="text-green-400 mt-2">

            Active Roles

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <ShieldCheck className="text-purple-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">

            Policy Compliance

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            99.2%

          </h2>

          <p className="text-purple-400 mt-2">

            Enterprise Wide

          </p>

        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <Activity className="text-orange-400 mb-4" size={34} />

          <h3 className="text-lg font-semibold">

            Open Findings

          </h3>

          <h2 className="text-4xl font-bold mt-3">

            7

          </h2>

          <p className="text-orange-400 mt-2">

            Under Review

          </p>

        </div>

      </div>
            {/* Enterprise Risk Management & Data Governance */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

        {/* Enterprise Risk Management */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <AlertTriangle className="text-orange-400" />

                Enterprise Risk Management

              </h2>

              <p className="text-slate-400 mt-2">

                Monitor organizational risks, vulnerabilities and mitigation strategies.

              </p>

            </div>

            <Activity className="text-orange-400" size={30} />

          </div>

          <div className="space-y-5">

            {[
              {
                title: "Cyber Security",
                level: "High",
                score: 92,
              },
              {
                title: "Operational Risk",
                level: "Medium",
                score: 78,
              },
              {
                title: "Vendor Risk",
                level: "Low",
                score: 58,
              },
              {
                title: "Financial Compliance",
                level: "Low",
                score: 42,
              },
              {
                title: "Data Privacy",
                level: "Medium",
                score: 74,
              },
            ].map((risk,index)=>(

              <div
                key={index}
                className="bg-slate-800 rounded-2xl p-5"
              >

                <div className="flex justify-between items-center mb-3">

                  <h3 className="font-semibold">

                    {risk.title}

                  </h3>

                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      risk.level==="High"
                        ? "bg-red-500/20 text-red-400"
                        : risk.level==="Medium"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >

                    {risk.level}

                  </span>

                </div>

                <div className="flex justify-between mb-2">

                  <span className="text-slate-400">

                    Risk Index

                  </span>

                  <span className="font-semibold text-orange-400">

                    {risk.score}%

                  </span>

                </div>

                <div className="w-full h-2 rounded-full bg-slate-700">

                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                    style={{ width: `${risk.score}%` }}
                  />

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* Data Governance */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <Database className="text-cyan-400" />

                Data Governance

              </h2>

              <p className="text-slate-400 mt-2">

                Enterprise data lifecycle, encryption and privacy management.

              </p>

            </div>

            <Database className="text-cyan-400" size={30} />

          </div>

          {[
            ["Data Classification",100],
            ["Encryption Coverage",99],
            ["Retention Policy",98],
            ["Privacy Compliance",100],
            ["Backup Compliance",99],
            ["Data Integrity",100],
          ].map((item,index)=>(

            <div key={index} className="mb-6">

              <div className="flex justify-between mb-2">

                <span>{item[0]}</span>

                <span className="text-cyan-400 font-semibold">

                  {item[1]}%

                </span>

              </div>

              <div className="w-full h-3 rounded-full bg-slate-800">

                <div
                  className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  style={{ width: `${item[1]}%` }}
                />

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* AI Governance & Governance Performance */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

        {/* Responsible AI */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <Brain className="text-purple-400" />

                Responsible AI Governance

              </h2>

              <p className="text-slate-400 mt-2">

                AI compliance, explainability and governance monitoring.

              </p>

            </div>

            <Brain className="text-purple-400" size={30} />

          </div>

          <div className="grid grid-cols-2 gap-5">

            {[
              {
                title:"Bias Detection",
                value:"99%",
                color:"text-green-400",
              },
              {
                title:"Explainability",
                value:"98%",
                color:"text-cyan-400",
              },
              {
                title:"Model Governance",
                value:"100%",
                color:"text-purple-400",
              },
              {
                title:"AI Risk",
                value:"Low",
                color:"text-orange-400",
              },
            ].map((item,index)=>(

              <div
                key={index}
                className="bg-slate-800 rounded-2xl p-5 text-center"
              >

                <h3 className="font-semibold mb-3">

                  {item.title}

                </h3>

                <h2 className={`text-3xl font-bold ${item.color}`}>

                  {item.value}

                </h2>

              </div>

            ))}

          </div>

        </div>

        {/* Governance Performance */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <BarChart3 className="text-green-400" />

                Governance Performance

              </h2>

              <p className="text-slate-400 mt-2">

                Overall enterprise governance health indicators.

              </p>

            </div>

            <ShieldCheck className="text-green-400" size={30} />

          </div>

          <div className="space-y-5">

            {[
              ["Compliance Efficiency",99],
              ["Audit Success",98],
              ["Policy Adoption",97],
              ["Risk Resolution",95],
              ["Security Governance",99],
              ["Business Continuity",100],
            ].map((metric,index)=>(

              <div key={index}>

                <div className="flex justify-between mb-2">

                  <span>{metric[0]}</span>

                  <span className="text-green-400 font-semibold">

                    {metric[1]}%

                  </span>

                </div>

                <div className="w-full h-2 rounded-full bg-slate-700">

                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                    style={{ width: `${metric[1]}%` }}
                  />

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* Compliance Activity Logs */}

      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 mb-10">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold flex items-center gap-3">

            <Activity className="text-cyan-400" />

            Compliance Activity Logs

          </h2>

          <Globe2 className="text-cyan-400" size={28} />

        </div>

        <div className="space-y-4">

          {[
            "ISO 27001 audit completed successfully.",
            "GDPR compliance verification passed.",
            "New password policy enforced for all administrators.",
            "Vendor security assessment completed.",
            "Quarterly AI governance review approved.",
            "Data retention policy updated successfully.",
          ].map((log,index)=>(

            <div
              key={index}
              className="flex items-center gap-4 bg-slate-800 rounded-xl p-4"
            >

              <CheckCircle2 className="text-green-400" size={22} />

              <span>{log}</span>

            </div>

          ))}

        </div>

      </div>
            {/* AI Compliance Recommendations & Executive Governance Insights */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

        {/* AI Compliance Recommendations */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <Brain className="text-purple-400" />

                AI Compliance Recommendations

              </h2>

              <p className="text-slate-400 mt-2">

                AI-generated recommendations to strengthen enterprise governance and regulatory compliance.

              </p>

            </div>

            <ShieldCheck className="text-green-400" size={30} />

          </div>

          <div className="space-y-5">

            {[
              {
                title: "Strengthen Vendor Assessments",
                desc: "Review third-party vendors with elevated operational risk scores.",
                priority: "High",
              },
              {
                title: "Enable Continuous Compliance Monitoring",
                desc: "Automate regulatory checks for critical enterprise systems.",
                priority: "High",
              },
              {
                title: "Review AI Governance Policies",
                desc: "Update Responsible AI guidelines for upcoming model releases.",
                priority: "Medium",
              },
              {
                title: "Archive Expired Policies",
                desc: "Move outdated governance documents into archival storage.",
                priority: "Low",
              },
              {
                title: "Increase MFA Adoption",
                desc: "Enforce multi-factor authentication for privileged accounts.",
                priority: "Medium",
              },
            ].map((item, index) => (

              <div
                key={index}
                className="bg-slate-800 rounded-2xl p-5"
              >

                <div className="flex justify-between items-center mb-3">

                  <h3 className="font-semibold">

                    {item.title}

                  </h3>

                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      item.priority === "High"
                        ? "bg-red-500/20 text-red-400"
                        : item.priority === "Medium"
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

        {/* Executive Governance Insights */}

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold flex items-center gap-3">

                <BarChart3 className="text-cyan-400" />

                Executive Governance Insights

              </h2>

              <p className="text-slate-400 mt-2">

                Executive-level governance and compliance KPIs.

              </p>

            </div>

            <Activity className="text-cyan-400" size={30} />

          </div>

          <div className="space-y-5">

            {[
              {
                title: "Enterprise Compliance",
                value: "99.4%",
                color: "text-green-400",
              },
              {
                title: "Audit Readiness",
                value: "100%",
                color: "text-cyan-400",
              },
              {
                title: "Policy Coverage",
                value: "98.8%",
                color: "text-purple-400",
              },
              {
                title: "Risk Exposure",
                value: "Low",
                color: "text-orange-400",
              },
              {
                title: "AI Governance Score",
                value: "99%",
                color: "text-pink-400",
              },
            ].map((item, index) => (

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

      {/* Enterprise Governance Dashboard */}

      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 mb-10">

        <div className="flex justify-between items-center mb-8">

          <div>

            <h2 className="text-2xl font-bold flex items-center gap-3">

              <Building2 className="text-cyan-400" />

              Enterprise Governance Dashboard

            </h2>

            <p className="text-slate-400 mt-2">

              Organization-wide governance, compliance, audit and security overview.

            </p>

          </div>

          <ShieldCheck className="text-green-400" size={30} />

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          <div className="bg-slate-800 rounded-2xl p-6">

            <ShieldCheck className="text-cyan-400 mb-4" size={34} />

            <h3 className="font-semibold">

              Compliance Score

            </h3>

            <h2 className="text-3xl font-bold mt-3">

              99.4%

            </h2>

            <p className="text-cyan-400 mt-2">

              Enterprise Wide

            </p>

          </div>

          <div className="bg-slate-800 rounded-2xl p-6">

            <ClipboardCheck className="text-green-400 mb-4" size={34} />

            <h3 className="font-semibold">

              Audits Passed

            </h3>

            <h2 className="text-3xl font-bold mt-3">

              486

            </h2>

            <p className="text-green-400 mt-2">

              Successful Reviews

            </p>

          </div>

          <div className="bg-slate-800 rounded-2xl p-6">

            <Database className="text-purple-400 mb-4" size={34} />

            <h3 className="font-semibold">

              Protected Assets

            </h3>

            <h2 className="text-3xl font-bold mt-3">

              8,942

            </h2>

            <p className="text-purple-400 mt-2">

              Fully Encrypted

            </p>

          </div>

          <div className="bg-slate-800 rounded-2xl p-6">

            <Globe2 className="text-orange-400 mb-4" size={34} />

            <h3 className="font-semibold">

              Global Standards

            </h3>

            <h2 className="text-3xl font-bold mt-3">

              18

            </h2>

            <p className="text-orange-400 mt-2">

              Fully Compliant

            </p>

          </div>

        </div>

      </div>

      {/* Business Continuity Overview */}

      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-8 mb-10">

        <div className="flex justify-between items-center mb-8">

          <div>

            <h2 className="text-2xl font-bold flex items-center gap-3">

              <Activity className="text-green-400" />

              Business Continuity Overview

            </h2>

            <p className="text-slate-400 mt-2">

              Overall resilience and governance posture supporting uninterrupted business operations.

            </p>

          </div>

          <CheckCircle2 className="text-green-400" size={32} />

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          <div className="text-center">

            <h2 className="text-4xl font-bold text-cyan-400">

              99.98%

            </h2>

            <p className="text-slate-400 mt-2">

              Service Availability

            </p>

          </div>

          <div className="text-center">

            <h2 className="text-4xl font-bold text-green-400">

              100%

            </h2>

            <p className="text-slate-400 mt-2">

              Audit Ready

            </p>

          </div>

          <div className="text-center">

            <h2 className="text-4xl font-bold text-purple-400">

              Low

            </h2>

            <p className="text-slate-400 mt-2">

              Enterprise Risk

            </p>

          </div>

          <div className="text-center">

            <h2 className="text-4xl font-bold text-orange-400">

              18

            </h2>

            <p className="text-slate-400 mt-2">

              Standards Met

            </p>

          </div>

        </div>

      </div>
            {/* Executive Action Center */}

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">

        <button className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl py-5 font-semibold flex items-center justify-center gap-3 hover:scale-105 transition">

          <ClipboardCheck size={20} />

          Run Audit

        </button>

        <button className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl py-5 font-semibold flex items-center justify-center gap-3 hover:scale-105 transition">

          <FileCheck size={20} />

          Export Report

        </button>

        <button className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl py-5 font-semibold flex items-center justify-center gap-3 hover:scale-105 transition">

          <ShieldCheck size={20} />

          Compliance Scan

        </button>

        <button className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl py-5 font-semibold flex items-center justify-center gap-3 hover:scale-105 transition">

          <AlertTriangle size={20} />

          Risk Assessment

        </button>

        <button className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl py-5 font-semibold flex items-center justify-center gap-3 hover:scale-105 transition">

          <Gavel size={20} />

          Policy Review

        </button>

        <button className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl py-5 font-semibold flex items-center justify-center gap-3 hover:scale-105 transition">

          <Lock size={20} />

          Emergency Lockdown

        </button>

      </div>

      {/* Compliance & Governance Summary */}

      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 mb-10">

        <div className="flex items-center gap-3 mb-6">

          <ShieldCheck className="text-green-400" size={34} />

          <h2 className="text-3xl font-bold">

            Compliance & Governance Summary

          </h2>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          <div className="bg-slate-800 rounded-2xl p-5">

            <h3 className="text-slate-400">

              Overall Compliance

            </h3>

            <h2 className="text-4xl font-bold mt-3 text-green-400">

              99.4%

            </h2>

          </div>

          <div className="bg-slate-800 rounded-2xl p-5">

            <h3 className="text-slate-400">

              Active Policies

            </h3>

            <h2 className="text-4xl font-bold mt-3 text-cyan-400">

              124

            </h2>

          </div>

          <div className="bg-slate-800 rounded-2xl p-5">

            <h3 className="text-slate-400">

              Audits Passed

            </h3>

            <h2 className="text-4xl font-bold mt-3 text-purple-400">

              486

            </h2>

          </div>

          <div className="bg-slate-800 rounded-2xl p-5">

            <h3 className="text-slate-400">

              Enterprise Risk

            </h3>

            <h2 className="text-4xl font-bold mt-3 text-orange-400">

              Low

            </h2>

          </div>

        </div>

      </div>

      {/* Enterprise Footer */}

      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 p-8">

        <div className="text-center">

          <ShieldCheck className="mx-auto text-cyan-400 mb-4" size={52} />

          <h2 className="text-3xl font-bold mb-3">

            Compliance & Governance Center

          </h2>

          <p className="text-slate-400 max-w-3xl mx-auto">

            The Compliance & Governance Center provides enterprise-grade
            governance, regulatory compliance, audit management, policy
            administration, identity governance, risk management, AI
            governance, and security oversight to ensure the RuchiGo
            platform operates securely, transparently, and in accordance
            with global standards and organizational policies.

          </p>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">

          <div className="text-center">

            <h2 className="text-3xl font-bold text-cyan-400">

              18

            </h2>

            <p className="text-slate-400 mt-2">

              Regulations

            </p>

          </div>

          <div className="text-center">

            <h2 className="text-3xl font-bold text-green-400">

              99.4%

            </h2>

            <p className="text-slate-400 mt-2">

              Compliance Score

            </p>

          </div>

          <div className="text-center">

            <h2 className="text-3xl font-bold text-purple-400">

              486

            </h2>

            <p className="text-slate-400 mt-2">

              Audits Passed

            </p>

          </div>

          <div className="text-center">

            <h2 className="text-3xl font-bold text-orange-400">

              Low

            </h2>

            <p className="text-slate-400 mt-2">

              Enterprise Risk

            </p>

          </div>

        </div>

      </div>

    </div>

  );

};

export default ComplianceGovernanceCenter;