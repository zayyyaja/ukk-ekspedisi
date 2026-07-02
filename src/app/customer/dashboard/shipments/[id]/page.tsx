import { redirect } from "next/navigation";

export default async function CustomerShipmentDetailLegacyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/customer/pesanan/${id}`);
}
