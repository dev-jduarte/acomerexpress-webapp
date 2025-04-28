import React, { useEffect, useState } from "react";
import { useFirestoreCRUD } from "../hooks/useFirestoreCrud";
import { List, Divider, Collapse, DatePicker, Space, Row, Col, Input } from "antd";
import moment from "moment";

const { Panel } = Collapse;
const { RangePicker } = DatePicker;

function CloseDay() {
  const { data: orders, updateDocument, refetch } = useFirestoreCRUD("orders", false);
  const [dateRange, setDateRange] = useState(null);
  const [paymentData, setPaymentData] = useState({
    EFECTIVODOLAR: 0,
    EFECTIVOBS: 0,
    PAGOMOVIL: 0,
    ZELLE: 0,
    BINANCE: 0,
    PUNTODEVENTA: 0,
    COFEELOVERS: 0,
  });
  const [userPaymentData, setUserPaymentData] = useState({
    EFECTIVODOLAR: 0,
    EFECTIVOBS: 0,
    PAGOMOVIL: 0,
    ZELLE: 0,
    BINANCE: 0,
    PUNTODEVENTA: 0,
    COFEELOVERS: 0,
  });
  const handleDateRangeChange = async (dates) => {
    debugger
    setDateRange(dates);
    if (dates && dates.length === 2) {
      const orders = await refetch({
        status: "closed",
        date: {
          start: moment(dates[0].toDate()).format(),
          end: moment(dates[1].toDate()).format(),
        },
      });
      debugger
      const payData = {};
      orders.map((order) => {
        order.payments.map((payment) => {
          const key = [payment.method];
          payData[key] = (payData[key] || 0) + payment.amount;
        });
      });

      setPaymentData(payData);
    } else {
      refetch({ status: "closed" });
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 16 }}>
      <h2>Cierre de caja</h2>

      <Space direction="vertical" style={{ marginBottom: 16, width: "100%" }}>
        <RangePicker showTime format="DD/MM/YYYY HH:mm" onChange={handleDateRangeChange} style={{ width: "100%" }} placeholder={["Fecha de inicio", "Fecha de fin"]} />
      </Space>
      <Row>
        <Col>
          {Object.keys(paymentData).map((key) => {
            <Input title={key} value={paymentData[key]} />;
          })}
        </Col>
        <Col></Col>
      </Row>
    </div>
  );
}

export default CloseDay;
