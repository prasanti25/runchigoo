import Navbar from "../components/Navbar.jsx";
import {
  User,
  ShoppingBag,
  MapPin,
  Heart,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Clock,
  Star,
  PackageCheck,
  Edit3,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../lib/api.js";
import { useEffect, useState } from "react";

const menuItems = [
  {
    name: "My Orders",
    description: "View current and previous orders",
    icon: ShoppingBag,
    link: "/orders",
  },
  {
    name: "Saved Addresses",
    description: "Manage your delivery locations",
    icon: MapPin,
    link: "/addresses",
  },
  {
    name: "Favorites",
    description: "Your favourite restaurants and foods",
    icon: Heart,
    link: "/wishlist",
  },
  {
    name: "Notifications",
    description: "View your latest updates",
    icon: Bell,
    link: "/notifications",
  },
  {
    name: "Settings",
    description: "Manage account preferences",
    icon: Settings,
    link: "/settings",
  },
];

export default function Profile() {

  const { user: authUser, token, logout } = useAuth();
  const [orderCount, setOrderCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);

  const user = { name: authUser?.name || `${authUser?.first_name || ""} ${authUser?.last_name || ""}`.trim() || "Customer", email: authUser?.email || "", phone: authUser?.phone || "Not added", totalOrders: orderCount, reviews: reviewCount };

  useEffect(() => {
    if (!token) return;
    Promise.all([apiRequest("/orders/", { token }), apiRequest("/reviews/", { token })])
      .then(([orderData, reviewData]) => {
        const orders = orderData.results || orderData;
        setOrderCount(orderData.count ?? orders.length);
        setReviewCount(reviewData.count ?? (reviewData.results || reviewData).length);
        setRecentOrders(orders.slice(0, 3).map((order) => ({
          id: `#RG${String(order.number).slice(0, 8).toUpperCase()}`,
          trackingId: order.id,
          restaurant: order.restaurant_detail?.name || "Restaurant",
          items: order.items || [],
          total: Number(order.total),
          status: order.status === "delivered" ? "Delivered" : order.status === "cancelled" ? "Cancelled" : order.status === "out_for_delivery" ? "On the way" : "Preparing",
          icon: "🍽️",
        })));
      })
      .catch(() => {
        setOrderCount(0);
        setReviewCount(0);
        setRecentOrders([]);
      });
  }, [token]);

  return (

    <>

      <Navbar />

      <main className="min-h-screen bg-[#fffaf7]">

        <section className="mx-auto max-w-7xl px-6 py-10">

          <div className="mb-8">

            <p className="font-semibold text-orange-500">
              My Account
            </p>

            <h1 className="mt-2 text-4xl font-bold text-gray-900">
              Profile
            </h1>

            <p className="mt-3 text-gray-500">
              Manage your account, orders and delivery preferences.
            </p>

          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">

            {/* Left Section */}

            <aside className="space-y-6">
                            {/* Profile Card */}

              <div className="rounded-3xl border border-orange-100 bg-white p-7 text-center shadow-sm">

                <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-400 text-white shadow-lg">

                  <User size={48} />

                  <Link to="/settings" aria-label="Edit profile" className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-gray-900 text-white">

                    <Edit3 size={14} />

                  </Link>

                </div>

                <h2 className="mt-5 text-2xl font-bold text-gray-900">
                  {user.name}
                </h2>

                <p className="mt-2 break-all text-gray-500">
                  {user.email}
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  {user.phone}
                </p>

                <Link to="/settings" className="mt-6 block w-full rounded-xl border border-orange-200 px-5 py-3 font-semibold text-orange-500 transition hover:bg-orange-500 hover:text-white">
                  Edit Profile
                </Link>

              </div>

              {/* Stats */}

              <div className="grid grid-cols-2 gap-4">

                <div className="rounded-2xl border border-orange-100 bg-white p-5 text-center shadow-sm">

                  <ShoppingBag
                    className="mx-auto text-orange-500"
                    size={25}
                  />

                  <p className="mt-3 text-2xl font-bold text-gray-900">
                    {user.totalOrders}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Total Orders
                  </p>

                </div>

                <div className="rounded-2xl border border-orange-100 bg-white p-5 text-center shadow-sm">

                  <Star
                    className="mx-auto text-orange-500"
                    size={25}
                  />

                  <p className="mt-3 text-2xl font-bold text-gray-900">
                    {user.reviews}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Reviews
                  </p>

                </div>

              </div>

            </aside>

            {/* Right Section */}

            <section className="space-y-7">

              {/* Account Menu */}

              <div className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">

                <h2 className="text-2xl font-bold text-gray-900">
                  Account
                </h2>

                <div className="mt-5 divide-y divide-gray-100">

                  {menuItems.map((item) => {

                    const Icon = item.icon;

                    return (

                      <Link
                        key={item.name}
                        to={item.link}
                        className="flex w-full items-center gap-4 py-5 transition hover:bg-orange-50"
                      >

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500">

                          <Icon size={22} />

                        </div>

                        <div className="flex-1">

                          <h3 className="font-bold text-gray-900">
                            {item.name}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            {item.description}
                          </p>

                        </div>

                        <ChevronRight
                          size={20}
                          className="text-gray-400"
                        />

                      </Link>

                    );

                  })}

                </div>

              </div>

              {/* Recent Orders */}
                            <div className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="text-2xl font-bold text-gray-900">
                      Recent Orders
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                      Your latest RuchiGo orders.
                    </p>

                  </div>

                  <Link
                    to="/orders"
                    className="font-semibold text-orange-500 hover:text-orange-600"
                  >
                    View All
                  </Link>

                </div>

                <div className="mt-6 space-y-5">

                  {recentOrders.length === 0 ? <p className="rounded-2xl bg-orange-50 p-5 text-center text-gray-500">No recent orders yet.</p> : recentOrders.map((order) => (

                    <div
                      key={order.id}
                      className="flex flex-col gap-5 rounded-2xl border border-gray-100 p-5 transition hover:border-orange-200 sm:flex-row sm:items-center"
                    >

                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-4xl">
                        {order.icon}
                      </div>

                      <div className="flex-1">

                        <div className="flex flex-wrap items-center gap-3">

                          <h3 className="font-bold text-gray-900">
                            {order.restaurant}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              order.status === "Delivered"
                                ? "bg-green-50 text-green-600"
                                : "bg-orange-50 text-orange-500"
                            }`}
                          >
                            {order.status}
                          </span>

                        </div>

                        <p className="mt-2 text-sm text-gray-500">

                          {Array.isArray(order.items)
                            ? order.items
                                .map((item) => item.name)
                                .join(", ")
                            : order.items}

                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-5 text-xs text-gray-400">

                          <span className="flex items-center gap-1">

                            <PackageCheck size={15} />

                            {order.id}

                          </span>

                          <span className="flex items-center gap-1">

                            <Clock size={15} />

                            Recent Order

                          </span>

                        </div>

                      </div>

                      <div className="sm:text-right">

                        <p className="text-lg font-bold text-gray-900">
                          ₹{order.total}
                        </p>

                        {order.status === "On the way" ? (

                          <Link
                            to={`/tracking/${order.trackingId}`}
                            className="mt-3 inline-block rounded-lg bg-orange-50 px-4 py-2 font-semibold text-orange-500 transition hover:bg-orange-500 hover:text-white"
                          >
                            Track Order
                          </Link>

                        ) : (

                          <Link to={`/tracking/${order.trackingId}`} className="mt-3 inline-block rounded-lg bg-orange-50 px-4 py-2 font-semibold text-orange-500 transition hover:bg-orange-500 hover:text-white">View order</Link>

                        )}

                      </div>

                    </div>

                  ))}

                </div>

              </div>

              {/* Logout */}

              <button onClick={() => logout()} className="flex w-full items-center justify-center gap-3 rounded-2xl border border-red-100 bg-white px-6 py-4 font-semibold text-red-500 transition hover:bg-red-500 hover:text-white">

                <LogOut size={20} />

                Logout

              </button>

            </section>

          </div>

        </section>

      </main>

    </>

  );

}
