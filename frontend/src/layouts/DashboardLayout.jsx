import {
  LayoutDashboard,
  Users,
  Handshake,
  Activity,
  UserCog,
  LogOut,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout() {
  const { logout, user, isAdmin } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = [
    {
      label: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Leads",
      path: "/leads",
      icon: Users,
    },
    {
      label: "Deals",
      path: "/deals",
      icon: Handshake,
    },
    ...(isAdmin
      ? [
          {
            label: "Activity Logs",
            path: "/activity",
            icon: Activity,
          },
          {
            label: "Users",
            path: "/users",
            icon: UserCog,
          },
        ]
      : []),
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>Proxima</h2>
          <span>CRM</span>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <Icon size={19} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>CRM Dashboard</h1>
          </div>

          <div className="user-info">
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>
        </header>

        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
