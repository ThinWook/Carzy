'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { endpoints } from '@/config/api'
import VehicleCard from '@/components/VehicleCard'
import axios from 'axios'

// Định nghĩa kiểu dữ liệu theo cấu trúc mới từ API
interface Vehicle {
  _id: string;
  title: string;
  price: number;
  year: number;
  mileage: number;
  images: string[];
  location: string;
  user: {
    _id?: string;
    name?: string;
    full_name?: string;
    email?: string;
    phone?: string;
    phone_number?: string;
    avatar_url?: string;
    rating?: number;
  };
  type: string;
  make: string;
  model: string;
  created_at?: string;
  updatedAt?: string;
  createdAt?: string;
  status?: string;
}

// Tạo mapping cho loại xe sang tiếng Việt
const vehicleTypeMap = {
  car: 'Ô tô',
  motorcycle: 'Xe máy',
  bicycle: 'Xe đạp'
}

// Tạo mapping cho tình trạng xe sang tiếng Việt
const conditionMap = {
  new: 'Mới',
  like_new: 'Như mới',
  good: 'Tốt',
  fair: 'Bình thường',
  poor: 'Kém'
}

// Map tên màu sang mã màu CSS
const colorMap: Record<string, string> = {
  'red': '#FF0000',
  'blue': '#0000FF',
  'green': '#008000',
  'yellow': '#FFFF00',
  'orange': '#FFA500',
  'purple': '#800080',
  'pink': '#FFC0CB',
  'brown': '#A52A2A',
  'black': '#000000',
  'white': '#FFFFFF',
  'gray': '#808080',
  'silver': '#C0C0C0',
  'gold': '#FFD700',
  'beige': '#F5F5DC',
  'navy': '#000080',
  'teal': '#008080',
  'olive': '#808000',
  'maroon': '#800000',
  'đỏ': '#FF0000',
  'xanh dương': '#0000FF',
  'xanh lá': '#008000',
  'vàng': '#FFFF00',
  'cam': '#FFA500',
  'tím': '#800080',
  'hồng': '#FFC0CB',
  'nâu': '#A52A2A',
  'đen': '#000000',
  'trắng': '#FFFFFF',
  'xám': '#808080',
  'bạc': '#C0C0C0',
  'vàng kim': '#FFD700',
  'be': '#F5F5DC',
  'xanh đen': '#000080',
  'xanh ngọc': '#008080',
  'xanh oliu': '#808000',
  'đỏ đậm': '#800000',
}

