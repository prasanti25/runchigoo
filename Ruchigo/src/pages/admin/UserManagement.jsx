import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import AdminSidebar from "../../components/AdminSidebar.jsx";
import { apiRequest } from "../../lib/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

import {
  Users,
  Search,
  Filter,
  UserPlus,
  Download,
} from "lucide-react";

export default function UserManagement() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All Roles");
  const [search, setSearch] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "customer",
  });
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState("");
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editedUser, setEditedUser] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    role: "customer",
    is_active: true,
  });
  const [editingUser, setEditingUser] = useState(false);
  const [editUserError, setEditUserError] = useState("");

  const visibleUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole =
        filter === "All Roles" || user.role === filter;
      const matchesSearch =
        search.trim() === "" ||
        [user.name, user.email, user.id].some((value) =>
          value?.toLowerCase().includes(search.trim().toLowerCase())
        );
      return matchesRole && matchesSearch;
    });
  }, [users, filter, search]);

  const capitalize = (value) =>
    value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const data = await apiRequest("/users/", { token });
        setUsers(
          data.results?.map((user) => ({
            id: `USR${String(user.id).padStart(3, "0")}`,
            name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email,
            email: user.email,
            role: capitalize(user.role),
            status: user.is_active
              ? "Active"
              : user.role === "customer"
              ? "Blocked"
              : "Pending Approval",
            joined: new Date(user.created_at).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            raw: user,
          })) || []
        );
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) loadUsers();
  }, [token]);

  const createUser = async () => {
    setCreateUserError("");
    if (!newUser.email || !newUser.password) {
      const message = "Please enter email and password.";
      setCreateUserError(message);
      toast.error(message);
      return;
    }
    if (newUser.password.length < 8) {
      const message = "Password must be at least 8 characters.";
      setCreateUserError(message);
      toast.error(message);
      return;
    }

    setCreatingUser(true);
    try {
      const created = await apiRequest("/users/", {
        token,
        method: "POST",
        body: {
          email: newUser.email.trim(),
          password: newUser.password,
          first_name: newUser.first_name.trim(),
          last_name: newUser.last_name.trim(),
          phone: newUser.phone.trim(),
          role: newUser.role,
          is_active: true,
        },
      });

      const mappedUser = {
        id: `USR${String(created.id).padStart(3, "0")}`,
        name: `${created.first_name || ""} ${created.last_name || ""}`.trim() || created.email,
        email: created.email,
        role: capitalize(created.role),
        status: created.is_active
          ? "Active"
          : created.role === "customer"
          ? "Blocked"
          : "Pending Approval",
        joined: new Date(created.created_at).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        raw: created,
      };

      setUsers((current) => [mappedUser, ...current]);
      setShowAddUserModal(false);
      setNewUser({ email: "", password: "", first_name: "", last_name: "", phone: "", role: "customer" });
      setCreateUserError("");
      toast.success("New user created successfully.");
    } catch (error) {
      const message = error.message || "Unable to create user.";
      setCreateUserError(message);
      toast.error(message);
    } finally {
      setCreatingUser(false);
    }
  };

  const openViewUser = (user) => {
    setSelectedUser(user);
    setShowViewUserModal(true);
  };

  const openEditUser = (user) => {
    setSelectedUser(user);
    setEditUserError("");
    setEditedUser({
      first_name: user.raw.first_name || "",
      last_name: user.raw.last_name || "",
      phone: user.raw.phone || "",
      role: user.raw.role || "customer",
      is_active: user.raw.is_active,
    });
    setShowEditUserModal(true);
  };

  const updateUser = async () => {
    if (!editedUser.first_name && !editedUser.last_name && !editedUser.phone) {
      const message = "Provide at least one field to update.";
      setEditUserError(message);
      toast.error(message);
      return;
    }

    setEditUserError("");
    setEditingUser(true);

    try {
      const updated = await apiRequest(`/users/${selectedUser.raw.id}/`, {
        token,
        method: "PATCH",
        body: {
          first_name: editedUser.first_name.trim(),
          last_name: editedUser.last_name.trim(),
          phone: editedUser.phone.trim(),
          role: editedUser.role,
          is_active: editedUser.is_active,
        },
      });

      setUsers((current) =>
        current.map((user) =>
          user.raw.id === selectedUser.raw.id
            ? {
                ...user,
                name: `${updated.first_name || ""} ${updated.last_name || ""}`.trim() || updated.email,
                email: updated.email,
                role: capitalize(updated.role),
                status: updated.is_active
                  ? "Active"
                  : updated.role === "customer"
                  ? "Blocked"
                  : "Pending Approval",
                raw: updated,
              }
            : user
        )
      );

      setShowEditUserModal(false);
      setSelectedUser(null);
      toast.success("User updated successfully.");
    } catch (error) {
      const message = error.message || "Unable to update user.";
      setEditUserError(message);
      toast.error(message);
    } finally {
      setEditingUser(false);
    }
  };

  const approveUser = async (userId, rawUser) => {
    try {
      await apiRequest(`/users/${rawUser.id}/approve/`, { token, method: "POST" });
      setUsers((current) =>
        current.map((user) =>
          user.raw.id === rawUser.id
            ? { ...user, status: "Active", raw: { ...user.raw, is_active: true } }
            : user
        )
      );
      toast.success(`${rawUser.email} has been approved.`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const blockUser = async (rawUser) => {
    try {
      await apiRequest(`/users/${rawUser.id}/block/`, { token, method: "POST" });
      setUsers((current) =>
        current.map((user) =>
          user.raw.id === rawUser.id
            ? { ...user, status: "Blocked", raw: { ...user.raw, is_active: false } }
            : user
        )
      );
      toast.success(`${rawUser.email} has been blocked.`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const unblockUser = async (rawUser) => {
    try {
      await apiRequest(`/users/${rawUser.id}/unblock/`, { token, method: "POST" });
      setUsers((current) =>
        current.map((user) =>
          user.raw.id === rawUser.id
            ? { ...user, status: "Active", raw: { ...user.raw, is_active: true } }
            : user
        )
      );
      toast.success(`${rawUser.email} has been restored.`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const exportUsers = () => {
    if (!visibleUsers.length) {
      toast.error("No users to export.");
      return;
    }

    const csvRows = [
      ["User ID", "Name", "Email", "Role", "Status", "Joined"],
      ...visibleUsers.map((user) => [
        user.id,
        user.name,
        user.email,
        user.role,
        user.status,
        user.joined,
      ]),
    ];

    const csvContent = csvRows
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ruchigo-users-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("User export ready.");
  };

  const renderStatus = (user) => {
    if (user.status === "Active") return "Active";
    if (user.status === "Pending Approval") return "Pending Approval";
    if (user.status === "Blocked") return "Blocked";
    return user.status;
  };

  const renderStatusClasses = (status) => {
    if (status === "Active") return "bg-green-100 text-green-700";
    if (status === "Pending Approval") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="min-h-screen bg-[#fffaf7]">
      <AdminSidebar />

      <main className="min-h-screen lg:ml-72">
        <section className="mx-auto max-w-7xl px-6 py-10">

          {/* Header */}

          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="font-semibold text-orange-500">
                Administrator Panel
              </p>

              <h1 className="mt-2 text-4xl font-bold text-gray-900">
                User Management
              </h1>

              <p className="mt-3 text-gray-500">
                Manage customers, restaurants, delivery partners and administrators.
              </p>

            </div>

            <div className="flex gap-4">

              <button
                onClick={exportUsers}
                className="flex items-center gap-2 rounded-2xl border px-5 py-3 font-semibold hover:bg-gray-100"
              >

                <Download size={18} />

                Export

              </button>

              <button
                onClick={() => {
                  setCreateUserError("");
                  setShowAddUserModal(true);
                }}
                className="flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
              >

                <UserPlus size={18} />

                Add User

              </button>

            </div>

          </div>

          {/* Statistics */}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            {[
              {
                title: "Total Users",
                value: users.length.toLocaleString(),
                color: "text-orange-600",
              },
              {
                title: "Customers",
                value: users.filter((user) => user.role === "Customer").length.toLocaleString(),
                color: "text-blue-600",
              },
              {
                title: "Restaurants",
                value: users.filter((user) => user.role === "Restaurant").length.toLocaleString(),
                color: "text-green-600",
              },
              {
                title: "Delivery Partners",
                value: users.filter((user) => user.role === "Delivery").length.toLocaleString(),
                color: "text-purple-600",
              },
            ].map((item) => (

              <div
                key={item.title}
                className="rounded-3xl bg-white p-6 shadow-sm"
              >

                <Users className={item.color} size={30} />

                <h3 className="mt-5 text-gray-500">
                  {item.title}
                </h3>

                <p className={`mt-2 text-3xl font-bold ${item.color}`}>
                  {item.value}
                </p>

              </div>

            ))}

          </div>

          {/* Search & Filters */}

          <div className="mt-10 rounded-3xl bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-5 lg:flex-row">

              <div className="relative flex-1">

                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, email or ID..."
                  className="w-full rounded-2xl border py-3 pl-12 pr-4 outline-none focus:border-orange-500"
                />

              </div>

              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="rounded-2xl border px-5 py-3 outline-none focus:border-orange-500"
              >

                <option>All Roles</option>
                <option>Customer</option>
                <option>Restaurant</option>
                <option>Delivery</option>
                <option>Admin</option>

              </select>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("All Roles");
                }}
                className="flex items-center justify-center gap-2 rounded-2xl border px-6 py-3 hover:bg-gray-100"
              >

                <Filter size={18} />

                Reset filters

              </button>

            </div>

          </div>

          {/* Users Table */}
                    <div className="mt-10 overflow-hidden rounded-3xl bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="bg-orange-50">

                  <tr>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      User
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      User ID
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Role
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Joined
                    </th>

                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {!loading && visibleUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                        No users match the current filters.
                      </td>
                    </tr>
                  ) : (
                    visibleUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-t transition hover:bg-orange-50/40"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                user.name
                              )}&background=f97316&color=fff`}
                              alt={user.name}
                              className="h-12 w-12 rounded-full"
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {user.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 font-medium text-gray-700">
                          {user.id}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-4 py-2 text-sm font-semibold ${
                              user.role === "Customer"
                                ? "bg-blue-100 text-blue-700"
                                : user.role === "Restaurant"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-4 py-2 text-sm font-semibold ${renderStatusClasses(user.status)}`}
                          >
                            {renderStatus(user.status)}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-gray-600">
                          {user.joined}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-center gap-3">
                            <button
                              className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
                              onClick={() => openViewUser(user)}
                            >
                              View
                            </button>
                            <button
                              className="rounded-xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-600"
                              onClick={() => openEditUser(user)}
                            >
                              Edit
                            </button>
                            {user.status === "Pending Approval" ? (
                              <button
                                className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
                                onClick={() => approveUser(user.id, user.raw)}
                              >
                                Approve
                              </button>
                            ) : user.status === "Active" ? (
                              <button
                                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                                onClick={() => blockUser(user.raw)}
                              >
                                Block
                              </button>
                            ) : (
                              <button
                                className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
                                onClick={() => unblockUser(user.raw)}
                              >
                                Unblock
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

              </table>

            </div>

          </div>

        </section>

      {showAddUserModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add New User</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Create a new user account for the platform.
                </p>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="rounded-full border border-gray-200 px-3 py-2 text-gray-500 transition hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {createUserError ? (
                <div className="sm:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {createUserError}
                </div>
              ) : null}
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Email</span>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(event) => setNewUser((current) => ({ ...current, email: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Password</span>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(event) => setNewUser((current) => ({ ...current, password: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-gray-700">First Name</span>
                <input
                  type="text"
                  value={newUser.first_name}
                  onChange={(event) => setNewUser((current) => ({ ...current, first_name: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Last Name</span>
                <input
                  type="text"
                  value={newUser.last_name}
                  onChange={(event) => setNewUser((current) => ({ ...current, last_name: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-gray-700">Phone</span>
                <input
                  type="text"
                  value={newUser.phone}
                  onChange={(event) => setNewUser((current) => ({ ...current, phone: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-gray-700">Role</span>
                <select
                  value={newUser.role}
                  onChange={(event) => setNewUser((current) => ({ ...current, role: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
                >
                  <option value="customer">Customer</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="delivery">Delivery</option>
                  <option value="admin">Administrator</option>
                </select>
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="rounded-2xl border border-gray-200 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={createUser}
                disabled={creatingUser}
                className="rounded-2xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingUser ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showViewUserModal && selectedUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">View User</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Details for {selectedUser.name}.
                </p>
              </div>
              <button
                onClick={() => setShowViewUserModal(false)}
                className="rounded-full border border-gray-200 px-3 py-2 text-gray-500 transition hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-700">Name</p>
                <p className="mt-1 text-gray-900">{selectedUser.name}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-700">Email</p>
                <p className="mt-1 text-gray-900">{selectedUser.email}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-700">Phone</p>
                <p className="mt-1 text-gray-900">{selectedUser.raw.phone || "—"}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-700">Role</p>
                <p className="mt-1 text-gray-900">{selectedUser.role}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:col-span-2">
                <p className="text-sm font-semibold text-gray-700">Status</p>
                <p className="mt-1 text-gray-900">{selectedUser.status}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showEditUserModal && selectedUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Update details for {selectedUser.name}.
                </p>
              </div>
              <button
                onClick={() => setShowEditUserModal(false)}
                className="rounded-full border border-gray-200 px-3 py-2 text-gray-500 transition hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {editUserError ? (
                <div className="sm:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {editUserError}
                </div>
              ) : null}

              <label className="block">
                <span className="text-sm font-semibold text-gray-700">First Name</span>
                <input
                  type="text"
                  value={editedUser.first_name}
                  onChange={(event) => setEditedUser((current) => ({ ...current, first_name: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Last Name</span>
                <input
                  type="text"
                  value={editedUser.last_name}
                  onChange={(event) => setEditedUser((current) => ({ ...current, last_name: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-gray-700">Phone</span>
                <input
                  type="text"
                  value={editedUser.phone}
                  onChange={(event) => setEditedUser((current) => ({ ...current, phone: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-gray-700">Role</span>
                <select
                  value={editedUser.role}
                  onChange={(event) => setEditedUser((current) => ({ ...current, role: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
                >
                  <option value="customer">Customer</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="delivery">Delivery</option>
                  <option value="admin">Admin</option>
                </select>
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-gray-700">Status</span>
                <select
                  value={editedUser.is_active ? "active" : "blocked"}
                  onChange={(event) =>
                    setEditedUser((current) => ({
                      ...current,
                      is_active: event.target.value === "active",
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
                >
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowEditUserModal(false)}
                className="rounded-2xl border border-gray-200 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={updateUser}
                disabled={editingUser}
                className="rounded-2xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {editingUser ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  </div>
  );
}
