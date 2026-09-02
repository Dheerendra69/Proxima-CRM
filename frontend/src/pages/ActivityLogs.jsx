import { useEffect, useState } from "react";
import { getActivityLogs } from "../services/activity-log.service";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await getActivityLogs();
        setLogs(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load activity logs",
        );
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Activity Logs</h2>
          <p>Track system activity and user actions</p>
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="loading">Loading activity logs...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : logs.length === 0 ? (
          <div className="empty-state">No activity found</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Entity ID</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      {typeof log.user === "object"
                        ? log.user?.name || log.user?.email
                        : log.user || "-"}
                    </td>

                    <td>
                      <span className="status-badge">{log.action}</span>
                    </td>

                    <td>{log.entity}</td>

                    <td>{log.entityId || "-"}</td>

                    <td>
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleString("en-IN")
                        : "-"}
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
