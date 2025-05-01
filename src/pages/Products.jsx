import React, { useState, useMemo } from "react";
import { Button, Modal, Form, Input, InputNumber, Select, List, Checkbox, Space, Row, Col, Collapse, Tag } from "antd";
import { useFirestoreCRUD } from "../hooks/useFirestoreCrud";
import { categories } from "../utils/categories";
import { message, App as AntdApp } from "antd";
import moment from "moment";

const PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

const Products = () => {
  const { Panel } = Collapse;

  const { data: products, createDocument, updateDocument, deleteDocument, refetch } = useFirestoreCRUD("products");
  const { createDocument: createRepositionEntry } = useFirestoreCRUD("inventoryReposition");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [provider, setProvider] = useState("");
  const alertOnLowStock = Form.useWatch("alertOnLowStock", form);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [passwordModal, setPasswordModal] = useState({ visible: false, onConfirm: null });
  const [authPassword, setAuthPassword] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [productQtyMap, setProductQtyMap] = useState({});

  const selectedProducts = useMemo(() => {
    return selectedProductIds
      .map((id) => {
        const product = products?.find((p) => p.id === id);
        if (!product) return null;
        return {
          ...product,
          qty: productQtyMap[id] || 1,
        };
      })
      .filter(Boolean);
  }, [selectedProductIds, productQtyMap, products]);

  const filteredProducts = useMemo(() => {
    return products?.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) && (categoryFilter ? p.category === categoryFilter : true)) || [];
  }, [products, search, categoryFilter]);

  const lowStockProducts = useMemo(() => {
    return products?.filter((p) => p.alertOnLowStock && typeof p.stock === "number" && typeof p.qtyLowStockAlert === "number" && p.stock <= p.qtyLowStockAlert) || [];
  }, [products]);

  const showModal = (product = null) => {
    setEditingProduct(product);
    form.setFieldsValue({
      name: "",
      price: 0,
      category: "",
      stock: 0,
      showInMenu: false,
      showAsIngredient: false,
      alertOnLowStock: false,
      qtyLowStockAlert: 0,
      ingredients: [],
      ...product,
    });
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

  const handleBulkReposition = async () => {
    try {
      for (const product of selectedProducts) {
        await updateDocument(product.id, {
          stock: (product.stock || 0) + product.qty,
        });
      }

      const entry = {
        provider,
        createdAt: moment().format(),
        products: selectedProducts.map(({ id, name, qty }) => ({
          id,
          name,
          qty,
        })),
      };
      await createRepositionEntry(entry);

      messageApi.success("Reposición registrada exitosamente");
      refetch();
      setIsBulkModalOpen(false);
      //setSelectedProducts([]);
      setProvider("");
    } catch (err) {
      console.error(err);
      messageApi.error("Error al registrar la reposición");
    }
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

  const ingredientOptions = useMemo(() => {
    return products?.filter((p) => p.showAsIngredient)?.map((p) => ({ label: p.name, value: p.id })) || [];
  }, [products]);

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      {contextHolder}
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <div style={{display: "flex", gap: 8}}>
          <Button type="primary" onClick={() => showModal()}>
            Agregar producto
          </Button>

          <Button onClick={() => setIsBulkModalOpen(true)}>Reposición de inventario</Button>
        </div>

        <Space style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <Row>
            <Col style={{ paddingTop: 8 }} sm={24} md={12}>
              <Input.Search placeholder="Buscar por nombre" onChange={(e) => setSearch(e.target.value)} style={{ width: "89%" }} allowClear />
            </Col>
            <Col style={{ paddingTop: 8 }} sm={24} md={12}>
              <Select allowClear style={{ width: 200 }} placeholder="Filtrar por categoría" onChange={(value) => setCategoryFilter(value)} value={categoryFilter || undefined}>
                {categories.map((cat) => (
                  <Select.Option key={cat} value={cat}>
                    <Space>{cat}</Space>
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Space>

        {lowStockProducts.length > 0 && (
          <Collapse>
            <Panel header="Productos para reposición de inventario" key="1">
              <List
                itemLayout="horizontal"
                dataSource={lowStockProducts}
                bordered
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <span>
                          {item.name} <Tag color="red">Stock: {item.stock}</Tag>
                          <Tag color="orange">Mínimo: {item.qtyLowStockAlert}</Tag>
                        </span>
                      }
                      description={`Categoría: ${item.category}`}
                    />
                  </List.Item>
                )}
              />
            </Panel>
          </Collapse>
        )}

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
              <List.Item.Meta title={item.name} description={`Precio: $${item.price} | Categoría: ${item.category}`} />
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

          <Form.Item name="stock" label="Cantidad" rules={[{ required: true, type: "number", min: 0 }]}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="category" label="Categoría" rules={[{ required: true }]}>
            <Select placeholder="Selecciona una categoría">
              {categories.map((cat) => (
                <Select.Option key={cat} value={cat}>
                  {cat}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="showAsIngredient" valuePropName="checked">
            <Checkbox>Usar como ingrediente</Checkbox>
          </Form.Item>

          <Form.Item name="showInMenu" valuePropName="checked">
            <Checkbox>Mostrar en el menú</Checkbox>
          </Form.Item>

          <Form.Item name="alertOnLowStock" valuePropName="checked">
            <Checkbox>Alertar por bajo stock</Checkbox>
          </Form.Item>

          {alertOnLowStock && (
            <Form.Item name="qtyLowStockAlert" label="Cantidad mínima para alerta" rules={[{ required: true, type: "number", min: 1, message: "Ingresa una cantidad mínima" }]}>
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          )}

          <Form.List name="ingredients">
            {(fields, { add, remove }) => (
              <>
                <label>Ingredientes</label>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                    <Form.Item {...restField} name={[name, "id"]} rules={[{ required: true, message: "Ingrediente requerido" }]}>
                      <Select placeholder="Selecciona un ingrediente" options={ingredientOptions} style={{ width: 200 }} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, "qty"]} rules={[{ required: true, type: "number", min: 0, message: "Cantidad requerida" }]}>
                      <InputNumber placeholder="Cantidad" />
                    </Form.Item>
                    <Button danger type="text" onClick={() => remove(name)}>
                      Eliminar
                    </Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    Agregar ingrediente
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
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

      <Modal
        title="Reposición de inventario"
        open={isBulkModalOpen}
        onCancel={() => setIsBulkModalOpen(false)}
        onOk={() => {
          if (!provider || selectedProducts.length === 0) {
            return messageApi.error("Completa proveedor y al menos un producto");
          }
          showPasswordModal(handleBulkReposition);
        }}
        okText="Confirmar"
        cancelText="Cancelar"
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input placeholder="Nombre del proveedor" value={provider} onChange={(e) => setProvider(e.target.value)} />

          <Select
            mode="multiple"
            showSearch
            allowClear
            placeholder="Selecciona productos"
            style={{ width: "100%" }}
            value={selectedProductIds}
            onChange={(ids) => setSelectedProductIds(ids)}
            filterOption={(input, option) => option?.label?.toLowerCase().includes(input.toLowerCase())}
            options={products
              ?.filter((p) => !p.showAsIngredient)
              .map((p) => ({
                value: p.id,
                label: p.name,
              }))}
          />

          {selectedProductIds.length > 0 && (
            <div>
              {selectedProducts.map((product) => (
                <Row key={product.id} align="middle" style={{ marginBottom: 8 }}>
                  <Col flex="auto">{product.name}</Col>
                  <Col>
                    <InputNumber min={1} value={product.qty} onChange={(val) => setProductQtyMap((prev) => ({ ...prev, [product.id]: val }))} />
                  </Col>
                </Row>
              ))}
            </div>
          )}
        </Space>
      </Modal>
    </div>
  );
};

export default Products;
