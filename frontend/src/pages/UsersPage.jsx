import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { createStaff, getUsers } from "../api/users/users";

const roleOptions = [
  { value: "cashier", label: "Cashier" },
  { value: "manager", label: "Manager" },
];

const UsersPage = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    role: "cashier",
  });

  const isAdmin = user?.role === "admin" || user?.role === "owner";

  const loadUsers = async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("Only admin or owner can create staff users.");
      return;
    }
    if (!form.name || !form.username || !form.password) {
      toast.error("Name, username, and password are required.");
      return;
    }
    try {
      setSaving(true);
      const created = await createStaff(form);
      setUsers((prev) => [created, ...prev]);
      setForm((prev) => ({ ...prev, password: "", username: "", name: "" }));
      toast.success("Staff user created");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Toaster position="top-right" />

      <div className="flex flex-col md:flex-row justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">User Management</h2>
          <p className="text-xs text-gray-500">
            Create cashier or manager accounts within your shop tenant.
          </p>
        </div>
        <div className="text-[11px] text-right">
          <p>
            Logged in as <span className="font-semibold">{user?.name}</span>
          </p>
          <p className="capitalize">Role: {user?.role}</p>
          {!isAdmin && (
            <p className="text-red-500 mt-1">
              Only admin or owner can manage users.
            </p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-4">
        <div className="card">
          <h3 className="text-sm font-semibold mb-3">Create Staff User</h3>
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block mb-1 font-medium">Full name</label>
              <input
                name="name"
                className="w-full border rounded-xl px-3 py-2"
                value={form.name}
                onChange={handleChange}
                disabled={!isAdmin || saving}
                placeholder="Kasun Perera"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Username</label>
              <input
                name="username"
                className="w-full border rounded-xl px-3 py-2"
                value={form.username}
                onChange={handleChange}
                disabled={!isAdmin || saving}
                placeholder="kasun"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Password</label>
              <input
                name="password"
                type="password"
                className="w-full border rounded-xl px-3 py-2"
                value={form.password}
                onChange={handleChange}
                disabled={!isAdmin || saving}
                placeholder="********"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Role</label>
              <select
                name="role"
                className="w-full border rounded-xl px-3 py-2 bg-white"
                value={form.role}
                onChange={handleChange}
                disabled={!isAdmin || saving}
              >
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="pt-2 border-t">
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={!isAdmin || saving}
              >
                {saving ? "Creating..." : "Create user"}
              </button>
            </div>
          </form>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Staff List</h3>
            <button
              className="text-xs text-primary border border-primary/20 px-3 py-1.5 rounded-lg"
              onClick={loadUsers}
              disabled={!isAdmin || loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-gray-500">
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Username</th>
                  <th className="text-left py-2">Role</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b last:border-b-0">
                    <td className="py-2">{u.name}</td>
                    <td className="py-2">{u.username}</td>
                    <td className="py-2 capitalize">{u.role}</td>
                    <td className="py-2">
                      {u.isActive ? "Active" : "Inactive"}
                    </td>
                    <td className="py-2">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