export default function VehicleList() {
  // State để lưu danh sách xe
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rawData, setRawData] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)
  
  // Filters
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000000])
  const [yearRange, setYearRange] = useState<[number, number]>([1990, new Date().getFullYear()])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [condition, setCondition] = useState<'all' | 'new' | 'used'>('all')
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [selectedEngineCapacity, setSelectedEngineCapacity] = useState<string | null>(null)
  
  // Available filter options
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(1000000000)
  const [minYear, setMinYear] = useState(1990)
  const [maxYear, setMaxYear] = useState(new Date().getFullYear())

  // Locations and engine capacity options
  const locationOptions = [
    'Tp Hồ Chí Minh',
    'Hà Nội',
    'Đà Nẵng',
    'Cần Thơ',
    'Bình Dương',
  ]
  
  const engineCapacityOptions = [
    'Trên 175 cc',
    '100 - 175 cc',
    '50 - 100 cc',
    'Dưới 50 cc'
  ]

  // Add brand options:
  const brandOptions = [
    { name: 'Toyota', image: '/toyota-logo.png' },
    { name: 'Ford', image: '/ford-logo.png' },
    { name: 'Mitsubishi', image: '/mitsubishi-logo.png' },
    { name: 'Hyundai', image: '/hyundai-logo.png' },
    { name: 'Honda', image: '/honda-logo.png' },
    { name: 'Mercedes Benz', image: '/mercedes-logo.png' },
    { name: 'Audi', image: '/audi-logo.png' },
    { name: 'Kia', image: '/kia-logo.png' },
    { name: 'Mazda', image: '/mazda-logo.png' },
    { name: 'VinFast', image: '/vinfast-logo.png' },
  ]

  // Hàm lấy mã màu từ tên màu
  const getColorCode = (colorName: string | undefined): string => {
    // Kiểm tra colorName có tồn tại không
    if (!colorName) {
      return '#CCCCCC'; // Trả về màu xám mặc định nếu không có màu
    }
    
    // Chuyển về chữ thường để tìm kiếm
    const lowerCaseColor = colorName.toLowerCase();
    
    // Kiểm tra xem có trong mapping không
    if (colorMap[lowerCaseColor]) {
      return colorMap[lowerCaseColor];
    }
    
    // Nếu không tìm thấy, trả về màu nguyên bản
    return lowerCaseColor;
  };

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        // In ra endpoint để debug
        console.log('Fetching from:', endpoints.vehicles.list);
        
        const response = await axios.get('/api/vehicles')
        if (!response.ok) {
          throw new Error(`Failed to fetch vehicles: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        // Lưu raw data để debug
        setRawData(data);
        
        // Kiểm tra xem dữ liệu có thuộc tính vehicles là một mảng không
        if (data && data.vehicles && Array.isArray(data.vehicles)) {
          console.log('Received vehicles data:', data.vehicles.length, 'vehicles');
          
          const vehiclesData = data.vehicles;
          setVehicles(vehiclesData);
          setFilteredVehicles(vehiclesData);
          setError(null);
          
          // Extract filter options from data
          const brands = [...new Set(vehiclesData.map((vehicle: Vehicle) => vehicle.title))];
          const prices = vehiclesData.map((vehicle: Vehicle) => vehicle.price);
          const years = vehiclesData.map((vehicle: Vehicle) => vehicle.year);
          
          setAvailableBrands(brands);
          
          if (prices.length > 0) {
            setMinPrice(Math.min(...prices));
            setMaxPrice(Math.max(...prices));
          }
          
          if (years.length > 0) {
            setMinYear(Math.min(...years));
            setMaxYear(Math.max(...years));
          }
        } else {
          console.error('API response does not contain vehicles array:', data);
          setError('Dữ liệu xe không đúng định dạng. API trả về dữ liệu không đúng cấu trúc.');
          setVehicles([]);
          setFilteredVehicles([]);
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error)
        setError(`Không thể tải danh sách xe: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false)
      }
    }

    fetchVehicles()
  }, [])
  
  // Apply filters
  useEffect(() => {
    if (vehicles.length > 0) {
      let result = [...vehicles];
      
      // Filter by price
      result = result.filter(vehicle => 
        vehicle.price >= priceRange[0] && vehicle.price <= priceRange[1]
      );
      
      // Filter by year
      result = result.filter(vehicle => 
        vehicle.year >= yearRange[0] && vehicle.year <= yearRange[1]
      );
      
      // Filter by brand
      if (selectedBrands.length > 0) {
        result = result.filter(vehicle => selectedBrands.includes(vehicle.title));
      }
      
      // Filter by condition
      if (condition !== 'all') {
        result = result.filter(vehicle => 
          condition === 'new' ? 
            (vehicle.condition === 'new' || vehicle.isNew) : 
            (vehicle.condition !== 'new' && !vehicle.isNew)
        );
      }
      
      // Filter by location
      if (selectedLocation) {
        result = result.filter(vehicle => 
          vehicle.location && vehicle.location.includes(selectedLocation)
        );
      }
      
      // Filter by engine capacity
      if (selectedEngineCapacity) {
        if (selectedEngineCapacity === 'Trên 175 cc') {
          result = result.filter(vehicle => 
            vehicle.mileage && vehicle.mileage > 175
          );
        } else if (selectedEngineCapacity === '100 - 175 cc') {
          result = result.filter(vehicle => 
            vehicle.mileage && vehicle.mileage >= 100 && vehicle.mileage <= 175
          );
        } else if (selectedEngineCapacity === '50 - 100 cc') {
          result = result.filter(vehicle => 
            vehicle.mileage && vehicle.mileage >= 50 && vehicle.mileage < 100
          );
        } else if (selectedEngineCapacity === 'Dưới 50 cc') {
          result = result.filter(vehicle => 
            vehicle.mileage && vehicle.mileage < 50
          );
        }
      }
      
      setFilteredVehicles(result);
    }
  }, [vehicles, priceRange, yearRange, selectedBrands, condition, selectedLocation, selectedEngineCapacity]);

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand) 
        : [...prev, brand]
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center max-w-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Lỗi</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          
          <div className="flex justify-center gap-3 mb-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Thử lại
            </button>
            
            <button 
              onClick={() => setShowDebug(!showDebug)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              {showDebug ? 'Ẩn chi tiết' : 'Xem chi tiết lỗi'}
            </button>
          </div>
          
          {showDebug && (
            <div className="mt-4 bg-gray-100 p-4 rounded-md text-left overflow-auto max-h-80">
              <h3 className="font-medium mb-2">Debug info:</h3>
              <p className="text-xs mb-1">API endpoint: {endpoints.vehicles.list}</p>
              <p className="text-xs mb-2">Raw response data:</p>
              <pre className="text-xs bg-gray-800 text-green-400 p-2 rounded overflow-auto">
                {JSON.stringify(rawData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Kiểm tra thêm một lần nữa trước khi render
  if (!Array.isArray(filteredVehicles)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Lỗi dữ liệu</h2>
          <p className="text-gray-700">Dữ liệu xe không đúng định dạng</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-gray-900">All Vehicles</h1>
        <p className="mt-2 text-sm text-gray-500">Browse all available vehicles</p>

        <div className="mt-8 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {filteredVehicles.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">Không có xe nào</h3>
              <p className="mt-1 text-sm text-gray-500">Không tìm thấy xe phù hợp với bộ lọc đã chọn</p>
            </div>
          ) : (
            filteredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle._id || `vehicle-${vehicle.title}-${Math.random()}`} vehicle={vehicle} />
            ))
          )}
        </div>
      </div>
    </div>
  )
} 