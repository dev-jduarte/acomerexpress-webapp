import React, { useRef } from "react";
import { Button } from "antd";

const ComandaTicket = ({ cliente, pedido = [], total, mesonero, zona, notes, date }) => {

  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current;

    const printWindow = window.open("", "", "width=600,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Comanda - A Comer Express</title>
          <style>
            @media print {
              @page {
                size: 58mm auto;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
              }
              .ticket {
                width: 100%;
                padding: 5mm;
                font-family: Arial, sans-serif;
                font-size: 12px;
                break-inside: avoid;
                page-break-inside: avoid;
              }
              h2 {
                text-align: center;
                font-size: 16px;
                margin: 0 0 10px 0;
              }
              .line {
                margin: 4px 0;
              }
              .product {
                display: flex;
                justify-content: space-between;
                margin: 2px 0;
              }
              .footer {
                margin-top: 10px;
                font-weight: bold;
              }
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <>
      {/* Contenido oculto para impresión */}
      <div ref={printRef} style={{ display: "none" }}>
        <div className="line">
            <strong>A Comer Express</strong>
        </div>
        <div className="line">
          <strong>Cliente:</strong> {cliente}
        </div>
        <div className="line">
          <strong>Pedido:</strong>
        </div>
        <div>
          {pedido.map((item) => (
            <div key={item.id} className="product">
              <span>
                {item.qty}x {item.name}
              </span>
              <span>${(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="line">
          <strong>Notas:</strong> {notes}
        </div>
        <div className="line footer">
          <strong>Total:</strong> ${parseFloat(total).toFixed(2)}
        </div>
        <div className="line">
          <strong>Mesonero:</strong> {mesonero}
        </div>
        <div className="line">
          <strong>Zona:</strong> {zona}
        </div>
        <div className="line">
          <strong>Fecha:</strong> {date}
        </div>
      </div>

      {/* Botón para imprimir */}
      <Button type="dashed" onClick={handlePrint}>
        Imprimir Comanda
      </Button>
    </>
  );
};

export default ComandaTicket;
