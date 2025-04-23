import { useEffect, useState } from "react";
import { Button, List, Avatar, Row, Col, Select, Input } from "antd";
import { useFirestoreCRUD } from "./hooks/useFirestoreCrud";

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

  useEffect(() => {
    formatProducts();
  }, [products]);

  function formatProducts() {
    const newData = products.map((product) => {
      return { value: product.id, label: product.name, item: product };
    });
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

  function filterProducts() {
    let newData = [...formattedProducts];
    newData = newData.filter((item) => data.includes((i) => i.name == item.name));
    setFormattedProducts(newData);
  }

  function deleteItem(index) {
    const newData = [...data];
    newData.splice(index, 1);
    setData(newData);
    formatProducts();
  }

  function closeOrder() {
    createDocument({ name: "Prueba 2", products: data, total: data.reduce((acc, curr) => acc + (curr.qty * curr.price || 0), 0) });
  }

  return (
    <>
      
      <Row style={{ height: "60vh" }}>
        <Col
          span={12}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRight: "1px solid #f0f0f0",
          }}
        >
          {status && status == "newOrder" && (
            <div style={{ width: "80%" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 300 }}>
        <div style={{display: "flex", justifyContent: "space-between"}}>
          <label>Cliente: </label>
          <Input
            style={{ width: "200px" }}
            onChange={(e) => {
              const newData = { ...client };
              newData.name = e.target.value;
              setClient(newData);
              console.log(e.target.value);
            }}
          />
        </div>
        <div style={{display: "flex", justifyContent: "space-between"}}>
          <label>Teléfono: </label>
          <Input
            style={{ width: "200px" }}
            onChange={(e) => {
              const newData = { ...client };
              newData.phone = e.target.value;
              setClient(newData);
              console.log(e.target.value);
            }}
          />
        </div>
      </div>
              <List
                itemLayout="horizontal"
                header={
                  <div>
                    <h2>Productos</h2>
                    <Select
                      style={{ minWidth: "200px" }}
                      options={formattedProducts}
                      onSelect={(value, item) => {
                        const newData = [...data];
                        newData.push({ qty: 1, ...item.item });
                        setData(newData);
                        filterProducts();
                      }}
                    />
                  </div>
                }
                dataSource={data}
                renderItem={(item, index) => (
                  <List.Item
                    actions={[
                      <Button disabled={item.qty == 0} onClick={() => onDecrement(index)}>
                        -
                      </Button>,
                      <Button>{item.qty}</Button>,
                      <Button
                        onClick={() => {
                          onIncrement(index);
                        }}
                      >
                        +
                      </Button>,
                      <div>
                        <label>Total: </label>
                        <label>${item.qty * item.price}</label>
                      </div>,
                      <Button
                        onClick={() => {
                          deleteItem(index);
                        }}
                      >
                        Eliminar
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`} />}
                      title={<a href="https://ant.design">{item.name}</a>}
                      description={`Precio: $${item.price}`}
                    />
                  </List.Item>
                )}
              />
            </div>
          )}
        </Col>
        <Col span={12}>
          <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", alignItems: "center", gap: 8 }}>
            <Button disabled={status} type="primary" onClick={() => setStatus("newOrder")}>
              Abrir orden
            </Button>
            <Button
              disabled={data && data.length == 0}
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
        </Col>
      </Row>
    </>
  );
}

export default App;
