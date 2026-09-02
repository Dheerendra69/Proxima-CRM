import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";

import {
  getDeals,
  createDeal,
  updateDeal,
  deleteDeal,
} from "../services/deals.service";

import { getLeads } from "../services/leads.service";

import { useAuth } from "../context/AuthContext";

const stages = ["New", "In Progress", "Won", "Lost"];

export default function Deals() {
  const { user } = useAuth();

  const isAdmin = user?.role === "Admin";

  const [deals, setDeals] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);

  const loadDeals = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDeals({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        stage: stage || undefined,
      });

      setDeals(data.data);

      setPagination((prev) => ({
        ...prev,
        total: data.total,
        totalPages: data.totalPages,
      }));
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, [pagination.page, search, stage]);

  const openCreateModal = () => {
    setEditingDeal(null);
    setModalOpen(true);
  };

  const openEditModal = (deal) => {
    setEditingDeal(deal);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this deal?")) return;

    try {
      await deleteDeal(id);
      loadDeals();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete deal");
    }
  };

  const handleSave = async (data) => {
    try {
      if (editingDeal) {
        await updateDeal(editingDeal._id, data);
      } else {
        await createDeal(data);
      }

      setModalOpen(false);
      loadDeals();
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to save deal");
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
          <h2>Deals</h2>
          <p>Manage your sales pipeline</p>
        </div>

        <button className="primary-button" onClick={openCreateModal}>
          <Plus size={18} />
          Add Deal
        </button>
      </div>

      <div className="filters-card">
        <div className="search-box">
          <Search size={18} />

          <input
            placeholder="Search deals..."
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
          value={stage}
          onChange={(e) => {
            setStage(e.target.value);

            setPagination((prev) => ({
              ...prev,
              page: 1,
            }));
          }}
        >
          <option value="">All Stages</option>

          {stages.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-card">
        {loading ? (
          <div className="loading">Loading deals...</div>
        ) : deals.length === 0 ? (
          <div className="empty-state">No deals found</div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Deal</th>
                    <th>Value</th>
                    <th>Stage</th>
                    <th>Expected Close</th>
                    <th>Lead</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {deals.map((deal) => (
                    <tr key={deal._id}>
                      <td>
                        <strong>{deal.title}</strong>
                      </td>

                      <td>{formatCurrency(deal.value)}</td>

                      <td>
                        <span
                          className={`status-badge stage-${deal.stage
                            ?.toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {deal.stage}
                        </span>
                      </td>

                      <td>
                        {deal.expectedCloseDate
                          ? new Date(deal.expectedCloseDate).toLocaleDateString(
                              "en-IN",
                            )
                          : "-"}
                      </td>

                      <td>
                        {typeof deal.lead === "object"
                          ? deal.lead?.name
                          : deal.lead || "-"}
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button onClick={() => openEditModal(deal)}>
                            <Pencil size={17} />
                          </button>

                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(deal._id)}
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
        <DealModal
          deal={editingDeal}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function DealModal({ deal, onClose, onSave }) {
  const [form, setForm] = useState({
    title: deal?.title || "",
    value: deal?.value || "",
    stage: deal?.stage || "New",
    expectedCloseDate: deal?.expectedCloseDate
      ? deal.expectedCloseDate.split("T")[0]
      : "",
    // lead: deal?.lead?._id || deal?.lead || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [leadsList, setLeadsList] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(true);

  useEffect(() => {
    async function fetchLeads() {
      try {
        setLoadingLeads(true);
        const response = await getLeads({ limit: 100 });
        setLeadsList(response?.data || []);
      } catch (err) {
        console.error("Failed to load leads list:", err);
      } finally {
        setLoadingLeads(false);
      }
    }

    fetchLeads();
  }, []);

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

      await onSave({
        ...form,
        value: Number(form.value),
        lead: form.lead || undefined,
      });
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
          <h3>{deal ? "Edit Deal" : "Create Deal"}</h3>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Deal Title</label>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Value</label>

              <input
                type="number"
                min="0"
                name="value"
                value={form.value}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Stage</label>

              <select name="stage" value={form.stage} onChange={handleChange}>
                {stages.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Expected Close Date</label>

              <input
                type="date"
                name="expectedCloseDate"
                value={form.expectedCloseDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Associated Lead</label>
              <select
                name="lead"
                value={form.lead}
                onChange={handleChange}
                disabled={loadingLeads}
                required
              >
                <option value="">
                  {loadingLeads ? "Loading leads..." : "Select a Lead"}
                </option>
                {leadsList.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name} {item.company ? `(${item.company})` : ""}
                  </option>
                ))}
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
              {saving ? "Saving..." : "Save Deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}
