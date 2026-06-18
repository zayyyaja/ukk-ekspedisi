export type Branch = {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
};

export type StaffRole = "admin" | "cashier" | "courier" | "manager";

export type CurrentUser = {
  id: number | string;
  type?: string;
  role: StaffRole | "customer";
  name: string;
  email: string;
  branchId?: number | null;
  phone?: string | null;
  city?: string | null;
  address?: string | null;
  photo?: string | null;
};

export type Rate = {
  id: string;
  origin_city: string;
  destination_city: string;
  price_per_kg: string;
  estimated_days: number;
};

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  branch_id?: string | null;
  is_active: boolean;
  created_at: string;
};

export type Vehicle = {
  id: string;
  plate_number: string;
  type: string;
  courier_id: string;
  users?: StaffUser;
};

export type DashboardSummary = {
  totalCustomers: number;
  totalStaff: number;
  totalBranches: number;
  totalVehicles: number;
  totalShipments: number;
  totalPendingShipment: number;
  totalDeliveredShipment: number;
  totalRevenue: number;
  todayRevenue?: number;
  monthlyRevenue?: number;
  shipmentChart: Record<string, number>;
  paymentChart: Record<string, number>;
  recentShipments: Shipment[];
  recentPayments: Payment[];
};

export type CustomerRecord = {
  id: string;
  name: string;
  email: string;
  city: string;
  phone: string;
  address?: string | null;
  is_verified: boolean;
  created_at: string;
};

export type ShipmentItem = {
  id: string;
  item_name: string;
  quantity: number;
  weight: string;
  photo?: string | null;
};

export type Payment = {
  id: string;
  amount: string;
  payment_method: string;
  payment_status: string;
  payment_date?: string | null;
  transaction_reference?: string | null;
  shipments?: Shipment;
};

export type Tracking = {
  id: string;
  location: string;
  description?: string | null;
  status: string;
  tracked_at: string;
};

export type CustomerMini = {
  id: string;
  name: string;
  email: string;
  city: string;
  phone: string;
};

export type Shipment = {
  id: string;
  tracking_number: string;
  status: string;
  handover_method: string;
  total_weight: string;
  total_price: string;
  shipment_date: string;
  paid_at?: string | null;
  delivered_at?: string | null;
  customers_shipments_sender_idTocustomers?: CustomerMini;
  customers_shipments_receiver_idTocustomers?: CustomerMini;
  branches_shipments_origin_branch_idTobranches?: Branch;
  branches_shipments_destination_branch_idTobranches?: Branch;
  rates?: Rate;
  users?: StaffUser | null;
  shipment_items?: ShipmentItem[];
  payments?: Payment | null;
  shipment_trackings?: Tracking[];
};
