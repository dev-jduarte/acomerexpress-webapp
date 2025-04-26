import React, { useState, useMemo } from "react";
import { Button, Modal, Form, Input, InputNumber, Select, List, Avatar, Space, Row, Col } from "antd";
import { useFirestoreCRUD } from "../hooks/useFirestoreCrud";
import {
  LocalDrink as LocalDrinkIcon,
  SportsBar as SportsBarIcon,
  LunchDining as LunchDiningIcon,
  BreakfastDining as BreakfastDiningIcon,
  Fastfood as FastfoodIcon,
  ChildCare as ChildCareIcon,
  Restaurant as RestaurantIcon,
  Cake as CakeIcon,
} from "@mui/icons-material";
import { categories } from "../utils/categories";
import { message, App as AntdApp } from "antd";
import { categoryIcons } from "../utils/categoryIcons";

const PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

const Products = () => {
  const { data: products, createDocument, updateDocument, deleteDocument, refetch } = useFirestoreCRUD("products");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [passwordModal, setPasswordModal] = useState({ visible: false, onConfirm: null });
  const [authPassword, setAuthPassword] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  const filteredProducts = useMemo(() => {
    return products?.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) && (categoryFilter ? p.category === categoryFilter : true)) || [];
  }, [products, search, categoryFilter]);

  const showModal = (product = null) => {
    setEditingProduct(product);
    form.setFieldsValue(product || { name: "", price: 0, category: "" });
    setIsModalOpen(true);
  };

  const showPasswordModal = (onConfirm) => {
    setAuthPassword("");
    setPasswordModal({ visible: true, onConfirm });
  };

  const handlePasswordConfirm = () => {
    if (authPassword === PASSWORD) {
      passwordModal.onConfirm();
      setPasswordModal({ visible: false, onConfirm: null });
    } else {
      messageApi.error("Clave incorrecta");
    }
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    showPasswordModal(async () => {
      try {
        if (editingProduct) {
          await updateDocument(editingProduct.id, values);
          messageApi.success("Producto actualizado");
        } else {
          await createDocument(values);
          messageApi.success("Producto creado");
        }
        refetch();
        setIsModalOpen(false);
      } catch (err) {
        console.error(err);
        messageApi.error("Error al guardar el producto");
      }
    });
  };

  const handleDelete = (product) => {
    showPasswordModal(async () => {
      try {
        await deleteDocument(product.id);
        refetch();
        messageApi.success("Producto eliminado");
      } catch (err) {
        console.error(err);
        messageApi.error("Error al eliminar producto");
      }
    });
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      {contextHolder}
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <Button type="primary" onClick={() => showModal()}>
          Agregar producto
        </Button>

        <Space style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <Row>
            <Col style={{ paddingTop: 8 }} sm={24} md={12}>
              <Input.Search placeholder="Buscar por nombre" onChange={(e) => setSearch(e.target.value)} style={{ width: "89%" }} allowClear />
            </Col>
            <Col style={{ paddingTop: 8 }} sm={24} md={12}>
              <Select allowClear style={{ width: 200 }} placeholder="Filtrar por categoría" onChange={(value) => setCategoryFilter(value)} value={categoryFilter || undefined}>
                {categories.map((cat) => (
                  <Select.Option key={cat} value={cat}>
                    <Space>
                      {categoryIcons[cat]} {cat}
                    </Space>
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Space>

        <List
          itemLayout="horizontal"
          dataSource={filteredProducts}
          bordered
          locale={{ emptyText: "No se encontraron productos" }}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="link" onClick={() => showModal(item)}>
                  Editar
                </Button>,
                <Button danger type="link" onClick={() => handleDelete(item)}>
                  Eliminar
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    style={{
                      backgroundColor: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#1677ff",
                    }}
                  >
                    {categoryIcons[item.category] || <BreakfastDiningIcon style={{ fontSize: 24, marginTop: 5 }} />}
                  </Avatar>
                }
                title={item.name}
                description={`Precio: $${item.price} | Categoría: ${item.category}`}
              />
            </List.Item>
          )}
        />
      </Space>

      {/* Modal para agregar/editar */}
      <Modal
        title={editingProduct ? "Editar producto" : "Nuevo producto"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nombre" rules={[{ required: true, message: "Nombre requerido" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Precio ($)" rules={[{ required: true, type: "number", min: 0 }]}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="category" label="Categoría" rules={[{ required: true }]}>
            <Select placeholder="Selecciona una categoría">
              {categories.map((cat) => (
                <Select.Option key={cat} value={cat}>
                  <Space>
                    {categoryIcons[cat]} {cat}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de autenticación */}
      <Modal
        open={passwordModal.visible}
        onOk={handlePasswordConfirm}
        onCancel={() => setPasswordModal({ visible: false, onConfirm: null })}
        okText="Confirmar"
        cancelText="Cancelar"
        title="Autenticación requerida"
      >
        <Input.Password placeholder="Introduce la clave" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} onPressEnter={handlePasswordConfirm} />
      </Modal>
    </div>
  );
};

export default Products;
