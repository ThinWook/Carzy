import { FilterProps } from '@/types';
import { endpoints } from '@/config/api';

export const calculateCarRent = (price: number) => {
  const carPrice = price;
  const mileageCost = 0.1;
  const ageCost = 0.05;
  const totalCost = carPrice + (carPrice * mileageCost) + (carPrice * ageCost);
  return totalCost.toFixed(0);
};

export const generateVehicleImageUrl = (brand: string, model: string) => {
  const url = new URL('https://cdn.imagin.studio/getimage');
  url.searchParams.append('customer', 'hrjavascript-mastery');
  url.searchParams.append('make', brand);
  url.searchParams.append('modelFamily', model.split(' ')[0]);
  url.searchParams.append('zoomType', 'fullscreen');
  url.searchParams.append('modelYear', `${new Date().getFullYear()}`);
  url.searchParams.append('angle', '33');

  return `${url}`;
};

export const updateSearchParams = (type: string, value: string) => {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set(type, value);
  const newPathname = `${window.location.pathname}?${searchParams.toString()}`;
  return newPathname;
};

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const fetchVehicles = async (filters: FilterProps): Promise<PaginationResult<any>> => {
  const { manufacturer, year, fuel, limit = 10, page = 1, model, search } = filters;

  const params: Record<string, string> = {
    manufacturer: manufacturer || '',
    year: year ? year.toString() : '',
    fuel: fuel || '',
    limit: limit.toString(),
    page: page.toString(),
    model: model || '',
    search: search || '',
  };

  // Remove empty params
  Object.keys(params).forEach((key) => 
    params[key] === '' && delete params[key]
  );

  const response = await fetch(
    `${endpoints.vehicles.list}?${new URLSearchParams(params)}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch vehicles');
  }

  const result = await response.json();
  
  // Handle both old and new API response format
  if (result.vehicles && result.pagination) {
    return {
      data: result.vehicles,
      pagination: result.pagination
    };
  }
  
  // Legacy format handling
  return { 
    data: Array.isArray(result) ? result : [], 
    pagination: {
      total: Array.isArray(result) ? result.length : 0,
      page: 1,
      limit: 10,
      pages: 1
    }
  };
};

export { fetchVehicles }; 