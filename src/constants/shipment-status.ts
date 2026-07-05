export const SHIPMENT_STATUS = {
  pending: "pending",
  pickedUp: "picked_up",
  inTransit: "in_transit",
  arrivedAtBranch: "arrived_at_branch",
  outForDelivery: "out_for_delivery",
  delivered: "delivered",
  cancelled: "cancelled",
} as const;

export type ShipmentStatus =
  (typeof SHIPMENT_STATUS)[keyof typeof SHIPMENT_STATUS];

export const SHIPMENT_STATUS_TRANSITIONS: Record<
  ShipmentStatus,
  ShipmentStatus[]
> = {
  pending: ["picked_up", "cancelled"],
  picked_up: ["in_transit", "cancelled"],
  in_transit: ["arrived_at_branch", "cancelled"],
  arrived_at_branch: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export function canTransitionShipmentStatus(
  currentStatus: ShipmentStatus,
  nextStatus: ShipmentStatus,
) {
  return SHIPMENT_STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
}
