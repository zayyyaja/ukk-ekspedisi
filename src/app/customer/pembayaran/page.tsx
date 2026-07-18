import { CustomerOrderList } from "@/components/customer/customer-order-list";

export default function PembayaranPage() {
  return (
    <CustomerOrderList 
      title="Pembayaran & Tagihan" 
      description="Kelola invoice belum dibayar, selesaikan pembayaran tertunda, dan tinjau riwayat tagihan Anda."
      defaultPaymentStatus="pending"
      variant="payments"
    />
  );
}
