import { useEffect, useState } from "react";
import { Button, List, Avatar, Row, Col, Select, Input } from "antd";
import { useFirestoreCRUD } from "./hooks/useFirestoreCrud";
import moment from "moment";

function App() {
  const { data: products } = useFirestoreCRUD("products");
  const { createDocument } = useFirestoreCRUD("orders");
  const [status, setStatus] = useState(null);
  const [formattedProducts, setFormattedProducts] = useState();
  const [data, setData] = useState([]);
  const [client, setClient] = useState({
    name: "",
    phone: "",
  });
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = ["BEBIDAS", "BEBIDAS ALC", "COMBOS", "DESAYUNOS", "ENS. PERSONALES", "ENTRADA", "KIDS", "PLATO FUERTE", "POSTRE", "RACION"];

  useEffect(() => {
    formatProducts();
  }, [products]);

  function formatProducts() {
    let newData = products.map((product) => {
      if (product.price && product.price > 0) {
        return { value: product.id, label: product.name, item: product };
      }
    });
    newData = newData.filter((item) => item).sort((a, b) => a.label.localeCompare(b.label));
    setFormattedProducts(newData);
  }

  function onIncrement(index) {
    const newData = [...data];
    newData[index] = { ...newData[index], qty: newData[index].qty + 1 };
    setData(newData);
  }

  function onDecrement(index) {
    const newData = [...data];
    newData[index] = { ...newData[index], qty: newData[index].qty - 1 };
    setData(newData);
  }

  function filterProducts(productNameToRemove) {
    const newData = formattedProducts.filter((item) => item.item.name !== productNameToRemove);
    setFormattedProducts(newData);
  }

  function deleteItem(index) {
    const newData = [...data];
    newData.splice(index, 1);
    setData(newData);
    formatProducts();
  }

  function closeOrder() {
    createDocument({ name: client.name || "Sin nombre", products: data, total: data.reduce((acc, curr) => acc + (curr.qty * curr.price || 0), 0), date: moment().format() });
  }

  const filteredByCategory = formattedProducts?.filter((product) => !selectedCategory || product.item.category === selectedCategory);

  return (
    <div style={{ padding: 16, maxWidth: 500, margin: "0 auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        <Button disabled={status} type="primary" onClick={() => setStatus("newOrder")}>
          Abrir orden
        </Button>
        <Button
          disabled={!status}
          danger
          onClick={() => {
            setStatus(null);
            setData([]);
            formatProducts();
          }}
        >
          Cancelar orden
        </Button>
      </div>

      {/* Formulario de cliente */}
      {status === "newOrder" && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
            <Input placeholder="Nombre del cliente" value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} />
            <Input placeholder="Teléfono del cliente" value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} />
          </div>

          {/* Selector de productos */}
          <div style={{ marginBottom: 24 }}>
            <h3>Seleccionar producto:</h3>
            <div style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
              <Button type={!selectedCategory ? "primary" : "default"} onClick={() => setSelectedCategory(null)}>
                Todas
              </Button>
              {categories.map((cat) => (
                <Button key={cat} type={selectedCategory === cat ? "primary" : "default"} onClick={() => setSelectedCategory(cat)}>
                  {cat}
                </Button>
              ))}
            </div>
            <Select
              style={{ width: "100%" }}
              options={filteredByCategory}
              onSelect={(value, item) => {
                setData([...data, { qty: 1, ...item.item }]);
                filterProducts(item.item.name);
              }}
            />
          </div>

          {/* Lista de productos seleccionados */}
          <List
            itemLayout="vertical"
            dataSource={data}
            renderItem={(item, index) => (
              <List.Item key={item.id} style={{ borderBottom: "1px solid #eee", paddingBottom: 12 }}>
                <List.Item.Meta
                  avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`} />}
                  title={item.name}
                  description={`Precio unitario: $${item.price}`}
                />
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <Button disabled={item.qty <= 1} onClick={() => onDecrement(index)}>
                    -
                  </Button>
                  <span>{item.qty}</span>
                  <Button onClick={() => onIncrement(index)}>+</Button>
                  <Button danger onClick={() => deleteItem(index)}>
                    Eliminar
                  </Button>
                </div>
                <div style={{ marginTop: 8 }}>
                  <strong>Total: ${item.qty * item.price}</strong>
                </div>
              </List.Item>
            )}
          />
          <div style={{ width: "100%" }}>
            <Button
              style={{ width: "100%", marginTop: "30px" }}
              type="primary"
              disabled={!data.length}
              onClick={() => {
                closeOrder();
                setStatus(null);
                setData([]);
                formatProducts();
              }}
            >
              Finalizar orden
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
