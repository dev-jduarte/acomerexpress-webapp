import React, { useEffect, useState } from "react";
import { useFirestoreCRUD } from "../hooks/useFirestoreCrud";
import { List, Divider, Collapse, DatePicker, Space } from "antd";
import moment from "moment";

const { Panel } = Collapse;
const { RangePicker } = DatePicker;

function ClosedOrders() {
  const { data: orders, updateDocument, refetch } = useFirestoreCRUD("orders", false);
  const { data: products } = useFirestoreCRUD("products");

  const [dateRange, setDateRange] = useState(null); // [moment, moment]

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    if (dates && dates.length === 2) {
      refetch({
        status: "closed",
        date: {
          start: moment(dates[0].toDate()).format(),
          end: moment(dates[1].toDate()).format(),
        },
      });
    } else {
      refetch({ status: "closed" });
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 16 }}>
      <h2>Órdenes cerradas</h2>

      <Space direction="vertical" style={{ marginBottom: 16, width: "100%" }}>
        <RangePicker showTime format="DD/MM/YYYY HH:mm" onChange={handleDateRangeChange} style={{ width: "100%" }} placeholder={["Fecha de inicio", "Fecha de fin"]} />
      </Space>

      <List
        itemLayout="vertical"
        dataSource={orders}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <List.Item.Meta
              title={item.name}
              description={
                <div>
                  <div>Total de la orden: ${item.total}</div>
                  <div>Fecha: {item?.date ? moment(item.date).format("DD/MM/YYYY HH:mm") : "--"}</div>
                </div>
              }
            />
            <Divider style={{ margin: "8px 0" }} />
            <Collapse>
              <Panel header="Ver productos" key="1">
                {item.products.map((product, idx) => (
                  <div key={idx} style={{ marginBottom: 4 }}>
                    <strong>{product.name}</strong> - ${product.price} x {product.qty}
                  </div>
                ))}
              </Panel>
            </Collapse>
          </List.Item>
        )}
      />
    </div>
  );
}

export default ClosedOrders;
