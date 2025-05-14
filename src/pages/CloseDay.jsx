import React, { useEffect, useState } from "react";
import { useFirestoreCRUD } from "../hooks/useFirestoreCrud";
import { List, Divider, Collapse, DatePicker, Space, Row, Col, Input, Typography } from "antd";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function CloseDay({ user }) {
  const { data: orders, updateDocument, refetch } = useFirestoreCRUD("orders", false);
  const [dateRange, setDateRange] = useState(null);

  const initialPaymentState = {
    EFECTIVODOLAR: 0,
    EFECTIVOBS: 0,
    PAGOMOVIL: 0,
    ZELLE: 0,
    BINANCE: 0,
    PUNTODEVENTA: 0,
    //COFFEELOVERS: 0,
  };

  const [paymentData, setPaymentData] = useState(initialPaymentState);
  const [userPaymentData, setUserPaymentData] = useState(initialPaymentState);
  const navigate = useNavigate();

  const handleDateRangeChange = async (dates) => {
    setDateRange(dates);
    if (dates && dates.length === 2) {
      const orders = await refetch({
        status: "closed",
        date: {
          start: moment(dates[0].toDate()).format(),
          end: moment(dates[1].toDate()).format(),
        },
      });

      const payData = { ...initialPaymentState };

      orders.forEach((order) => {
        order?.payments?.forEach((payment) => {
          const key = payment.method;
          payData[key] = (payData[key] || 0) + payment.amount;
        });
      });

      setPaymentData(payData);
      //setUserPaymentData(payData);
    } else {
      refetch({ status: "closed" });
    }
  };

  const handleUserPaymentChange = (key, value) => {
    setUserPaymentData((prev) => ({
      ...prev,
      [key]: Number(value),
    }));
  };

  const totalSystem = Object.values(paymentData).reduce((acc, val) => acc + val, 0);
  const totalUser = Object.values(userPaymentData).reduce((acc, val) => acc + val, 0);

  const totalFinal = totalUser;
  const totalDifference = totalFinal - totalSystem;

  useEffect(() => {
    if (user != "CAJA") {
      navigate("/");
    }
  });

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
      <Title level={2}>Cierre de caja</Title>

      <Space direction="vertical" style={{ marginBottom: 16, width: "100%" }}>
        <RangePicker showTime format="DD/MM/YYYY HH:mm" onChange={handleDateRangeChange} style={{ width: "100%" }} placeholder={["Fecha de inicio", "Fecha de fin"]} />
      </Space>

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col span={8}>
          <Text strong>Método</Text>
        </Col>
        <Col span={6}>
          <Text strong>Sistema</Text>
        </Col>
        <Col span={5}>
          <Text strong>Usuario</Text>
        </Col>
      </Row>

      {Object.keys(paymentData).map((key) => {
        const systemValue = paymentData[key] || 0;
        const userValue = userPaymentData[key] || 0;

        return (
          <Row key={key} gutter={[16, 16]} align="middle" style={{ marginBottom: 8 }}>
            <Col span={8}>
              <Text>{key}</Text>
            </Col>
            <Col span={6}>
              <Input value={systemValue.toFixed(2)} disabled style={{ textAlign: "right" }} suffix="Bs/$" />
            </Col>
            <Col span={5}>
              <Input type="number" value={userValue} onChange={(e) => handleUserPaymentChange(key, e.target.value)} style={{ textAlign: "right" }} suffix="Bs/$" />
            </Col>
          </Row>
        );
      })}

      <Divider />

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Title level={4}>Totales</Title>
        <Text strong>Sistema: {totalSystem.toFixed(2)}</Text>
        <br />
        <Text strong>Usuario: {totalUser.toFixed(2)}</Text>
        <br />
        <Text strong>Total Final: {totalFinal.toFixed(2)}</Text>
        <br />
        <Text type={totalDifference === 0 ? "success" : "danger"}>Diferencia global: {totalDifference.toFixed(2)}</Text>
      </div>
    </div>
  );
}

export default CloseDay;
