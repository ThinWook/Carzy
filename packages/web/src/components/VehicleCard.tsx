import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Định nghĩa kiểu dữ liệu cho props theo cấu trúc mới
interface Vehicle {
  _id: string;
  title: string;
  price: number;
  year: number;
  mileage: number;
  images: string[];
  location: string;
  user: {
    _id: string;
    full_name: string;
    phone_number: string;
    email?: string;
    avatar_url?: string;
    rating?: number;
  };
  type: string;
  make: string;
  model: string;
  created_at: string;
  updated_at: string;
  status: string;
}

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const { _id, title, price, year, mileage, images, location, user, type, make, model } = vehicle;
  const [isImageError, setIsImageError] = useState(false);

  // Định dạng giá theo tiền Việt Nam
  const formatPrice = (price: number) => {
    if (!price || price <= 0) return 'Liên hệ';
    return price.toLocaleString('vi-VN') + ' ₫';
  };

  // Lấy URL hình ảnh đầu tiên, có xử lý lỗi
  const getImageUrl = () => {
    if (images && images.length > 0 && images[0] && !isImageError) {
      return images[0];
    }
    // Sử dụng ảnh mặc định phù hợp với loại xe
    if (vehicle.type === 'motorcycle') {
      return '/images/motorcycle.jpg';
    } else if (vehicle.type === 'car') {
      return '/images/car.jpg';
    } else {
      return '/images/bicycle.jpg';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/vehicles/${_id}`}>
        <div className="relative h-48 w-full bg-gray-200">
          <Image
            src={getImageUrl()}
            alt={title || 'Vehicle image'}
            fill
            className="object-cover" 
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={() => setIsImageError(true)}
          />
        </div>
        <div className="p-4">
          {/* Tiêu đề xe */}
          <h3 className="text-base font-bold text-gray-900 truncate mb-2">
            {title}
          </h3>
          
          {/* Giá xe */}
          <p className="text-lg font-semibold text-red-600 mb-2">
            {formatPrice(price)}
          </p>
          
          {/* Thông tin cơ bản */}
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <span className="font-medium">Năm: {year}</span>
            <span className="mx-1">•</span>
            <span className="font-medium">{mileage.toLocaleString()} km</span>
            <span className="mx-1">•</span>
            <span>{location}</span>
          </div>
          
          {/* Thông tin người bán */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <img 
                    src={user?.avatar_url || "/user-avatar.png"} 
                    alt={user?.full_name || "User"} 
                    className="w-7 h-7 rounded-full mr-2" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/user-avatar.png";
                    }}
                  />
                  <div>
                    <p className="text-sm font-bold text-blue-600">{user?.full_name || "Thương lượng"}</p>
                    <div className="flex items-center">
                      <span className="text-xs text-yellow-500 mr-1">{user?.rating || '5.0'}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-2.5 h-2.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">SĐT: {user?.phone_number || ""}</p>
                  </div>
                </div>
              </div>
              <button className="text-sm text-blue-600 border border-blue-600 rounded px-2 py-0.5">
                Liên hệ
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
} 