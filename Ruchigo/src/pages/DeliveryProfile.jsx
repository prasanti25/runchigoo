import DeliverySidebar from "../components/DeliverySidebar.jsx";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Bike,
  Star,
  ShoppingBag,
  Clock,
  ShieldCheck,
  Pencil,
  CreditCard,
  FileCheck2,
  CheckCircle2,
  Bell,
  Award,
} from "lucide-react";

const performanceStats = [
  {
    title: "Total Deliveries",
    value: "1,240",
    icon: ShoppingBag,
  },
  {
    title: "Partner Rating",
    value: "4.9",
    icon: Star,
  },
  {
    title: "Online Hours",
    value: "842h",
    icon: Clock,
  },
  {
    title: "Acceptance Rate",
    value: "98%",
    icon: CheckCircle2,
  },
];

const documents = [
  {
    name: "Driving License",
    number: "AP26 20210004821",
    status: "Verified",
  },
  {
    name: "Aadhaar Card",
    number: "XXXX XXXX 4821",
    status: "Verified",
  },
  {
    name: "Vehicle RC",
    number: "AP 07 BK 4821",
    status: "Verified",
  },
  {
    name: "Bank Account",
    number: "HDFC •••• 4821",
    status: "Verified",
  },
];

export default function DeliveryProfile() {
  return (
    <div className="min-h-screen bg-[#fffaf7]">
      <DeliverySidebar />

      <main className="ml-72 min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-orange-100 bg-white px-8 py-5">
          <div>
            <p className="text-sm text-gray-500">
              Delivery Partner Account
            </p>

            <h1 className="text-2xl font-bold text-gray-900">
              My Profile
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <Bell size={20} />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600">
              <Pencil size={18} />
              Edit Profile
            </button>
          </div>
        </header>

        <section className="p-8">
          {/* Profile Hero */}
          <section className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
            <div className="h-44 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400" />

            <div className="px-8 pb-8">
              <div className="-mt-16 flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                  <div className="flex h-32 w-32 items-center justify-center rounded-3xl border-8 border-white bg-orange-100 text-4xl font-bold text-orange-500 shadow-lg">
                    RK
                  </div>

                  <div className="pb-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-3xl font-bold text-gray-900">
                        Rahul Kumar
                      </h2>

                      <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-2 text-xs font-semibold text-green-600">
                        <ShieldCheck size={15} />
                        Verified Partner
                      </span>
                    </div>

                    <p className="mt-2 text-gray-500">
                      RuchiGo Delivery Partner
                    </p>

                    <div className="mt-3 flex flex-wrap gap-5 text-sm text-gray-500">
                      <span className="flex items-center gap-2">
                        <MapPin
                          size={17}
                          className="text-orange-500"
                        />
                        Guntur, Andhra Pradesh
                      </span>

                      <span className="flex items-center gap-2">
                        <Star
                          size={17}
                          className="text-yellow-500"
                        />
                        4.9 Partner Rating
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pb-2">
                  <div className="flex items-center gap-3 rounded-2xl bg-green-50 px-5 py-4">
                    <span className="h-3 w-3 rounded-full bg-green-500" />

                    <div>
                      <p className="text-xs text-gray-500">
                        Current Status
                      </p>

                      <p className="font-bold text-green-600">
                        Online & Available
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {performanceStats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                    <Icon size={23} />
                  </div>

                  <p className="mt-5 text-sm text-gray-500">
                    {stat.title}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </h2>
                </div>
              );
            })}
          </div>

          <div className="mt-8 grid gap-7 xl:grid-cols-[1.3fr_1fr]">
            {/* Personal Details */}
            <section className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Personal Information
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Your registered account details.
                  </p>
                </div>

                <button className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition hover:bg-orange-500 hover:text-white">
                  <Pencil size={18} />
                </button>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#fffaf7] p-5">
                  <div className="flex items-center gap-3">
                    <User
                      size={19}
                      className="text-orange-500"
                    />

                    <p className="text-sm text-gray-500">
                      Full Name
                    </p>
                  </div>

                  <p className="mt-3 font-bold text-gray-900">
                    Rahul Kumar
                  </p>
                </div>

                <div className="rounded-2xl bg-[#fffaf7] p-5">
                  <div className="flex items-center gap-3">
                    <Phone
                      size={19}
                      className="text-orange-500"
                    />

                    <p className="text-sm text-gray-500">
                      Phone Number
                    </p>
                  </div>

                  <p className="mt-3 font-bold text-gray-900">
                    +91 98765 48210
                  </p>
                </div>

                <div className="rounded-2xl bg-[#fffaf7] p-5">
                  <div className="flex items-center gap-3">
                    <Mail
                      size={19}
                      className="text-orange-500"
                    />

                    <p className="text-sm text-gray-500">
                      Email Address
                    </p>
                  </div>

                  <p className="mt-3 font-bold text-gray-900">
                    rahul@ruchigo.in
                  </p>
                </div>

                <div className="rounded-2xl bg-[#fffaf7] p-5">
                  <div className="flex items-center gap-3">
                    <MapPin
                      size={19}
                      className="text-orange-500"
                    />

                    <p className="text-sm text-gray-500">
                      Delivery City
                    </p>
                  </div>

                  <p className="mt-3 font-bold text-gray-900">
                    Guntur
                  </p>
                </div>
              </div>
            </section>

            {/* Partner Level */}
            <aside className="rounded-3xl bg-gradient-to-br from-orange-600 to-orange-400 p-7 text-white shadow-lg">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                <Award size={28} />
              </div>

              <p className="mt-6 text-sm text-orange-100">
                Partner Level
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Gold Partner 🏆
              </h2>

              <p className="mt-4 leading-7 text-orange-50">
                You're one of the top-performing delivery partners in
                Guntur.
              </p>

              <div className="mt-7 rounded-2xl bg-white/15 p-5 backdrop-blur-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-orange-100">
                    Platinum Progress
                  </span>

                  <span className="font-bold">
                    1,240 / 1,500
                  </span>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full w-[82%] rounded-full bg-white" />
                </div>

                <p className="mt-4 text-sm text-orange-100">
                  260 more deliveries to reach Platinum.
                </p>
              </div>
            </aside>
          </div>

          {/* Vehicle and Documents */}
          <div className="mt-8 grid gap-7 xl:grid-cols-[1fr_1.5fr]">
            {/* Vehicle */}
            <section className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  <Bike size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Vehicle Details
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Registered delivery vehicle.
                  </p>
                </div>
              </div>

              <div className="mt-7 flex h-44 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-100 to-orange-200">
                <Bike
                  size={90}
                  className="text-orange-500"
                />
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <span className="text-sm text-gray-500">
                    Vehicle Type
                  </span>

                  <span className="font-bold text-gray-900">
                    Motorcycle
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <span className="text-sm text-gray-500">
                    Vehicle Model
                  </span>

                  <span className="font-bold text-gray-900">
                    Honda Shine
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Registration
                  </span>

                  <span className="font-bold text-gray-900">
                    AP 07 BK 4821
                  </span>
                </div>
              </div>
            </section>

            {/* Documents */}
            <section className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Documents & Verification
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Verification status of your delivery partner
                  documents.
                </p>
              </div>

              <div className="mt-7 space-y-4">
                {documents.map((document) => (
                  <div
                    key={document.name}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-orange-100 p-5 transition hover:bg-orange-50 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                        {document.name === "Bank Account" ? (
                          <CreditCard size={21} />
                        ) : (
                          <FileCheck2 size={21} />
                        )}
                      </div>

                      <div>
                        <p className="font-bold text-gray-900">
                          {document.name}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {document.number}
                        </p>
                      </div>
                    </div>

                    <span className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-xs font-semibold text-green-600">
                      <CheckCircle2 size={15} />
                      {document.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Account Security */}
          <section className="mt-8 rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                  <ShieldCheck size={26} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Account Security
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Your account and delivery partner identity are
                    verified.
                  </p>
                </div>
              </div>

              <button className="rounded-xl border border-orange-200 px-6 py-3 font-semibold text-orange-500 transition hover:bg-orange-500 hover:text-white">
                Manage Security
              </button>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}