export interface Vehicle {
  _id: string;
  type: 'car' | 'motorcycle' | 'bicycle' | 'truck' | 'other';
  make: string;
  brand?: string;
  model: string;
  year: number;
  price: number;
  description: string;
  title?: string;
  images: string[];
  condition: string;
  mileage?: number;
  location: string;
  body_type?: string;
  engine_capacity?: string;
  fuel_type?: string;
  transmission?: string;
  created_at?: string;
  user: {
    _id?: string;
    name?: string;
    full_name?: string; 
    email?: string;
    phone?: string;
    phone_number?: string;
    avatar_url?: string;
    rating?: number;
    address?: string;
    joined_date?: string;
    verified?: boolean;
    total_listings?: number;
    total_sales?: number;
    description?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  updated_at?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'sold' | 'removed';
  views_count?: number;
}

export interface FilterProps {
  manufacturer?: string;
  year?: number;
  fuel?: string;
  limit?: number;
  page?: number;
  model?: string;
  search?: string;
}

export interface OptionProps {
  title: string;
  value: string;
}

export interface CustomFilterProps {
  title: string;
  options: OptionProps[];
  setFilter?: (value: any) => void;
}

export interface ShowMoreProps {
  pageNumber: number;
  isNext: boolean;
}

export interface SearchManufacturerProps {
  manufacturer: string;
  setManufacturer: (manufacturer: string) => void;
}