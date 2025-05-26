import React, { useEffect, useState } from "react";
import { useFirestoreCRUD } from "../hooks/useFirestoreCrud";
import { Button, List, Input, Checkbox, Divider, Modal, InputNumber, message } from "antd";
import moment from "moment";
import { categories } from "../utils/categories";
import { categoryIcons } from "../utils/categoryIcons";
import getCategoryColor from "../utils/getColorsByCategories";
import TextArea from "antd/es/input/TextArea";
import _ from "lodash";
import Ticket from "../components/Ticket";

function Orders({ user }) {
  const { data: orders, updateDocument, refetch } = useFirestoreCRUD("orders", false);
  const { data: products, updateDocument: updateProducts } = useFirestoreCRUD("products");
  const { data: clients } = useFirestoreCRUD("clients");

  const [editingOrder, setEditingOrder] = useState(null);
  const [productOptions, setProductOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [orderToClose, setOrderToClose] = useState(null);
  const [isClosingModalVisible, setIsClosingModalVisible] = useState(false);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
  const [paymentAmounts, setPaymentAmounts] = useState({});
  const [searchValue, setSearchValue] = useState(null);
  const [displayData, setDisplayData] = useState([]);
  const [selectedProductsByOrder, setSelectedProductsByOrder] = useState({});
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [isPendingModalVisible, setIsPendingModalVisible] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState(null);

  const [messageApi, contextHolder] = message.useMessage();

  const paymentMethods = [
    { label: "PAGO MOVIL", value: "PAGOMOVIL" },
    { label: "EFECTIVO $", value: "EFECTIVODOLAR" },
    { label: "EFECTIVO BS", value: "EFECTIVOBS" },
    { label: "ZELLE", value: "ZELLE" },
    { label: "BINANCE", value: "BINANCE" },
    { label: "PUNTO DE VENTA", value: "PUNTODEVENTA" },
    { label: "PROPINA", value: "PROPINA" },
  ];

  let filteredProductOptions = productOptions.filter((option) => {
    const matchesCategory = selectedCategory ? option.item.category === selectedCategory : true;
    const notAlreadyAdded = !editingOrder?.products.some((p) => p.id === option.item.id);
    const matchesSearch = searchValue ? option.label.toLowerCase().includes(searchValue.toLowerCase()) : true;
    return matchesCategory && notAlreadyAdded && matchesSearch;
  });

  if (selectedCategory == "COFFEE LOVERS") {
    filteredProductOptions = _.orderBy(filteredProductOptions, (x) => x.item.subCategory);
    filteredProductOptions = _.groupBy(filteredProductOptions, (x) => x.item.subCategory);
  }

  const toggleProductSelection = (orderId, productIndex) => {
    setSelectedProductsByOrder((prev) => {
      // Si no hay orden activa, se establece
      if (!activeOrderId || activeOrderId === orderId) {
        const currentSelection = prev[orderId] || [];
        const alreadySelected = currentSelection.includes(productIndex);
        const updatedSelection = alreadySelected ? currentSelection.filter((i) => i !== productIndex) : [...currentSelection, productIndex];

        // Si se deseleccionó el último producto, también se borra el `activeOrderId`
        const isNowEmpty = updatedSelection.length === 0;
        if (isNowEmpty) setActiveOrderId(null);
        else setActiveOrderId(orderId);

        return { [orderId]: updatedSelection };
      } else {
        // Mostrar una advertencia o simplemente ignorar
        messageApi.warning("Solo puedes seleccionar productos de un cliente a la vez");
        return prev;
      }
    });
  };

  useEffect(() => {
    if (products) {
      const options = products
        .filter((p) => p.price > 0 && p.showInMenu !== false)
        .map((p) => ({
          value: p.id,
          label: p.name,
          item: p,
        }));
      setProductOptions(options);
    }
  }, [products]);

  useEffect(() => {
    refetch({ status: "open" })
      .then((res) => {
        const data = _.orderBy(res, res?.date, "desc")
        setDisplayData(data)
      })
      .catch((err) => {
        console.log(err);
        setDisplayData([]);
      });
  }, []);

  const zonesOptions = [
    { label: "Zona A", value: "ZONEA" },
    { label: "Zona B", value: "ZONEB" },
    { label: "Zona C", value: "ZONEC" },
    { label: "Terraza", value: "TERRAZA" },
  ];

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

  const handleTogglePaymentMethod = (method) => {
    setSelectedPaymentMethods((prevSelected) => {
      if (prevSelected.includes(method)) {
        const updated = prevSelected.filter((m) => m !== method);
        const { [method]: removed, ...rest } = paymentAmounts;
        setPaymentAmounts(rest);
        return updated;
      } else {
        return [...prevSelected, method];
      }
    });
  };

  const handlePaymentAmountChange = (method, value) => {
    setPaymentAmounts((prev) => ({
      ...prev,
      [method]: value,
    }));
  };

  const handleUpdateOrder = async () => {
    const updatedTotal = editingOrder.products.reduce((acc, item) => acc + item.price * item.qty, 0);

    await updateDocument(editingOrder.id, {
      name: editingOrder.name,
      phone: editingOrder.phone || "",
      products: editingOrder.products,
      total: updatedTotal,
      location: editingOrder.location || "", // <- nuevo campo
      payments: selectedPaymentMethods.map((method) => ({
        method,
        amount: paymentAmounts[method] || 0,
      })),
      notes: editingOrder?.notes || "",
    });
    await Promise.all(
      editingOrder.products.map(async (product) => {
        if (!product.ingredients || product?.ingredients?.length == 0) {
          await updateProducts(product.id, {
            stock: product["stock"] - product.qty,
          });
        } else {
          await Promise.all(
            product?.ingredients?.map(async (ingredient) => {
              const productToRemove = products.find((p) => p.id == ingredient.id);
              await updateProducts(ingredient.id, { stock: productToRemove.stock - ingredient.qty });
            })
          );
        }
      })
    );

    await refetch({ status: "open" }).then((res) => {
      setDisplayData(res);
    });

    setEditingOrder(null);
    setSelectedPaymentMethods([]);
    setPaymentAmounts({});
  };

  const showCloseOrderModal = (order) => {
    setOrderToClose(order);
    setIsClosingModalVisible(true);
  };

  const closeOrder = async () => {
    if (!orderToClose) return;

    const { id } = orderToClose;
    await updateDocument(id, {
      status: "closed",
      payments: selectedPaymentMethods.map((method) => ({
        method,
        amount: paymentAmounts[method] || 0,
      })),
      date: moment().format(),
      seller: user,
    });
    await refetch({ status: "open" }).then((res) => {
      setDisplayData(res);
    });

    setIsClosingModalVisible(false);
    setOrderToClose(null);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
      {contextHolder}
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

          <Divider orientation="left">Ubicación</Divider>

          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            {zonesOptions.map((zone) => (
              <Button
                key={zone.value}
                style={{
                  flex: "1 1 calc(50% - 12px)",
                  minWidth: 120,
                  height: 80,
                  backgroundColor: editingOrder?.location == zone.value ? getCategoryColor("BEBIDAS") : getCategoryColor("HAMBURGUESAS"),
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
                onClick={() => {
                  setEditingOrder({ ...editingOrder, location: zone.value });
                }}
              >
                {zone.label}
              </Button>
            ))}
          </div>

          <Divider orientation="left">Productos actuales</Divider>
          <List
            bordered
            dataSource={editingOrder.products}
            renderItem={(product, index) => (
              <List.Item
                actions={[
                  <Button onClick={() => handleProductQtyChange(index, -1)} disabled={product.qty <= 1}>
                    -
                  </Button>,
                  <Button onClick={() => handleProductQtyChange(index, 1)}>+</Button>,
                  <Button danger onClick={() => handleRemoveProduct(index)}>
                    Eliminar
                  </Button>,
                ]}
              >
                <List.Item.Meta title={product.name} description={`Cantidad: ${product.qty} | Precio: $${product.price * product.qty}`} />
              </List.Item>
            )}
          />

          <Divider orientation="left">Filtrar por categoría</Divider>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {categories.map((cat) => (
              <Button key={cat} type={selectedCategory === cat ? "primary" : "default"} onClick={() => setSelectedCategory(cat)}>
                {cat}
              </Button>
            ))}
            <Button type={!selectedCategory ? "primary" : "default"} onClick={() => setSelectedCategory(null)}>
              TODOS
            </Button>
          </div>

          <div style={{ margin: "24px 0px" }}>
            <div style={{ margin: "8px" }}>Buscar productos</div>
            <Input placeholder="Buscar producto..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)} style={{ marginBottom: 10 }} />
          </div>

          <Divider orientation="left">Productos disponibles</Divider>
          <div style={{ display: selectedCategory == "COFFEE LOVERS" ? "block" : "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginBottom: 16 }}>
            {selectedCategory != "COFFEE LOVERS" &&
              filteredProductOptions.map((option) => {
                const categoryInfo = categoryIcons[option.item.category] || {};
                const IconComponent = categoryInfo?.icon || categoryIcons["HAMBURGUESAS"].icon; // fallback por si no hay

                return (
                  <Button
                    key={option.value}
                    type="primary"
                    style={{
                      backgroundColor: categoryInfo.color || "#1890ff",
                      flex: "1 1 calc(50% - 12px)",
                      minWidth: 120,
                      height: 80,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: 14,
                      whiteSpace: "normal",
                    }}
                    onClick={() => handleAddProduct(option.value, option)}
                  >
                    <IconComponent style={{ fontSize: 32, marginBottom: 8 }} />
                    {/*   {product.item.subCategory ? `(${product.item.subCategory}) ${product.label}` : product.label} */}
                    {option.item.subCategory ? `(${option.item.subCategory}) ${option.label}` : option.label}
                  </Button>
                );
              })}

            {selectedCategory === "COFFEE LOVERS" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {Object.keys(filteredProductOptions).map((subcategory) => (
                  <div key={subcategory} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* Subcategoría como título */}
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        marginBottom: 4,
                        padding: "4px 8px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: 6,
                      }}
                    >
                      {subcategory}
                    </div>

                    {/* Lista de opciones */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                      {filteredProductOptions[subcategory].map((option) => {
                        const categoryInfo = categoryIcons[option.item.category] || {};
                        const IconComponent = categoryInfo.icon || categoryIcons["HAMBURGUESAS"].icon;

                        return (
                          <Button
                            key={option.value}
                            type="primary"
                            style={{
                              backgroundColor: categoryInfo.color || "#1890ff",
                              flex: "1 1 calc(50% - 12px)",
                              minWidth: 120,
                              height: 80,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center",
                              fontSize: 14,
                              whiteSpace: "normal",
                            }}
                            onClick={() => handleAddProduct(option.value, option)}
                          >
                            <IconComponent style={{ fontSize: 32, marginBottom: 8 }} />
                            <span
                              style={{
                                textAlign: "center",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                width: "100%",
                              }}
                            >
                              {option.label}
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ width: "100%", marginTop: 16 }}>
            <TextArea placeholder="Notas..." value={editingOrder?.notes} onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })} />
          </div>

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
          <Input
            placeholder="Buscar ordenes por nombre"
            value={searchValue}
            onChange={(e) => {
              if (e.target.value.trim() == "") {
                const newData = orders;
                setDisplayData(newData);
                setSearchValue(e.target.value);
                return;
              }
              const newData = orders.filter((order) => order?.name?.toLowerCase().includes(e?.target?.value?.toLowerCase()));
              setDisplayData(newData);
              setSearchValue(e.target.value);
            }}
          />
          {user && displayData && (
            <List
              itemLayout="vertical"
              dataSource={displayData}
              renderItem={(item) => {
                if ((item.seller && item.seller == user) || user == "CAJA" || !item.seller) {
                  return (
                    <List.Item key={item.id}>
                      <List.Item.Meta title={item.name} description={`Total de la orden: $${item.total}`} />
                      <List.Item.Meta description={`CI: ${item.dni || ""}`} />
                      {item.notes && <List.Item.Meta title={"Nota"} description={item.notes} />}
                      {item.location && <div>Zona: {zonesOptions.find((z) => z.value === item.location)?.label}</div>}
                      <Divider style={{ margin: "8px 0" }} />
                      {item.products.map((product, idx) => (
                        <div key={idx} style={{ marginBottom: 4 }}>
                          <Checkbox checked={selectedProductsByOrder[item.id]?.includes(idx)} onChange={() => toggleProductSelection(item.id, idx)}>
                            <strong>{product.name}</strong> - ${product.price} x {product.qty}
                          </Checkbox>
                        </div>
                      ))}

                      <div>
                        <strong>Vendedor: {item.seller}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", gap: 8, marginTop: 8 }}>
                        <Button type="primary" onClick={() => setEditingOrder(item)}>
                          Editar Orden
                        </Button>
                        <Button danger onClick={() => showCloseOrderModal(item)}>
                          Cerrar orden
                        </Button>
                        {user == "CAJA" && (
                          <Button
                            type="dashed"
                            onClick={() => {
                              setOrderToEdit(item);
                              setIsPendingModalVisible(true);
                            }}
                          >
                            Colocar Pendiente
                          </Button>
                        )}
                        {user == "CAJA" && (
                          <Ticket
                            cliente={item.name}
                            pedido={displayData.flatMap((order) => (selectedProductsByOrder[order.id] || []).map((idx) => order.products[idx]))}
                            total={item.total}
                            mesonero={item.seller}
                            zona={item.location}
                            notes={item.notes}
                          />
                        )}
                      </div>
                    </List.Item>
                  );
                }
              }}
            />
          )}
        </>
      )}

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
        okButtonProps={{
          disabled:
            !orderToClose ||
            Object.entries(paymentAmounts)
              .filter(([method]) => method !== "PROPINA")
              .reduce((acc, [, amount]) => acc + Number(amount || 0), 0) !== orderToClose.total,
        }}
      >
        <p>¿Estás seguro de que deseas cerrar esta orden?</p>
        {orderToClose && (
          <>
            <Divider orientation="left">Métodos de pago</Divider>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {paymentMethods.map((method) => (
                <Button key={method.value} type={selectedPaymentMethods.includes(method.value) ? "primary" : "default"} onClick={() => handleTogglePaymentMethod(method.value)}>
                  {method.label}
                </Button>
              ))}
            </div>

            <div style={{ marginTop: 12 }}>
              {selectedPaymentMethods.map((method) => (
                <div key={method} style={{ marginBottom: 8 }}>
                  <InputNumber
                    style={{ width: "100%" }}
                    addonBefore={paymentMethods.find((m) => m.value === method)?.label}
                    placeholder="Monto"
                    min={0}
                    value={paymentAmounts[method]}
                    onChange={(value) => handlePaymentAmountChange(method, value)}
                  />
                </div>
              ))}
            </div>

            <p>
              <strong>Cliente:</strong> {orderToClose.name || "Sin nombre"}
            </p>
            <p>
              <strong>Total:</strong> ${orderToClose.total}
            </p>
          </>
        )}
      </Modal>

      <Modal
        title="¿Marcar orden como pendiente?"
        open={isPendingModalVisible}
        onOk={async () => {
          await updateDocument(orderToEdit.id, { status: "pending" });
          await refetch({ status: "open" }).then((res) => setDisplayData(res));
          setIsPendingModalVisible(false);
          setOrderToEdit(null);
          message.success("Orden marcada como pendiente");
        }}
        onCancel={() => setIsPendingModalVisible(false)}
        okText="Sí, marcar como pendiente"
        cancelText="Cancelar"
      >
        <p>
          ¿Estás seguro de que deseas marcar esta orden como <strong>pendiente</strong>?
        </p>
      </Modal>
    </div>
  );
}

export default Orders;
