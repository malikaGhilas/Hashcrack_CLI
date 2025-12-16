import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const nav = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    nav("/");
  };

  return (
    <nav style={{ padding: 15, background: "#222", color: "#fff" }}>
      <Link to="/dashboard" style={{ color: "#fff", marginRight: 20 }}>
        Dashboard
      </Link>

      <button onClick={logout} style={{ float: "right" }}>
        Logout
      </button>
    </nav>
  );
}
