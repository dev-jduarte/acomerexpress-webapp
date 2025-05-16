import { Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./Home";
import Orders from "./Orders";
import ClosedOrders from "./ClosedOrders";
import Products from "./Products";
import CloseDay from "./CloseDay";
import { Select, Modal, Input, Typography } from "antd";
import { message, App as AntdApp } from "antd";
import { useFirestoreCRUD } from "../hooks/useFirestoreCrud";
import moment from "moment";
import InventorySummary from "./InventorySummary";
import PendingOrders from "./PendingOrders";
import { useFingerprint } from "../hooks/useFingerprint";
import { allowedFingerprints } from "../utils/allowedFingerprints";

const { Title } = Typography;

function App() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const { createDocument: saveChangeTurn } = useFirestoreCRUD("changeTurn", false);
  const [messageApi, contextHolder] = message.useMessage();

  const fingerprint = useFingerprint();
  const [accessAllowed, setAccessAllowed] = useState(null);

  useEffect(() => {
    console.log("Fingerprint: ", fingerprint)
    // if (fingerprint) {
    //   const allowed = allowedFingerprints.includes(fingerprint);
    //   setAccessAllowed(allowed);
    //   if (!allowed) {
    //     messageApi.error("Este dispositivo no está autorizado.");
    //   }
    // }
  }, [fingerprint]);

  const userOptions = [
    { label: "Usuario 001", value: "USUARIO001" },
    { label: "Usuario 002", value: "USUARIO002" },
    { label: "CAJA", value: "CAJA" },
    { label: "APOYO 001", value: "APOYO001" },
    { label: "APOYO 002", value: "APOYO002" },
  ];

  const userPasswords = {
    USUARIO001: import.meta.env.VITE_USER001_PASSWORD,
    USUARIO002: import.meta.env.VITE_USER002_PASSWORD,
    CAJA: import.meta.env.VITE_CAJA_PASSWORD,
    APOYO001: import.meta.env.VITE_APOYO001_PASSWORD,
    APOYO002: import.meta.env.VITE_APOYO002_PASSWORD,
  };

  const handleUserSelect = (value) => {
    setPendingUser(value);
    setIsModalVisible(true);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("selectedUser");
    if (storedUser) {
      setSelectedUser(storedUser);
    }
  }, []);

  const handleModalOk = () => {
    if (passwordInput === userPasswords[pendingUser]) {
      setSelectedUser(pendingUser);
      messageApi.success(`Sesión iniciada como ${pendingUser}`);
      setIsModalVisible(false);
      setPasswordInput("");
      saveChangeTurn({ date: moment().format(), pendingUser });
      localStorage.setItem("selectedUser", pendingUser);
    } else {
      messageApi.error("Clave incorrecta");
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setPasswordInput("");
  };

  // if (accessAllowed === false) {
  //   return (
  //     <div style={{ padding: 32, textAlign: "center" }}>
  //       <Title level={4}>Acceso denegado</Title>
  //       <p>Este dispositivo no está autorizado para usar esta aplicación.</p>
  //     </div>
  //   );
  // }

  // if (accessAllowed === null) {
  //   return <div>Cargando...</div>; // mientras se obtiene el fingerprint
  // }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      {contextHolder}
      <div
        style={{
          background: "white",
          padding: 32,
          borderRadius: 12,
          width: "100%",
          maxWidth: selectedUser == "CAJA" ? 1000 : 700,
        }}
      >
        <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
          A Comer Express
        </Title>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Cajero:</label>
          <Select style={{ width: "100%" }} placeholder="Selecciona un usuario" options={userOptions} onSelect={handleUserSelect} value={selectedUser} />
        </div>

        {true && (
          <>
            <nav
              style={{
                display: "flex",
                gap: 16,
                marginBottom: 32,
                borderBottom: "1px solid #e8e8e8",
                paddingBottom: 8,
              }}
            >
              <Link style={linkStyle} to="/">
                Inicio
              </Link>
              <Link style={linkStyle} to="/ordenes">
                Órdenes abiertas
              </Link>
              <Link style={linkStyle} to="/ordenesCerradas">
                Órdenes cerradas
              </Link>
              {selectedUser && selectedUser == "CAJA" && (
                <Link style={linkStyle} to="/ordenesPendientes">
                  Órdenes Pendientes
                </Link>
              )}
              {selectedUser && selectedUser == "CAJA" && (
                <Link style={linkStyle} to="/productos">
                  Productos
                </Link>
              )}
              {selectedUser && selectedUser == "CAJA" && (
                <Link style={linkStyle} to="/cierreCaja">
                  Cierre caja
                </Link>
              )}
              {selectedUser && selectedUser == "CAJA" && (
                <Link style={linkStyle} to="/resumenInventario">
                  Inventario
                </Link>
              )}
            </nav>

            <Routes>
              <Route path="/" element={<Home user={selectedUser} />} />
              <Route path="/ordenes" element={<Orders user={selectedUser} />} />
              <Route path="/ordenesCerradas" element={<ClosedOrders user={selectedUser} />} />
              <Route path="/ordenesPendientes" element={<PendingOrders user={selectedUser} />} />
              {selectedUser && selectedUser == "CAJA" && <Route path="/productos" element={<Products user={selectedUser} />} />}
              {selectedUser && selectedUser == "CAJA" && <Route path="/cierreCaja" element={<CloseDay user={selectedUser} />} />}
              {selectedUser && selectedUser == "CAJA" && <Route path="/resumenInventario" element={<InventorySummary user={selectedUser} />} />}
            </Routes>
          </>
        )}

        <Modal title="Introduce la clave" open={isModalVisible} onOk={handleModalOk} onCancel={handleModalCancel} okText="Aceptar" cancelText="Cancelar">
          <Input.Password placeholder="Clave" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
        </Modal>
      </div>
    </div>
  );
}

const linkStyle = {
  textDecoration: "none",
  color: "#1890ff",
  fontWeight: 500,
  padding: "4px 8px",
  borderRadius: 4,
  transition: "background-color 0.3s",
};

export default App;
