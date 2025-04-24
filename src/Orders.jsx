import React, { useEffect, useState } from "react";
import { useFirestoreCRUD } from "./hooks/useFirestoreCrud";
import { Button, List, Input, Select, Divider, Modal } from "antd";
import moment from "moment";

function Orders() {
  const { data: orders, updateDocument } = useFirestoreCRUD("orders");
  const { data: products } = useFirestoreCRUD("products");
  const { createDocument } = useFirestoreCRUD("closedOrders"); // Asumimos que las órdenes cerradas van a esta colección
  const [editingOrder, setEditingOrder] = useState(null);
  const [productOptions, setProductOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [orderToClose, setOrderToClose] = useState(null);
  const [isClosingModalVisible, setIsClosingModalVisible] = useState(false);

  const categories = ["BEBIDAS", "BEBIDAS ALC", "COMBOS", "DESAYUNOS", "ENS. PERSONALES", "ENTRADA", "KIDS", "PLATO FUERTE", "POSTRE", "RACION"];

  const filteredProductOptions = productOptions.filter((option) => (selectedCategory ? option.item.category === selectedCategory : true));

  useEffect(() => {
    if (products) {
      const options = products
        .filter((p) => p.price > 0)
        .map((p) => ({
          value: p.id,
          label: p.name,
          item: p,
        }));
      setProductOptions(options);
    }
  }, [products]);

  const handleProductQtyChange = (index, delta) => {
    const newProducts = [...editingOrder.products];
    newProducts[index].qty += delta;
    setEditingOrder({ ...editingOrder, products: newProducts });
  };

  const handleRemoveProduct = (index) => {
    const newProducts = [...editingOrder.products];
    newProducts.splice(index, 1);
    setEditingOrder({ ...editingOrder, products: newProducts });
  };

  const handleAddProduct = (value, option) => {
    const exists = editingOrder.products.find((p) => p.id === option.item.id);
    if (exists) return;

    setEditingOrder({
      ...editingOrder,
      products: [...editingOrder.products, { ...option.item, qty: 1 }],
    });
  };

  const handleUpdateOrder = async () => {
    const updatedTotal = editingOrder.products.reduce((acc, item) => acc + item.price * item.qty, 0);
    await updateDocument(editingOrder.id, {
      name: editingOrder.name,
      phone: editingOrder.phone,
      products: editingOrder.products,
      total: updatedTotal,
    });
    setEditingOrder(null);
  };

  const showCloseOrderModal = (order) => {
    setOrderToClose(order);
    setIsClosingModalVisible(true);
  };

  const closeOrder = async () => {
    if (!orderToClose) return;
    const { name = "Sin nombre", products } = orderToClose;
    const total = products.reduce((acc, curr) => acc + (curr.qty * curr.price || 0), 0);

    await createDocument({
      name,
      products,
      total,
      date: moment().format(),
    });

    setIsClosingModalVisible(false);
    setOrderToClose(null);
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 16 }}>
      {editingOrder ? (
        <>
          <h2>Editando orden: {editingOrder.name}</h2>

          <Input
            placeholder="Nombre del cliente"
            value={editingOrder.name}
            onChange={(e) => setEditingOrder({ ...editingOrder, name: e.target.value })}
            style={{ marginBottom: 8 }}
          />
          <Input
            placeholder="Teléfono del cliente"
            value={editingOrder.phone}
            onChange={(e) => setEditingOrder({ ...editingOrder, phone: e.target.value })}
            style={{ marginBottom: 16 }}
          />

          <Divider orientation="left">Filtrar por categoría</Divider>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {categories.map((cat) => (
              <Button key={cat} type={selectedCategory === cat ? "primary" : "default"} onClick={() => setSelectedCategory(cat)}>
                {cat}
              </Button>
            ))}
            <Button type={!selectedCategory ? "primary" : "default"} onClick={() => setSelectedCategory(null)}>
              Todos
            </Button>
          </div>

          <Select
            style={{ width: "100%", marginBottom: 16 }}
            placeholder="Selecciona un producto"
            options={filteredProductOptions}
            onSelect={handleAddProduct}
            value={undefined}
            showSearch
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
          />

          <Divider orientation="left">Productos actuales</Divider>
          <List
            bordered
            dataSource={editingOrder.products}
            renderItem={(product, index) => (
              <List.Item
                actions={[
                  <Button onClick={() => handleProductQtyChange(index, 1)}>+</Button>,
                  <Button onClick={() => handleProductQtyChange(index, -1)} disabled={product.qty <= 1}>
                    -
                  </Button>,
                  <Button danger onClick={() => handleRemoveProduct(index)}>
                    Eliminar
                  </Button>,
                ]}
              >
                <List.Item.Meta title={product.name} description={`Cantidad: ${product.qty} | Precio: $${product.price}`} />
              </List.Item>
            )}
          />

          <div style={{ marginTop: 24, display: "flex", gap: 8 }}>
            <Button type="primary" onClick={handleUpdateOrder}>
              Guardar cambios
            </Button>
            <Button onClick={() => setEditingOrder(null)}>Cancelar</Button>
          </div>
        </>
      ) : (
        <>
          <h2>Órdenes registradas</h2>
          <List
            itemLayout="vertical"
            dataSource={orders}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                actions={[
                  <Button type="primary" onClick={() => setEditingOrder(item)}>
                    Editar Orden
                  </Button>,
                  <Button danger onClick={() => showCloseOrderModal(item)}>
                    Cerrar orden
                  </Button>,
                ]}
              >
                <List.Item.Meta title={item.name} description={`Total de la orden: $${item.total}`} />
                <Divider style={{ margin: "8px 0" }} />
                {item.products.map((product, idx) => (
                  <div key={idx} style={{ marginBottom: 4 }}>
                    <strong>{product.name}</strong> - ${product.price} x {product.qty}
                  </div>
                ))}
              </List.Item>
            )}
          />
        </>
      )}

      {/* Modal de confirmación para cerrar orden */}
      <Modal
        title="¿Cerrar orden?"
        open={isClosingModalVisible}
        onOk={closeOrder}
        onCancel={() => {
          setIsClosingModalVisible(false);
          setOrderToClose(null);
        }}
        okText="Confirmar"
        cancelText="Cancelar"
      >
        <p>¿Estás seguro de que deseas cerrar esta orden?</p>
        {orderToClose && (
          <>
            <p><strong>Cliente:</strong> {orderToClose.name || "Sin nombre"}</p>
            <p><strong>Total:</strong> ${orderToClose.total}</p>
          </>
        )}
      </Modal>
    </div>
  );
}

export default Orders;
