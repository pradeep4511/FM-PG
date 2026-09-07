import { LogOut } from "lucide-react";

export default function TopBar({
  user,
  role,
  onHome,
  onLogout,
}) {
  return (
    <nav className="topbar">

      <button
        className="logo"
        onClick={onHome}
      >
        <span className="logo-fm">FM</span>
        <span className="logo-pg">PG</span>
      </button>

      {user ? (
        <div className="nav-user">

          <span>
            {role === "owner"
              ? "Listing as "
              : "Hi, "}
            {user.name}
          </span>

          <button
            className="logout-btn"
            onClick={onLogout}
          >
            <LogOut size={16} />
            Logout
          </button>

        </div>
      ) }

    </nav>
  );
}