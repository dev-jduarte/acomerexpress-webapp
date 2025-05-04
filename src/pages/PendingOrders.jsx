import { useEffect, useState } from "react";
import { Table, Typography, Tag, Card, Button, Modal, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useFirestoreCRUD } from "../hooks/useFirestoreCrud";
import moment from "moment";

const { Title } = Typography;

const PendingOrders = () => {
  const {
    data: pendingOrders,
    loading,
    refetch,
    updateDocument,
  } = useFirestoreCRUD("orders", false); // desactivamos fetch inicial

  const {data: clients} = useFirestoreCRUD("clients");

  const [confirmLoading, setConfirmLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    refetch({ status: "pending" });
  }, []);

  const getClientDni = (record) => {
    const client = clients.find(c => c.name?.toLowerCase() == record.name?.toLowerCase())
    return client?.dni
  }

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
      render: (value, record) => <div>{value || getClientDni(record)}</div>
    },
    {
      title: "Teléfono",
      dataIndex: "phone",
      key: "phone",
      render: (val) => <div>{val || "N/A"}</div>
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

  return (
    <Card>
      <Title level={3}>Órdenes Pendientes</Title>
      <Table
        loading={loading}
        dataSource={pendingOrders.map((order) => ({ ...order, key: order.id }))}
        columns={columns}
        pagination={{ pageSize: 5 }}
      />

      <Modal
        visible={isModalVisible}
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
