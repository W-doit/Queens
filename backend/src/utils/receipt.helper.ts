// Receipt formatting helper

// Receipt formatting helper

// Receipt formatting helper

import { ReceiptResponse } from "../types/pos";

/**
 * Format raw data into the receipt response
 */
export function formatReceiptData(
  order: any,
  lines: any[],
  payments: any[],
  company: any
): ReceiptResponse {
  return {
    company: {
      name: company.name,
      address: `${company.street || ""}, ${company.city || ""} ${
        company.zip || ""
      }`,
      vat: company.vat || "",
      phone: company.phone || "",
      email: company.email || "",
    },
    order: {
      id: order.id,
      name: order.name,
      date: new Date(order.date_order).toLocaleString(),
      reference: order.pos_reference,
      customer: order.partner_id ? order.partner_id[1] : "Walk-in Customer",
    },
    lines: lines.map((line) => ({
      product: line.product_id[1],
      quantity: line.qty,
      unit_price: line.price_unit,
      discount: line.discount,
      subtotal: line.price_subtotal_incl,
    })),
    payments: payments.map((payment) => ({
      method: payment.payment_method_id[1],
      amount: payment.amount,
    })),
    totals: {
      subtotal: order.amount_total - order.amount_tax,
      tax: order.amount_tax,
      total: order.amount_total,
    },
  };
}

/**
 * Generate HTML receipt
 */
export function generateHtmlReceipt(receipt: ReceiptResponse): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Receipt - ${receipt.order.name}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          width: 80mm;
        }
        .receipt {
          padding: 10px;
        }
        .header {
          text-align: center;
          margin-bottom: 10px;
        }
        .company-name {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 5px;
        }
        .info {
          text-align: center;
          margin-bottom: 10px;
          font-size: 12px;
        }
        .divider {
          border-top: 1px dashed #000;
          margin: 10px 0;
        }
        .order-info {
          font-size: 12px;
          margin-bottom: 10px;
        }
        .items {
          font-size: 12px;
        }
        .item {
          margin-bottom: 5px;
        }
        .item-detail {
          display: flex;
          justify-content: space-between;
        }
        .totals {
          margin-top: 10px;
          font-size: 12px;
        }
        .total-line {
          display: flex;
          justify-content: space-between;
        }
        .grand-total {
          font-weight: bold;
          margin-top: 5px;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          margin-top: 10px;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div class="company-name">${receipt.company.name}</div>
          <div class="info">${receipt.company.address}</div>
          ${
            receipt.company.vat
              ? `<div class="info">VAT: ${receipt.company.vat}</div>`
              : ""
          }
          ${
            receipt.company.phone
              ? `<div class="info">Tel: ${receipt.company.phone}</div>`
              : ""
          }
        </div>
        
        <div class="divider"></div>
        
        <div class="order-info">
          <div>Receipt: ${receipt.order.name}</div>
          <div>Date: ${receipt.order.date}</div>
          <div>Customer: ${receipt.order.customer}</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="items">
          ${receipt.lines
            .map(
              (line) => `
            <div class="item">
              <div>${line.product}</div>
              <div class="item-detail">
                <span>${line.quantity} x ${line.unit_price.toFixed(2)}${
                line.discount > 0 ? ` (-${line.discount}%)` : ""
              }</span>
                <span>${line.subtotal.toFixed(2)}</span>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        
        <div class="divider"></div>
        
        <div class="totals">
          <div class="total-line">
            <span>Subtotal:</span>
            <span>${receipt.totals.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-line">
            <span>Tax:</span>
            <span>${receipt.totals.tax.toFixed(2)}</span>
          </div>
          <div class="total-line grand-total">
            <span>TOTAL:</span>
            <span>${receipt.totals.total.toFixed(2)}</span>
          </div>
          
          <div style="margin-top: 10px;">
            ${receipt.payments
              .map(
                (payment) => `
              <div class="total-line">
                <span>${payment.method}:</span>
                <span>${payment.amount.toFixed(2)}</span>
              </div>
            `
              )
              .join("")}
            
            ${
              receipt.payments.length > 0 &&
              receipt.payments[0].amount > receipt.totals.total
                ? `
              <div class="total-line">
                <span>Change:</span>
                <span>${(
                  receipt.payments[0].amount - receipt.totals.total
                ).toFixed(2)}</span>
              </div>
            `
                : ""
            }
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="footer">
          Thank you for your purchase!
        </div>
      </div>
    </body>
    </html>
  `;
}
