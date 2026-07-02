"use client";

import { ShipmentsPage } from "@/components/staff/staff-pages";

export default function CourierDeliveriesRoute() {
  return (
    <ShipmentsPage
      filter={(shipment) =>
        shipment.status === "arrived_at_branch"
      }
      mode="courier"
    />
  );
}
