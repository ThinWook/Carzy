'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { vehicleApi } from '@/services/vehicleApi'
import { Vehicle } from '@/types'
import FavoriteButton from '@/components/FavoriteButton'

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

export default function VehicleTypeList() {
  const { type } = useParams()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000])
  const [yearRange, setYearRange] = useState<[number, number]>([1990, new Date().getFullYear()])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [condition, setCondition] = useState<'all' | 'new' | 'used'>('all')
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [selectedEngineCapacity, setSelectedEngineCapacity] = useState<string | null>(null)
  const [selectedBicycleType, setSelectedBicycleType] = useState<string | null>(null)

  // Available filter options
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(1000000)
  const [minYear, setMinYear] = useState(1990)
  const [maxYear, setMaxYear] = useState(new Date().getFullYear())

  // Locations and brand options
  const locationOptions = [
    'Tp Hồ Chí Minh',
    'Hà Nội',
    'Đà Nẵng',
    'Cần Thơ',
    'Bình Dương',
  ]

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

  const engineCapacityOptions = [
    'Trên 175 cc',
    '100 - 175 cc',
    '50 - 100 cc',
    'Dưới 50 cc'
  ]

  // Add bicycle type options
  const bicycleTypeOptions = [
    'Xe đạp thể thao',
    'Xe đạp phổ thông',
    'Xe đạp trẻ em',
    'Xe đạp khác'
  ]

  // Add bicycle brand options
  const bicycleBrandOptions = [
    { name: 'Asama', image: '/asama-logo.png' },
    { name: 'Giant', image: '/giant-logo.png' },
    { name: 'Martin', image: '/martin-logo.png' },
    { name: 'Thống Nhất', image: '/thong-nhat-logo.png' },
    { name: 'Galaxy', image: '/galaxy-logo.png' },
    { name: 'Xe Đạp Gấp', image: '/folding-bike-logo.png' },
    { name: 'Jett', image: '/jett-logo.png' },
    { name: 'Trinx', image: '/trinx-logo.png' },
  ]

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setIsLoading(true);
        const data = await vehicleApi.getByType(type as string);
        setVehicles(data);

        // Extract filter options from data
        const brands = Array.from(new Set(data.map((vehicle: Vehicle) => vehicle.brand || vehicle.make))) as string[];
        const prices = data.map((vehicle: Vehicle) => vehicle.price);
        const years = data.map((vehicle: Vehicle) => vehicle.year);

        setAvailableBrands(brands);
        
        if (prices.length > 0) {
          setMinPrice(Math.min(...prices));
          setMaxPrice(Math.max(...prices));
          setPriceRange([Math.min(...prices), Math.max(...prices)]);
        }
        
        if (years.length > 0) {
          setMinYear(Math.min(...years));
          setMaxYear(Math.max(...years));
          setYearRange([Math.min(...years), Math.max(...years)]);
        }

        setFilteredVehicles(data);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        // Dữ liệu mẫu khi không kết nối được với API
        const sampleData: Vehicle[] = [
          {
            _id: '1',
            type: type as 'car' | 'motorcycle' | 'bicycle',
            make: type === 'motorcycle' ? 'Honda' : (type === 'car' ? 'Toyota' : 'Giant'),
            model: type === 'motorcycle' ? 'CB' : (type === 'car' ? 'Camry' : 'ATX'),
            title: type === 'motorcycle' ? 'Honda CB chạy chuẩn 10000km' : 
                  (type === 'car' ? 'Toyota Camry 2.5Q 2022' : 'Xe đạp thể thao Giant ATX 2022'),
            year: 2023,
            price: type === 'motorcycle' ? 80000000 : (type === 'car' ? 950000000 : 8000000),
            mileage: type === 'motorcycle' ? 10000 : (type === 'car' ? 5000 : undefined),
            location: 'Tp Hồ Chí Minh',
            condition: 'used',
            description: 'Xe đẹp, chính chủ sử dụng',
            images: [],
            createdAt: new Date().toISOString(),
            user: {
              name: 'Người bán mẫu',
              email: 'seller@example.com',
              phone: '0123456789',
              avatar_url: '/user-avatar.png',
              rating: 5.0,
              address: 'Hà Nội',
              joined_date: '2023-01-01',
              verified: true,
              total_listings: 10,
              total_sales: 50000000,
              description: 'Người bán mẫu có 10 lượt bán và tổng doanh thu 50 triệu đồng'
            }
          },
          {
            _id: '2',
            type: type as 'car' | 'motorcycle' | 'bicycle',
            make: type === 'motorcycle' ? 'Yamaha' : (type === 'car' ? 'Ford' : 'Asama'),
            model: type === 'motorcycle' ? 'Exciter' : (type === 'car' ? 'Ranger' : 'MTB'),
            title: type === 'motorcycle' ? 'Yamaha Exciter 155 VVA 2022' : 
                  (type === 'car' ? 'Ford Ranger XLS 2.2L 4x2 AT 2023' : 'Xe đạp Asama MTB 2022'),
            year: 2022,
            price: type === 'motorcycle' ? 55000000 : (type === 'car' ? 850000000 : 5000000),
            mileage: type === 'motorcycle' ? 5000 : (type === 'car' ? 8000 : undefined),
            location: 'Hà Nội',
            condition: 'used',
            description: 'Xe đẹp, ít sử dụng',
            images: [],
            createdAt: new Date().toISOString(),
            user: {
              name: 'Người bán mẫu 2',
              email: 'seller2@example.com',
              phone: '0987654321',
              avatar_url: '/user-avatar.png',
              rating: 4.5,
              address: 'Hà Nội',
              joined_date: '2023-02-01',
              verified: true,
              total_listings: 5,
              total_sales: 25000000,
              description: 'Người bán mẫu 2 có 5 lượt bán và tổng doanh thu 25 triệu đồng'
            }
          }
        ];
        
        setVehicles(sampleData);
        
        // Extract sample filter options
        const brands = Array.from(new Set(sampleData.map(vehicle => vehicle.make || vehicle.brand))) as string[];
        setAvailableBrands(brands);
        
        const prices = sampleData.map(vehicle => vehicle.price);
        if (prices.length > 0) {
          setMinPrice(Math.min(...prices));
          setMaxPrice(Math.max(...prices));
          setPriceRange([Math.min(...prices), Math.max(...prices)]);
        }
        
        const years = sampleData.map(vehicle => vehicle.year);
        if (years.length > 0) {
          setMinYear(Math.min(...years));
          setMaxYear(Math.max(...years));
          setYearRange([Math.min(...years), Math.max(...years)]);
        }
        
        setFilteredVehicles(sampleData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, [type]);

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
        result = result.filter(vehicle => {
          const brandName = vehicle.brand || vehicle.make || '';
          return selectedBrands.includes(brandName);
        });
      }
      
      // Filter by condition
      if (condition !== 'all') {
        result = result.filter(vehicle => {
          if (condition === 'new') {
            return vehicle.condition === 'new';
          } else {
            return vehicle.condition !== 'new';
          }
        });
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

      // Filter by bicycle type
      if (selectedBicycleType) {
        result = result.filter(vehicle => 
          vehicle.description && vehicle.description.includes(selectedBicycleType)
        );
      }
      
      setFilteredVehicles(result);
    }
  }, [vehicles, priceRange, yearRange, selectedBrands, condition, selectedLocation, selectedEngineCapacity, selectedBicycleType]);

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  // Add a helper function for date formatting
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '2 phút trước';
    
    // TypeScript sẽ biết ở đây dateString không còn là null hoặc undefined
    const date = new Date(dateString);
    try {
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      return '2 phút trước';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Top filter section for Location and Car Brands - only show for car type */}
      {type === 'car' && (
        <div className="border-b border-gray-200">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            {/* Location filter */}
            <div className="mb-6">
              <div className="flex items-center">
                <div className="text-sm font-medium text-gray-700 mr-8 whitespace-nowrap">Khu vực:</div>
                <div className="flex flex-wrap gap-2">
                  {locationOptions.map((location) => (
                    <button
                      key={location}
                      onClick={() => setSelectedLocation(selectedLocation === location ? null : location)}
                      className={`py-1.5 px-3 rounded-md text-sm ${
                        selectedLocation === location
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {location}
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedLocation(selectedLocation === 'Gần tôi' ? null : 'Gần tôi')}
                    className={`py-1.5 px-3 rounded-md text-sm flex items-center ${
                      selectedLocation === 'Gần tôi'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Gần tôi
                  </button>
                </div>
              </div>
            </div>

            {/* Car brands filter */}
            <div className="pb-2">
              <div className="flex items-center">
                <div className="text-sm font-medium text-gray-700 mr-8 whitespace-nowrap">Hãng xe:</div>
                <div className="flex items-center space-x-3 overflow-x-auto pb-3 no-scrollbar">
                  {brandOptions.slice(0, 7).map((brand) => (
                    <button
                      key={brand.name}
                      onClick={() => {
                        if (selectedBrands.includes(brand.name)) {
                          setSelectedBrands(selectedBrands.filter(b => b !== brand.name));
                        } else {
                          setSelectedBrands([...selectedBrands, brand.name]);
                        }
                      }}
                      className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 ${
                        selectedBrands.includes(brand.name) ? 'bg-gray-100' : ''
                      } rounded-full hover:bg-gray-50`}
                    >
                      <div className="w-10 h-10 bg-white p-1 rounded-full flex items-center justify-center border border-gray-200">
                        <img 
                          src={brand.image} 
                          alt={brand.name || 'Brand logo'} 
                          className="w-7 h-7 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-logo.png';
                          }}
                        />
                      </div>
                      <span className="mt-1 text-xs text-gray-700">{brand.name}</span>
                    </button>
                  ))}
                  
                  {/* More brands button */}
                  <button
                    onClick={() => {
                      // Open modal or expand list
                      // For now, just console.log
                      console.log('Show all brands');
                    }}
                    className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-full hover:bg-gray-50"
                  >
                    <div className="w-10 h-10 bg-white p-1 rounded-full flex items-center justify-center border border-gray-200">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                    <span className="mt-1 text-xs text-gray-700">Xem thêm</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top filter section for motorcycles - only show for motorcycle type */}
      {type === 'motorcycle' && (
        <div className="border-b border-gray-200">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            {/* Location filter */}
            <div className="mb-6">
              <div className="flex items-center">
                <div className="text-sm font-medium text-gray-700 mr-8 whitespace-nowrap">Khu vực:</div>
                <div className="flex flex-wrap gap-2">
                  {locationOptions.map((location) => (
                    <button
                      key={location}
                      onClick={() => setSelectedLocation(selectedLocation === location ? null : location)}
                      className={`py-1.5 px-3 rounded-md text-sm ${
                        selectedLocation === location
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {location}
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedLocation(selectedLocation === 'Gần tôi' ? null : 'Gần tôi')}
                    className={`py-1.5 px-3 rounded-md text-sm flex items-center ${
                      selectedLocation === 'Gần tôi'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Gần tôi
                  </button>
                </div>
              </div>
            </div>

            {/* Engine capacity filter */}
            <div className="pb-2">
              <div className="flex items-center">
                <div className="text-sm font-medium text-gray-700 mr-8 whitespace-nowrap">Dung tích xe:</div>
                <div className="flex items-center space-x-3">
                  {engineCapacityOptions.map((capacity) => (
                    <button
                      key={capacity}
                      onClick={() => setSelectedEngineCapacity(selectedEngineCapacity === capacity ? null : capacity)}
                      className={`py-1.5 px-4 rounded-full text-sm border ${
                        selectedEngineCapacity === capacity
                          ? 'bg-gray-100 border-gray-300 text-gray-900 font-medium'
                          : 'bg-white border-gray-200 text-gray-700'
                      } hover:bg-gray-50`}
                    >
                      {capacity}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top filter section for bicycles - only show for bicycle type */}
      {type === 'bicycle' && (
        <div className="border-b border-gray-200">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            {/* Location filter */}
            <div className="mb-6">
              <div className="flex items-center">
                <div className="text-sm font-medium text-gray-700 mr-8 whitespace-nowrap">Khu vực:</div>
                <div className="flex flex-wrap gap-2">
                  {locationOptions.map((location) => (
                    <button
                      key={location}
                      onClick={() => setSelectedLocation(selectedLocation === location ? null : location)}
                      className={`py-1.5 px-3 rounded-md text-sm ${
                        selectedLocation === location
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {location}
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedLocation(selectedLocation === 'Gần tôi' ? null : 'Gần tôi')}
                    className={`py-1.5 px-3 rounded-md text-sm flex items-center ${
                      selectedLocation === 'Gần tôi'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Gần tôi
                  </button>
                </div>
              </div>
            </div>

            {/* Bicycle type filter */}
            <div className="mb-6">
              <div className="flex items-center">
                <div className="text-sm font-medium text-gray-700 mr-8 whitespace-nowrap">Loại xe đạp:</div>
                <div className="flex flex-wrap gap-2">
                  {bicycleTypeOptions.map((bicycleType) => (
                    <button
                      key={bicycleType}
                      onClick={() => setSelectedBicycleType(selectedBicycleType === bicycleType ? null : bicycleType)}
                      className={`py-1.5 px-3 rounded-md text-sm ${
                        selectedBicycleType === bicycleType
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {bicycleType}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bicycle brands section with horizontal scrolling */}
            <div className="overflow-hidden">
              <div className="flex items-center border-t border-gray-100 pt-4">
                <div className="flex space-x-4 overflow-x-auto pb-2 no-scrollbar">
                  {bicycleBrandOptions.map((brand) => (
                    <div key={brand.name} className="flex-shrink-0">
                      <button
                        onClick={() => {
                          if (selectedBrands.includes(brand.name)) {
                            setSelectedBrands(selectedBrands.filter(b => b !== brand.name));
                          } else {
                            setSelectedBrands([...selectedBrands, brand.name]);
                          }
                        }}
                        className={`flex items-center px-4 py-2 border rounded-md ${
                          selectedBrands.includes(brand.name) 
                            ? 'border-gray-400 bg-gray-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-sm font-medium text-gray-700">Xe Đạp {brand.name}</span>
                      </button>
                    </div>
                  ))}
                  {/* More brands button with arrow */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => console.log('Show more brands')}
                      className="flex items-center px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
        {/* Active filters indicator */}
        {(selectedLocation || selectedEngineCapacity || selectedBrands.length > 0 ||
          condition !== 'all' ||
          (priceRange[0] !== minPrice || priceRange[1] !== maxPrice) ||
          (yearRange[0] !== minYear || yearRange[1] !== maxYear)) && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Bộ lọc đang áp dụng:</span>

              {selectedLocation && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100">
                  Khu vực: {selectedLocation}
                  <button
                    className="ml-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setSelectedLocation(null)}
                  >
                    &times;
                  </button>
                </span>
              )}

              {selectedEngineCapacity && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100">
                  Dung tích: {selectedEngineCapacity}
                  <button
                    className="ml-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setSelectedEngineCapacity(null)}
                  >
                    &times;
                  </button>
                </span>
              )}

              {/* Reset all filters button */}
              <button
                onClick={() => {
                  setSelectedLocation(null);
                  setSelectedEngineCapacity(null);
                  setPriceRange([minPrice, maxPrice]);
                  setYearRange([minYear, maxYear]);
                  setSelectedBrands([]);
                  setCondition('all');
                }}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Đặt lại tất cả
              </button>
            </div>
          )}

        <div className={`grid grid-cols-1 ${type === 'bicycle' ? 'lg:grid-cols-1' : 'lg:grid-cols-4'} gap-x-8 gap-y-10`}>
          {/* Vehicle grid */}
          <div className={type === 'bicycle' ? '' : 'lg:col-span-3'}>
            {filteredVehicles.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">Không tìm thấy xe phù hợp với bộ lọc</h3>
                <p className="mt-1 text-sm text-gray-500">Hãy thử điều chỉnh các bộ lọc của bạn</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-y-6">
                {filteredVehicles.map((vehicle) => (
                  <div key={vehicle._id || `vehicle-${vehicle.make || vehicle.brand}-${vehicle.model}-${Math.random()}`} className="group relative bg-white border border-gray-200 rounded overflow-hidden hover:shadow transition">
                    <div className="absolute top-2 right-2 z-10">
                      <FavoriteButton vehicleId={vehicle._id} />
                    </div>
                    <div className="flex flex-col md:flex-row">
                      {/* Image container - Left */}
                      <div className="relative w-full md:w-40 h-40">
                        <img
                          src={vehicle.images?.[0] || 
                            (type === 'motorcycle' ? '/images/motorcycle.jpg' : 
                             type === 'car' ? '/images/car.jpg' : 
                             '/images/bicycle.jpg')}
                          alt={vehicle.title || `${vehicle.brand || ''} ${vehicle.model || ''}` || 'Vehicle image'}
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = type === 'motorcycle' ? '/images/motorcycle.jpg' : 
                                         type === 'car' ? '/images/car.jpg' : 
                                         '/images/bicycle.jpg';
                          }}
                        />
                      </div>
                      
                      {/* Content - Right */}
                      <div className="p-3 flex-1">
                        {/* Basic info */}
                        <div className="flex items-center space-x-1 text-xs text-gray-500 mb-1">
                          <span>{vehicle.year}</span>
                          <span>•</span>
                          <span>{type === 'motorcycle' ? 
                            (vehicle.body_type || 
                             (vehicle.model?.toLowerCase()?.includes('tay ga') ? 'Tay ga' : 
                              vehicle.model?.toLowerCase()?.includes('số') ? 'Xe số' : 'Xe máy')) : 
                            (type === 'car' ? 'Ô tô' : 'Xe đạp')}</span>
                          <span>•</span>
                          <span>{vehicle.condition === 'new' ? 'Mới' : 'Đã sử dụng'}</span>
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-base font-medium text-gray-900 leading-tight mb-1">
                          <Link href={`/vehicles/${vehicle._id}`} className="hover:text-blue-600">
                            {vehicle.title || `${vehicle.brand} ${vehicle.model}`}
                          </Link>
                        </h3>
                        
                        {/* Price */}
                        <p className="text-base font-bold text-red-600 mb-2">
                          {isFinite(vehicle.price) && vehicle.price > 0 ? 
                            `${(vehicle.price).toLocaleString('vi-VN')} ₫` : 
                            'Liên hệ'}
                        </p>
                        
                        {/* Footer info */}
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <span className="text-xs">
                            {formatDate(vehicle.created_at || vehicle.createdAt || '')}
                          </span>
                          <span className="mx-1">•</span>
                          <span>{vehicle.location || 'Hà Nội'}</span>
                        </div>

                        {/* Seller info */}
                        <div className="flex justify-between items-center border-t border-gray-100 pt-2 mt-1">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <img 
                                src={vehicle.user?.avatar_url || "/user-avatar.png"} 
                                alt={vehicle.user?.full_name || "Người bán"} 
                                className="w-7 h-7 rounded-full mr-2" 
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/user-avatar.png";
                                }}
                              />
                            </div>
                            <div>
                              <p className="text-xs font-medium leading-none">{vehicle.user?.full_name || "Thương lượng"}</p>
                              <div className="flex items-center">
                                <span className="text-xs text-yellow-500 mr-1">{vehicle.user?.rating || '5.0'}</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-2.5 h-2.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                                <span className="ml-1 text-xs text-gray-500">• {vehicle.user?.rating ? '5 đã bán' : ''}</span>
                              </div>
                            </div>
                          </div>
                          <button className="bg-white border border-gray-300 rounded px-4 py-1 text-xs text-gray-700 hover:bg-gray-50">
                            Chat
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filter sidebar - only show for car and motorcycle */}
          {type !== 'bicycle' && (
            <div className="hidden lg:block">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bộ lọc</h3>

              {/* Price filter */}
              <div className="border-b border-gray-200 py-6">
                <h3 className="flex items-center justify-between text-sm font-medium text-gray-900 mb-2">
                  Lọc theo khoảng giá
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="price-under-5m"
                      name="price-range"
                      checked={priceRange[0] === 0 && priceRange[1] === 5000000}
                      onChange={() => setPriceRange([0, 5000000])}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="price-under-5m" className="ml-2 text-sm text-gray-600">
                      Giá dưới 5 triệu
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="price-5m-10m"
                      name="price-range"
                      checked={priceRange[0] === 5000000 && priceRange[1] === 10000000}
                      onChange={() => setPriceRange([5000000, 10000000])}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="price-5m-10m" className="ml-2 text-sm text-gray-600">
                      Giá từ 5 triệu - 10 triệu
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="price-10m-15m"
                      name="price-range"
                      checked={priceRange[0] === 10000000 && priceRange[1] === 15000000}
                      onChange={() => setPriceRange([10000000, 15000000])}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="price-10m-15m" className="ml-2 text-sm text-gray-600">
                      Giá từ 10 triệu - 15 triệu
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="price-15m-20m"
                      name="price-range"
                      checked={priceRange[0] === 15000000 && priceRange[1] === 20000000}
                      onChange={() => setPriceRange([15000000, 20000000])}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="price-15m-20m" className="ml-2 text-sm text-gray-600">
                      Giá từ 15 triệu - 20 triệu
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="price-20m-30m"
                      name="price-range"
                      checked={priceRange[0] === 20000000 && priceRange[1] === 30000000}
                      onChange={() => setPriceRange([20000000, 30000000])}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="price-20m-30m" className="ml-2 text-sm text-gray-600">
                      Giá từ 20 triệu - 30 triệu
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="price-30m-40m"
                      name="price-range"
                      checked={priceRange[0] === 30000000 && priceRange[1] === 40000000}
                      onChange={() => setPriceRange([30000000, 40000000])}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="price-30m-40m" className="ml-2 text-sm text-gray-600">
                      Giá từ 30 triệu - 40 triệu
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="price-above-40m"
                      name="price-range"
                      checked={priceRange[0] === 40000000 && priceRange[1] === 1000000}
                      onChange={() => setPriceRange([40000000, 1000000])}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="price-above-40m" className="ml-2 text-sm text-gray-600">
                      Giá trên 40 triệu
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="price-all"
                      name="price-range"
                      checked={priceRange[0] === minPrice && priceRange[1] === maxPrice}
                      onChange={() => setPriceRange([minPrice, maxPrice])}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="price-all" className="ml-2 text-sm text-gray-600">
                      Tất cả mức giá
                    </label>
                  </div>
                </div>
              </div>

              {/* Year filter */}
              <div className="border-b border-gray-200 py-6">
                <h3 className="flex items-center justify-between text-sm font-medium text-gray-900 mb-2">
                  Năm sản xuất
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="year-before-2015"
                      name="year-range"
                      checked={yearRange[0] === 1990 && yearRange[1] === 2014}
                      onChange={() => setYearRange([1990, 2014])}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="year-before-2015" className="ml-2 text-sm text-gray-600">
                      Trước 2015
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="year-2015-2018"
                      name="year-range"
                      checked={yearRange[0] === 2015 && yearRange[1] === 2018}
                      onChange={() => setYearRange([2015, 2018])}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="year-2015-2018" className="ml-2 text-sm text-gray-600">
                      2015 - 2018
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="year-2019-2020"
                      name="year-range"
                      checked={yearRange[0] === 2019 && yearRange[1] === 2020}
                      onChange={() => setYearRange([2019, 2020])}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="year-2019-2020" className="ml-2 text-sm text-gray-600">
                      2019 - 2020
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="year-2021-2022"
                      name="year-range"
                      checked={yearRange[0] === 2021 && yearRange[1] === 2022}
                      onChange={() => setYearRange([2021, 2022])}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="year-2021-2022" className="ml-2 text-sm text-gray-600">
                      2021 - 2022
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="year-2023-current"
                      name="year-range"
                      checked={yearRange[0] === 2023 && yearRange[1] === new Date().getFullYear()}
                      onChange={() => setYearRange([2023, new Date().getFullYear()])}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="year-2023-current" className="ml-2 text-sm text-gray-600">
                      2023 - {new Date().getFullYear()}
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="year-all"
                      name="year-range"
                      checked={yearRange[0] === minYear && yearRange[1] === maxYear}
                      onChange={() => setYearRange([minYear, maxYear])}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="year-all" className="ml-2 text-sm text-gray-600">
                      Tất cả các năm
                    </label>
                  </div>
                </div>
              </div>

              {/* Brand filter */}
              <div className="border-b border-gray-200 py-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Hãng xe</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableBrands.map((brand, index) => (
                    <div key={`brand-${brand}-${index}`} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`brand-${brand}-${index}`}
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandToggle(brand)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor={`brand-${brand}-${index}`} className="ml-3 text-sm text-gray-600">
                        {brand}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Condition filter */}
              <div className="border-b border-gray-200 py-6">
                <h3 className="flex items-center justify-between text-sm font-medium text-gray-900 mb-2">
                  Lọc theo tình trạng
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="condition-all"
                      name="condition"
                      checked={condition === 'all'}
                      onChange={() => setCondition('all')}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="condition-all" className="ml-2 text-sm text-gray-600">
                      Tất cả
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="condition-used"
                      name="condition"
                      checked={condition === 'used'}
                      onChange={() => setCondition('used')}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="condition-used" className="ml-2 text-sm text-gray-600">
                      Đã sử dụng
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="condition-new"
                      name="condition"
                      checked={condition === 'new'}
                      onChange={() => setCondition('new')}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="condition-new" className="ml-2 text-sm text-gray-600">
                      Mới
                    </label>
                  </div>
                </div>
              </div>

              {/* Reset filters button */}
              <button
                onClick={() => {
                  setSelectedLocation(null);
                  setSelectedEngineCapacity(null);
                  setPriceRange([minPrice, maxPrice]);
                  setYearRange([minYear, maxYear]);
                  setSelectedBrands([]);
                  setCondition('all');
                }}
                className="mt-4 w-full bg-indigo-600 border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 