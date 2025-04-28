import { useEffect, useState } from "react";
import { Button, List, Avatar, Select, Input, Divider } from "antd";
import { useFirestoreCRUD } from "../hooks/useFirestoreCrud";
import moment from "moment";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import BreakfastDiningIcon from "@mui/icons-material/BreakfastDining";
import CakeIcon from "@mui/icons-material/Cake";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LunchDiningIcon from "@mui/icons-material/LunchDining";
import SportsBarIcon from "@mui/icons-material/SportsBar";
import { categories } from "../utils/categories";
import getCategoryColor from "../utils/getColorsByCategories";
import TextArea from "antd/es/input/TextArea";

function App({ user }) {
  const { data: products } = useFirestoreCRUD("products");
  const { data: users, createDocument: createClient, updateDocument } = useFirestoreCRUD("clients");
  const { createDocument } = useFirestoreCRUD("orders");
  const [status, setStatus] = useState(null);
  const [formattedProducts, setFormattedProducts] = useState();
  const [data, setData] = useState([]);
  const [client, setClient] = useState({
    name: "",
    phone: "",
    dni: "",
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [notes, setNotes] = useState(null);

  const zonesOptions = [
    { label: "Zona A", value: "ZONEA" },
    { label: "Zona B", value: "ZONEB" },
    { label: "Zona C", value: "ZONEC" },
    { label: "Terraza", value: "TERRAZA" },
  ];

  const categoryIcons = {
    BEBIDAS: <LocalDrinkIcon style={{ fontSize: 24, marginTop: 5 }} />,
    HAMBURGUESAS: <FastfoodIcon style={{ fontSize: 24, marginTop: 5 }} />,
    "MENU KIDS": <ChildCareIcon style={{ fontSize: 24, marginTop: 5 }} />,
    "ARABIC FOOD": <RestaurantIcon style={{ fontSize: 24, marginTop: 5 }} />,
    "SMASH CRUJIENTE": <RestaurantIcon style={{ fontSize: 24, marginTop: 5 }} />,
    POSTRES: <CakeIcon style={{ fontSize: 24, marginTop: 5 }} />,
    RACIONES: <FastfoodIcon style={{ fontSize: 24, marginTop: 5 }} />,
    "HOT DOGS": <FastfoodIcon style={{ fontSize: 24, marginTop: 5 }} />,
    EXTRAS: <FastfoodIcon style={{ fontSize: 24, marginTop: 5 }} />,
    NARGUILE: <FastfoodIcon style={{ fontSize: 24, marginTop: 5 }} />,
  };

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
    return newData
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

  function createOrder() {
    const existingClient = users.find((i) => i.dni == client.dni);
    if (!existingClient) {
      createClient(client);
    }

    data.map(product => {
      updateDocument(product.id, {stock: product["stock"] - product.qty})
    })

    createDocument({
      name: client.name || "Sin nombre",
      products: data,
      total: data.reduce((acc, curr) => acc + (curr.qty * curr.price || 0), 0),
      date: moment().format(),
      status: "open",
      location: selectedZone,
      notes,
      seller: user,
    });
  }

  const filteredByCategory = formattedProducts?.filter((product) => !selectedCategory || product.item.category === selectedCategory);

  return (
    <div style={{ padding: 16, maxWidth: 500, margin: "0 auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        <Button disabled={status || !user} type="primary" onClick={() => setStatus("newOrder")}>
          Nueva orden
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
            <Input
              placeholder="Cédula"
              value={client.dni}
              onChange={(e) => {
                setClient({ ...client, dni: e.target.value });
                const existingUser = users.find((u) => u.dni == e.target.value);
                if (existingUser) {
                  setClient(existingUser);
                }
              }}
            />
            <Input placeholder="Nombre del cliente" value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} />
            <Input placeholder="Teléfono del cliente" value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} />
            <Divider orientation="left">Ubicación</Divider>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              {zonesOptions.map((zone) => (
                <Button
                  key={zone.value}
                  style={{
                    flex: "1 1 calc(50% - 12px)",
                    minWidth: 120,
                    height: 80,
                    backgroundColor: selectedZone == zone.value ? getCategoryColor("BEBIDAS") : getCategoryColor("HAMBURGUESAS"),
                    color: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                  onClick={() => {
                    setSelectedZone(zone.value);
                  }}
                >
                  {zone.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Selector de productos */}
          <div style={{ marginBottom: 24 }}>
            <h3>Seleccionar producto:</h3>
            <div style={{ margin: "24px 0px" }}>
              <div style={{ margin: "8px" }}>Buscar productos</div>
              <Input
                placeholder="Nombre del producto"
                type="search"
                onChange={(e) => {
                  if (e.target.value?.trim() == "") {
                    return formatProducts();
                  }
                  let newData = formatProducts();
                  newData = newData.filter((product) => product.label.toLowerCase().includes(e.target.value.toLowerCase()));
                  setFormattedProducts(newData);
                }}
              />
            </div>
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
            {/* Botones de productos */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {filteredByCategory?.map((product) => (
                <Button
                  key={product.value}
                  style={{
                    flex: "1 1 calc(50% - 12px)",
                    minWidth: 120,
                    height: 80,
                    backgroundColor: getCategoryColor(product.item.category),
                    color: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                  onClick={() => {
                    setData([...data, { qty: 1, ...product.item }]);
                    filterProducts(product.item.name);
                  }}
                >
                  {categoryIcons[product.item.category] || <FastfoodIcon style={{ fontSize: 24 }} />}
                  <span
                    style={{
                      marginTop: 8,
                      textAlign: "center",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      width: "100%",
                    }}
                  >
                    {product.label}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Lista de productos seleccionados */}
          <List
            itemLayout="vertical"
            dataSource={data}
            renderItem={(item, index) => (
              <List.Item key={item.id} style={{ borderBottom: "1px solid #eee", paddingBottom: 12 }}>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{
                        backgroundColor: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {categoryIcons[item.category] || <FastfoodIcon style={{ fontSize: 24 }} />}
                    </Avatar>
                  }
                  title={item.name}
                  description={`Precio unitario: $${item.price}`}
                />
                <div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                    <Button size="large" disabled={item.qty <= 1} onClick={() => onDecrement(index)}>
                      -
                    </Button>
                    <span>{item.qty}</span>
                    <Button size="large" onClick={() => onIncrement(index)}>
                      +
                    </Button>
                  </div>
                  <Button size="large" danger onClick={() => deleteItem(index)}>
                    Eliminar
                  </Button>
                </div>
                <div style={{ marginTop: 8 }}>
                  <strong>Total: ${item.qty * item.price}</strong>
                </div>
              </List.Item>
            )}
          />
          <div style={{ width: "100%", marginTop: 16 }}>
            <TextArea placeholder="Notas..." value={notes} onChange={(e) => setNotes(e.target.value)}></TextArea>
          </div>
          <div style={{ width: "100%" }}>
            <Button
              style={{ width: "100%", marginTop: "30px" }}
              type="primary"
              disabled={!data.length || client?.name?.trim() == ""}
              onClick={() => {
                createOrder();
                setStatus(null);
                setData([]);
                formatProducts();
              }}
            >
              Crear orden
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
