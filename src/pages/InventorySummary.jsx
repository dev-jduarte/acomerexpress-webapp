import React, { useMemo } from "react";
import { useFirestoreCRUD } from "../hooks/useFirestoreCrud";
import { List, Card, Typography, Divider } from "antd";
import moment from "moment";

const { Title, Text } = Typography;

const InventorySummary = ({user}) => {
  const { data: repositions } = useFirestoreCRUD("inventoryReposition");
  const { data: products } = useFirestoreCRUD("products");

  const totalValue = useMemo(() => {
    if (!products) return 0;
    return products
      .filter((p) => p.showInMenu !== false)
      .reduce((sum, p) => sum + (p.price || 0) * (p.stock || 0), 0);
  }, [products]);

  return (
    <div style={user == 'CAJA' ? { padding: 24, width: "100%", margin: "0 auto" } : { padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <Title level={3}>Resumen de Inventario</Title>

      <Card style={{ marginBottom: 24 }}>
        <Text strong>Valor total del inventario actual:</Text>
        <Title level={4} style={{ marginTop: 8 }}>
          ${totalValue.toFixed(2)}
        </Title>
      </Card>

      <Divider />

      <Title level={4}>Historial de reposiciones</Title>
      <List
        bordered
        dataSource={repositions || []}
        locale={{ emptyText: "No hay reposiciones registradas" }}
        renderItem={(item) => (
          <List.Item>
            <div style={{ width: "100%" }}>
              <Text strong>Proveedor:</Text> {item.provider || "N/A"} <br />
              <Text type="secondary">Fecha:</Text>{" "}
              {moment(item.createdAt).format("DD/MM/YYYY HH:mm")}
              <div style={{ marginTop: 8 }}>
                <Text underline>Productos:</Text>
                <ul style={{ marginTop: 4 }}>
                  {item.products?.map((prod) => (
                    <li key={prod.id}>
                      {prod.name} — cantidad: {prod.qty}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default InventorySummary;
