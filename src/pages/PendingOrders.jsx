import { useEffect, useState } from "react";
import { Table, Typography, Tag, Card, Button, Modal, message, Input, Divider } from "antd";
import { useFirestoreCRUD } from "../hooks/useFirestoreCrud";
import moment from "moment";
import _ from "lodash"

const { Title } = Typography;
const { Search } = Input;

const PendingOrders = () => {
  const {
    data: pendingOrders,
    loading,
    refetch,
    updateDocument,
  } = useFirestoreCRUD("orders", false); // desactivamos fetch inicial

  const { data: clients } = useFirestoreCRUD("clients");

  const [confirmLoading, setConfirmLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    refetch({ status: "pending" });
  }, []);

  const getClientDni = (record) => {
    const client = clients.find(c => c.name?.toLowerCase() === record.name?.toLowerCase());
    return client?.dni;
  };

  const showCloseModal = (orderId) => {
    setSelectedOrderId(orderId);
    setIsModalVisible(true);
  };

  const handleConfirmClose = async () => {
    if (!selectedOrderId) return;
    try {
      setConfirmLoading(true);
      await updateDocument(selectedOrderId, { status: "closed" });
      message.success("Orden cerrada exitosamente");
      setIsModalVisible(false);
      refetch({ status: "pending" });
    } catch (err) {
      message.error("Error al cerrar la orden");
    } finally {
      setConfirmLoading(false);
      setSelectedOrderId(null);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedOrderId(null);
  };

  const columns = [
    {
      title: "Fecha",
      dataIndex: "date",
      key: "date",
      render: (createdAt) => moment(createdAt).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Cliente",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "CI",
      dataIndex: "dni",
      key: "dni",
      render: (value, record) => <div>{value || getClientDni(record) || "N/A"}</div>,
    },
    {
      title: "Teléfono",
      dataIndex: "phone",
      key: "phone",
      render: (val) => <div>{val || "N/A"}</div>,
    },
    {
      title: "Productos",
      dataIndex: "products",
      key: "products",
      render: (products) =>
        products.map((p, index) => (
          <Tag key={index}>
            {p.name} × {p.qty}
          </Tag>
        )),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total) => `$${total.toFixed(2)}`,
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Button danger onClick={() => showCloseModal(record.id)}>
          Cerrar orden
        </Button>
      ),
    },
  ];

  // Agrupar órdenes por día
  const groupedByDay = _.fromPairs(
  _.orderBy(
    Object.entries(
      pendingOrders
        .filter((order) =>
          order.name?.toLowerCase().includes(searchText.toLowerCase())
        )
        .reduce((acc, order) => {
          const day = moment(order.date).format("YYYY-MM-DD");
          if (!acc[day]) acc[day] = [];
          acc[day].push({ ...order, key: order.id });
          return acc;
        }, {})
    ),
    // Ordenar por fecha (clave del objeto)
    ([day]) => day,
    "desc"
  )
);

  return (
    <Card>
      <Title level={3}>Órdenes Pendientes</Title>

      <Search
        placeholder="Buscar por nombre de cliente"
        onChange={(e) => setSearchText(e.target.value)}
        value={searchText}
        style={{ marginBottom: 20, maxWidth: 300 }}
        allowClear
      />

      {Object.keys(groupedByDay).length === 0 ? (
        <p>No se encontraron órdenes pendientes.</p>
      ) : (
        Object.entries(groupedByDay).map(([day, orders]) => (
          <div key={day}>
            <Divider orientation="left">
              <Title level={4}>{moment(day).format("DD/MM/YYYY")}</Title>
            </Divider>
            <Table
              loading={loading}
              dataSource={orders}
              columns={columns}
              pagination={false}
            />
          </div>
        ))
      )}

      <Modal
        open={isModalVisible}
        title="¿Cerrar esta orden?"
        onOk={handleConfirmClose}
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
        okText="Sí, cerrar"
        cancelText="Cancelar"
        okButtonProps={{ danger: true }}
      >
        <p>Una vez cerrada, no podrá ser modificada.</p>
      </Modal>
    </Card>
  );
};

export default PendingOrders;
