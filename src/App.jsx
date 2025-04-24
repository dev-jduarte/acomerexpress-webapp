// src/App.jsx
import { Routes, Route, Link } from "react-router-dom";
import Home from "./Home";
import Orders from "./Orders";

function App() {
  return (
    <div style={{ padding: 16, maxWidth: 600, margin: "0 auto" }}>
      <nav style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <Link to="/">Inicio</Link>
        <Link to="/ordenes">Órdenes</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ordenes" element={<Orders />} />
      </Routes>
    </div>
  );
}

export default App;
