import type { Shipment } from "@/types/customer-portal";

export const PACKAGE_CARD_FALLBACK = "/images/package-card.jpg";

export function getShipmentPackagePhoto(
  shipment: Pick<Shipment, "shipment_items">,
) {
  return shipment.shipment_items?.[0]?.photo ?? null;
}

export function getShipmentCoverPhoto(
  shipment: Pick<Shipment, "shipment_items">,
) {
  return getShipmentPackagePhoto(shipment) ?? PACKAGE_CARD_FALLBACK;
}

export function getShipmentDeliveryProof(
  shipment: Pick<Shipment, "status" | "photo">,
) {
  if (shipment.status !== "delivered") {
    return null;
  }

  return shipment.photo ?? null;
}
