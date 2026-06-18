export type PublicBranch = {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
};

export type PublicRate = {
  id: string;
  origin_city: string;
  destination_city: string;
  price_per_kg: string;
  estimated_days: number;
};

export type PublicShipment = {
  id: string;
  tracking_number: string;
  status: string;
  shipment_date?: string;
  branches_shipments_origin_branch_idTobranches?: PublicBranch;
  branches_shipments_destination_branch_idTobranches?: PublicBranch;
  shipment_trackings?: Array<{
    id: string;
    status: string;
    location: string;
    description?: string | null;
    tracked_at: string;
  }>;
};

export const fallbackBranches: PublicBranch[] = [
  {
    id: "1",
    name: "Cabang Jakarta",
    city: "Jakarta",
    address: "Jl. Logistik Raya No. 10, Jakarta",
    phone: "021-555-0199",
  },
  {
    id: "2",
    name: "Cabang Depok",
    city: "Depok",
    address: "Jl. Margonda Raya No. 20, Depok",
    phone: "021-765-432",
  },
  {
    id: "3",
    name: "Cabang Bogor",
    city: "Bogor",
    address: "Jl. Pajajaran No. 30, Bogor",
    phone: "0251-838-383",
  },
  {
    id: "4",
    name: "Cabang Bekasi",
    city: "Bekasi",
    address: "Jl. Ahmad Yani No. 45, Bekasi",
    phone: "021-884-1122",
  },
];
