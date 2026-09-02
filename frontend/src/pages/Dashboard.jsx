import { useEffect, useState } from "react";
import { DollarSign, Trophy, Percent, BriefcaseBusiness } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getDashboardStats } from "../services/dashboard.service";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const stageData =
    stats?.dealsByStage?.map((item) => ({
      stage: item._id,
      count: item.count,
      value: item.value,
    })) || [];

  return (
    <div className="dashboard">
      <div className="page-heading">
        <div>
          <h2>Dashboard</h2>
          <p>Overview of your sales pipeline</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Pipeline"
          value={formatCurrency(stats.totalPipeline)}
          icon={<DollarSign size={22} />}
        />

        <StatCard
          title="Won Deals"
          value={formatCurrency(stats.wonDealsValue)}
          icon={<Trophy size={22} />}
        />

        <StatCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          icon={<Percent size={22} />}
        />

        <StatCard
          title="Total Deals"
          value={getTotalDeals(stageData)}
          icon={<BriefcaseBusiness size={22} />}
        />
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h3>Deals by Stage</h3>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stageData}>
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h3>Pipeline Value by Stage</h3>
        </div>

        <div className="stage-list">
          {stageData.map((stage) => (
            <div className="stage-row" key={stage.stage}>
              <span>{stage.stage}</span>
              <strong>{formatCurrency(stage.value)}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>

      <div>
        <p>{title}</p>
        <h3>{value}</h3>
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

function getTotalDeals(stageData) {
  return stageData.reduce((total, stage) => total + stage.count, 0);
}
