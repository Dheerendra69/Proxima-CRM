import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";

import {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
} from "../services/leads.service";
import { useAuth } from "../context/AuthContext";

export default function Leads() {
  const { isAdmin } = useAuth();
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getLeads({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        status: status || undefined,
      });

      setLeads(data.data);
      setPagination((prev) => ({
        ...prev,
        total: data.total,
        totalPages: data.totalPages,
      }));
    } catch {
      setError("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [pagination.page, search, status]);

  const openCreateModal = () => {
    setEditingLead(null);
    setModalOpen(true);
  };

  const openEditModal = (lead) => {
    setEditingLead(lead);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lead?",
    );

    if (!confirmed) return;

    try {
      await deleteLead(id);
      loadLeads();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete lead");
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingLead) {
        await updateLead(editingLead._id, formData);
      } else {
        await createLead(formData);
      }

      setModalOpen(false);
      loadLeads();
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to save lead");
    }
  };

  const changePage = (page) => {
    if (page < 1 || page > pagination.totalPages) {
      return;
    }

    setPagination((prev) => ({
      ...prev,
      page,
    }));
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Leads</h2>
          <p>Manage and track your leads</p>
        </div>

        <button className="primary-button" onClick={openCreateModal}>
          <Plus size={18} />
          Add Lead
        </button>
      </div>

      <div className="filters-card">
        <div className="search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);

              setPagination((prev) => ({
                ...prev,
                page: 1,
              }));
            }}
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);

            setPagination((prev) => ({
              ...prev,
              page: 1,
            }));
          }}
        >
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Lost">Lost</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-card">
        {loading ? (
          <div className="loading">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="empty-state">No leads found</div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead._id}>
                      <td>{lead.name}</td>
                      <td>{lead.email}</td>
                      <td>{lead.company || "-"}</td>
                      <td>{lead.source || "-"}</td>

                      <td>
                        <span
                          className={`status-badge status-${lead.status?.toLowerCase()}`}
                        >
                          {lead.status}
                        </span>
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => openEditModal(lead)}
                            title="Edit"
                          >
                            <Pencil size={17} />
                          </button>

                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(lead._id)}
                              title="Delete"
                            >
                              <Trash2 size={17} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <span>
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>

              <div>
                <button
                  disabled={pagination.page === 1}
                  onClick={() => changePage(pagination.page - 1)}
                >
                  Previous
                </button>

                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => changePage(pagination.page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <LeadModal
          lead={editingLead}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function LeadModal({ lead, onClose, onSave }) {
  const [form, setForm] = useState({
    name: lead?.name || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    company: lead?.company || "",
    source: lead?.source || "",
    status: lead?.status || "New",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await onSave(form);
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{lead ? "Edit Lead" : "Create Lead"}</h3>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Company</label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Source</label>
              <input
                name="source"
                value={form.source}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Status</label>

              <select name="status" value={form.status} onChange={handleChange}>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? "Saving..." : "Save Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
