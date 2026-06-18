"use client";

import { ShipmentsPage } from "@/components/staff/staff-pages";

export default function CourierPickupsRoute() {
  return (
    <ShipmentsPage
      filter={(shipment) =>
        shipment.handover_method === "pickup" && shipment.status === "pending"
      }
      mode="courier"
    />
  );
}
