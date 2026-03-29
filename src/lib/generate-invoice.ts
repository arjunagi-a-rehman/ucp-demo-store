import { jsPDF } from "jspdf";

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

interface InvoiceData {
  orderId: string;
  date: string;
  buyerEmail: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  items: InvoiceItem[];
  total: number;
  razorpayPaymentId?: string;
}

export function generateInvoice(data: InvoiceData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("UCP Demo Store", 20, y);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Tax Invoice", pageWidth - 20, y, { align: "right" });
  y += 12;

  // Divider
  doc.setDrawColor(200);
  doc.line(20, y, pageWidth - 20, y);
  y += 12;

  // Order info
  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice Details", 20, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  doc.text(`Order ID: ${data.orderId}`, 20, y);
  doc.text(`Date: ${data.date}`, pageWidth - 20, y, { align: "right" });
  y += 6;
  doc.text(`Email: ${data.buyerEmail}`, 20, y);
  y += 6;
  if (data.razorpayPaymentId) {
    doc.text(`Payment ID: ${data.razorpayPaymentId}`, 20, y);
    y += 6;
  }

  // Shipping address
  if (data.shippingAddress) {
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60);
    doc.text("Ship To", 20, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text(data.shippingAddress.street, 20, y);
    y += 5;
    doc.text(
      `${data.shippingAddress.city}, ${data.shippingAddress.state} - ${data.shippingAddress.zip}`,
      20,
      y
    );
    y += 6;
  }

  y += 6;

  // Table header
  doc.setFillColor(245, 245, 245);
  doc.rect(20, y - 1, pageWidth - 40, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40);
  doc.setFontSize(9);
  doc.text("Item", 24, y + 5);
  doc.text("Qty", 120, y + 5);
  doc.text("Price", 140, y + 5);
  doc.text("Amount", pageWidth - 24, y + 5, { align: "right" });
  y += 12;

  // Table rows
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60);
  data.items.forEach((item) => {
    const amount = item.price * item.quantity;
    doc.text(item.name, 24, y);
    doc.text(String(item.quantity), 124, y);
    doc.text(`₹${item.price.toLocaleString("en-IN")}`, 140, y);
    doc.text(`₹${amount.toLocaleString("en-IN")}`, pageWidth - 24, y, {
      align: "right",
    });
    y += 7;
  });

  // Divider
  y += 2;
  doc.setDrawColor(200);
  doc.line(20, y, pageWidth - 20, y);
  y += 8;

  // Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Total", 24, y);
  doc.text(`₹${data.total.toLocaleString("en-IN")}`, pageWidth - 24, y, {
    align: "right",
  });

  y += 20;

  // Footer
  doc.setDrawColor(200);
  doc.line(20, y, pageWidth - 20, y);
  y += 8;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(140);
  doc.text("Thank you for shopping with UCP Demo Store!", pageWidth / 2, y, {
    align: "center",
  });
  y += 5;
  doc.text(
    "This is a computer-generated invoice and does not require a signature.",
    pageWidth / 2,
    y,
    { align: "center" }
  );

  // Save
  doc.save(`Invoice-${data.orderId}.pdf`);
}
