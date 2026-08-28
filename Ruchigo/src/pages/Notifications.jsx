import Navbar from "../components/Navbar.jsx";
import {
  Bell,
  PackageCheck,
  Tag,
  Truck,
  CheckCircle2,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../lib/api.js";
import toast from "react-hot-toast";

const tabs = [
  "All",
  "Unread",
  "Orders",
  "Offers",
];

const initialNotifications = [
  {
    id: 1,
    title: "Order Confirmed",
    message: "Your order #RG202600128 has been confirmed.",
    time: "2 mins ago",
    type: "Orders",
    read: false,
    icon: PackageCheck,
  },
  {
    id: 2,
    title: "Delivery Partner Assigned",
    message: "Rahul Kumar is on the way to deliver your food.",
    time: "15 mins ago",
    type: "Orders",
    read: false,
    icon: Truck,
  },
  {
    id: 3,
    title: "Flat ₹100 OFF",
    message: "Use coupon RUCHIGO100 on your next order.",
    time: "1 hour ago",
    type: "Offers",
    read: true,
    icon: Tag,
  },
  {
    id: 4,
    title: "Cashback Received",
    message: "₹50 cashback has been added to your wallet.",
    time: "Yesterday",
    type: "Offers",
    read: true,
    icon: CheckCircle2,
  },
];

export default function Notifications() {

  const [activeTab, setActiveTab] =
    useState("All");

  const { token } = useAuth();
  const [notifications, setNotifications] = useState(initialNotifications);

  useEffect(() => {
    apiRequest("/notifications/", { token }).then((data) => setNotifications((data.results || data).map((item) => ({ id: item.id, title: item.title, message: item.message, time: new Date(item.created_at).toLocaleString(), type: item.kind === "order" ? "Orders" : "Offers", read: item.is_read, icon: item.kind === "order" ? PackageCheck : Tag })))).catch((error) => toast.error(error.message));
  }, [token]);

  const updateNotification = async (id, body) => {
    try { const updated = await apiRequest(`/notifications/${id}/`, { token, method: "PATCH", body }); setNotifications((items) => items.map((item) => item.id === id ? { ...item, read: updated.is_read } : item)); }
    catch (error) { toast.error(error.message); }
  };
  const removeNotification = async (id) => {
    try { await apiRequest(`/notifications/${id}/`, { token, method: "DELETE" }); setNotifications((items) => items.filter((item) => item.id !== id)); }
    catch (error) { toast.error(error.message); }
  };

  const filteredNotifications =
    notifications.filter((notification) => {

      if (activeTab === "All") return true;

      if (activeTab === "Unread")
        return !notification.read;

      return notification.type === activeTab;

    });

  return (

    <>

      <Navbar />

      <main className="min-h-screen bg-[#fffaf7]">

        <section className="mx-auto max-w-6xl px-6 py-10">

          {/* Header */}

          <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-center">

            <div>

              <p className="font-semibold text-orange-500">
                Notification Center
              </p>

              <h1 className="mt-2 text-4xl font-bold text-gray-900">
                Notifications
              </h1>

              <p className="mt-3 text-gray-500">
                Stay updated with your orders, offers and account activity.
              </p>

            </div>

            <button onClick={() => Promise.all(notifications.map((item) => removeNotification(item.id)))}
              className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              Clear All
            </button>

          </div>

          {/* Tabs */}

          <div className="mb-8 flex flex-wrap gap-4">

            {tabs.map((tab) => (

              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl px-6 py-3 font-semibold transition ${
                  activeTab === tab
                    ? "bg-orange-500 text-white"
                    : "border border-orange-200 bg-white text-orange-500 hover:bg-orange-50"
                }`}
              >
                {tab}
              </button>

            ))}

          </div>

          {/* Notifications */}

          <div className="space-y-5">
                        {filteredNotifications.length === 0 ? (

              <div className="rounded-3xl border border-dashed border-orange-200 bg-white py-20 text-center shadow-sm">

                <Bell
                  size={70}
                  className="mx-auto text-orange-300"
                />

                <h2 className="mt-6 text-3xl font-bold text-gray-900">
                  No Notifications
                </h2>

                <p className="mt-4 text-gray-500">
                  You're all caught up! New notifications will appear here.
                </p>

              </div>

            ) : (

              filteredNotifications.map((notification) => {

                const Icon = notification.icon;

                return (

                  <div
                    key={notification.id}
                    className={`rounded-3xl border p-6 shadow-sm transition hover:shadow-lg ${
                      notification.read
                        ? "border-orange-100 bg-white"
                        : "border-orange-300 bg-orange-50"
                    }`}
                  >

                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                      {/* Left Side */}

                      <div className="flex items-start gap-5">

                        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                          notification.read
                            ? "bg-orange-100 text-orange-500"
                            : "bg-orange-500 text-white"
                        }`}>

                          <Icon size={30} />

                        </div>

                        <div>

                          <div className="flex flex-wrap items-center gap-3">

                            <h2 className="text-xl font-bold text-gray-900">
                              {notification.title}
                            </h2>

                            {!notification.read && (

                              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                                New
                              </span>

                            )}

                          </div>

                          <p className="mt-3 text-gray-600">
                            {notification.message}
                          </p>

                          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">

                            <span>
                              {notification.time}
                            </span>

                            <span className="rounded-full bg-orange-100 px-3 py-1 font-medium text-orange-600">
                              {notification.type}
                            </span>

                          </div>

                        </div>

                      </div>

                      {/* Right Side */}

                      <div className="flex flex-wrap gap-3">

                        {!notification.read && (

                          <button onClick={() => updateNotification(notification.id, { is_read: true })} className="rounded-xl bg-green-500 px-5 py-3 font-semibold text-white transition hover:bg-green-600">
                            Mark as Read
                          </button>

                        )}

                        <button onClick={() => removeNotification(notification.id)} className="rounded-xl border border-red-300 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-500 hover:text-white">
                          Delete
                        </button>

                      </div>

                    </div>

                  </div>

                );

              })

            )}
                      </div>

        </section>

      </main>

    </>

  );

}
