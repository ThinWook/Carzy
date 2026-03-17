'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import VehicleCard from '@/components/VehicleCard';
import { fetchVehicles, PaginationResult } from '@/utils';
import { Vehicle } from '@/types';
import { Loader2 } from 'lucide-react';

export default function SearchPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationResult<Vehicle>['pagination'] | null>(null);
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const query = searchParams.get('query') || '';

  useEffect(() => {
    const getVehicles = async () => {
      setIsLoading(true);
      try {
        const currentPage = Number(searchParams.get('page')) || 1;
        const pageSize = Number(searchParams.get('limit')) || 10;
        
        const result = await fetchVehicles({
          search: query,
          limit: pageSize,
          page: currentPage,
        });
        
        setVehicles(result.data);
        setPagination(result.pagination);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        setVehicles([]); 
      } finally {
        setIsLoading(false);
      }
    };

    getVehicles();
  }, [searchParams, query]);

  const isDataEmpty = !Array.isArray(vehicles) || vehicles.length < 1 || !vehicles;

  return (
    <main className="overflow-hidden">
      <div className="mt-12 padding-x padding-y max-width">
        <div className="flex flex-col items-start gap-2 mb-8">
          <h1 className="text-3xl font-extrabold">Kết quả tìm kiếm</h1>
          {query && <p className="text-gray-600">Từ khóa tìm kiếm: <span className="font-semibold">{query}</span></p>}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
          </div>
        ) : (
          <>
            {!isDataEmpty ? (
              <section>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vehicles.map((vehicle) => (
                    <VehicleCard key={vehicle._id} vehicle={vehicle} />
                  ))}
                </div>

                {pagination && pagination.pages > 1 && (
                  <div className="mt-16 flex justify-center gap-5">
                    {pagination.page > 1 && (
                      <Link 
                        href={`/vehicles/search?query=${query}&page=${pagination.page - 1}`}
                        className="px-4 py-2 bg-orange-100 text-orange-600 rounded-md hover:bg-orange-200"
                      >
                        Trang trước
                      </Link>
                    )}
                    {pagination.page < pagination.pages && (
                      <Link 
                        href={`/vehicles/search?query=${query}&page=${pagination.page + 1}`}
                        className="px-4 py-2 bg-orange-100 text-orange-600 rounded-md hover:bg-orange-200"
                      >
                        Trang tiếp
                      </Link>
                    )}
                  </div>
                )}
              </section>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[50vh] home__error-container">
                <h2 className="text-2xl font-bold text-gray-800">
                  Không tìm thấy xe nào phù hợp với từ khóa "{query}"
                </h2>
                <p className="text-gray-600 mt-4">
                  Thử tìm kiếm với từ khóa khác hoặc duyệt qua danh mục các loại xe của chúng tôi.
                </p>
                <div className="mt-6 flex gap-4">
                  <Link href="/" className="px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600">
                    Quay về trang chủ
                  </Link>
                  <Link href="/vehicles" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                    Xem tất cả xe
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
} 