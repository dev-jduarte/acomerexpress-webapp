import { Routes, Route, Link } from "react-router-dom";
import { useState } from "react";
import Home from "./Home";
import Orders from "./Orders";
import ClosedOrders from "./ClosedOrders";
import Products from "./Products"
import { Select, Modal, Input, message, Typography } from "antd";
import { useFirestoreCRUD } from "./hooks/useFirestoreCrud";
import moment from "moment";

const { Title } = Typography;

function App() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const { createDocument: saveChangeTurn } = useFirestoreCRUD("changeTurn", false);

  const userOptions = [
    { label: "Usuario 001", value: "USUARIO001" },
    { label: "Usuario 002", value: "USUARIO002" },
  ];

  const userPasswords = "123456";

  const handleUserSelect = (value) => {
    setPendingUser(value);
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    if (passwordInput === userPasswords) {
      setSelectedUser(pendingUser);
      message.success(`Sesión iniciada como ${pendingUser}`);
      setIsModalVisible(false);
      setPasswordInput("");
      saveChangeTurn({ date: moment().format(), pendingUser });
    } else {
      message.error("Clave incorrecta");
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setPasswordInput("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          background: "white",
          padding: 32,
          borderRadius: 12,
          width: "100%",
          maxWidth: 700,
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
              <Link style={linkStyle} to="/ordenes-cerradas">
                Órdenes cerradas
              </Link>
              <Link style={linkStyle} to="/productos">
                Productos
              </Link>
            </nav>

            <Routes>
              <Route path="/" element={<Home user={selectedUser} />} />
              <Route path="/ordenes" element={<Orders user={selectedUser} />} />
              <Route path="/ordenes-cerradas" element={<ClosedOrders />} />
              <Route path="/productos" element={<Products />} />
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
