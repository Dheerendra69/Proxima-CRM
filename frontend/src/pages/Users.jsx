import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { getUsers, deleteUser, updateUser } from "../services/users.service";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const loadUsers = async () => {
    try {
      setLoading(true);

      const data = await getUsers();

      setUsers(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (id, role) => {
    const confirmed = window.confirm(
      `Are you sure you want to change this user's role to ${role}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await updateUser(id, { role });
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update role");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) {
      return;
    }

    try {
      await deleteUser(id);
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Users</h2>
          <p>Manage CRM users and roles</p>
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : users.length === 0 ? (
          <div className="empty-state">No users found</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>

                    <td>{user.email}</td>

                    <td>
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user._id, e.target.value)
                        }
                      >
                        <option value="Admin">Admin</option>

                        <option value="Agent">Agent</option>
                      </select>
                    </td>

                    <td>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-IN")
                        : "-"}
                    </td>

                    <td>
                      <button
                        className="delete-icon-button"
                        onClick={() => handleDelete(user._id)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
