'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Hero from '@/components/Hero';
import VehicleCard from '@/components/VehicleCard';
import { fetchVehicles, PaginationResult } from '@/utils';
import { Vehicle } from '@/types';

export default function Home() {
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationResult<Vehicle>['pagination'] | null>(null);
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    const getVehicles = async () => {
      setIsLoading(true);
      try {
        const currentPage = Number(searchParams.get('page')) || 1;
        const pageSize = Number(searchParams.get('limit')) || 10;
        
        const result = await fetchVehicles({
          manufacturer: searchParams.get('manufacturer') || '',
          year: Number(searchParams.get('year')) || new Date().getFullYear(),
          fuel: searchParams.get('fuel') || '',
          limit: pageSize,
          page: currentPage,
          model: searchParams.get('model') || '',
        });
        
        setAllVehicles(result.data);
        setPagination(result.pagination);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        setAllVehicles([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    getVehicles();
  }, [searchParams]);

  const isDataEmpty = !Array.isArray(allVehicles) || allVehicles.length < 1 || !allVehicles;

  return (
    <main className="overflow-hidden">
      <Hero />

      {/* Danh mục xe cũ */}
      <div className="mt-0 padding-x padding-y max-width">
        
        <div className="border border-gray-200 rounded-xl shadow-md p-6 bg-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Khám phá danh mục Xe cũ</h2>
          <div className="w-full h-px bg-gray-200 mb-6"></div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {/* Ô tô */}
            <Link href="/vehicles/type/car" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
              <div className="w-16 h-16 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <span className="mt-2 text-sm font-medium text-gray-800">Ô tô</span>
            </Link>

            {/* Xe máy */}
            <Link href="/vehicles/type/motorcycle" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
              <div className="w-16 h-16 flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-700">
                  <path d="M4 16v1a2 2 0 002 2h.5a2.5 2.5 0 100-5H4v2zm0 0h8m-8-5h2l3-5l1.25 2.5M19 16v1a2 2 0 01-2 2h-.5a2.5 2.5 0 110-5H19v2zm0 0h-8m9-5h-2l-3-5L13.75 8.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="6.5" cy="16.5" r="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="17.5" cy="16.5" r="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="mt-2 text-sm font-medium text-gray-800">Xe máy</span>
            </Link>

            {/* Xe tải, xe ben */}
            <Link href="/vehicles/type/truck" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
              <div className="w-16 h-16 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <span className="mt-2 text-sm font-medium text-gray-800">Xe tải, xe ben</span>
            </Link>

            {/* Xe điện */}
            <Link href="/vehicles/type/electric" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
              <div className="w-16 h-16 flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-700">
                  <path d="M4 16v1a2 2 0 002 2h.5a2.5 2.5 0 100-5H4v2zm0 0h8m-8-5h2l3-5l1.25 2.5M19 16v1a2 2 0 01-2 2h-.5a2.5 2.5 0 110-5H19v2zm0 0h-8" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="6.5" cy="16.5" r="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="17.5" cy="16.5" r="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 8l-3 1v2l2 1v2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="mt-2 text-sm font-medium text-gray-800">Xe điện</span>
            </Link>

            {/* Xe đạp */}
            <Link href="/vehicles/type/bicycle" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
              <div className="w-16 h-16 flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-700">
                  <circle cx="5.5" cy="17.5" r="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="18.5" cy="17.5" r="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 6a1 1 0 100-2 1 1 0 000 2zm-3 11.5l-5-4.5m5 4.5V9l7 6m0-6h-7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="mt-2 text-sm font-medium text-gray-800">Xe đạp</span>
            </Link>

            {/* Phương tiện khác */}
            <Link href="/vehicles/type/others" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
              <div className="w-16 h-16 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              </div>
              <span className="mt-2 text-sm font-medium text-gray-800">Phương tiện khác</span>
            </Link>

            {/* Phụ tùng xe */}
            <Link href="/vehicles/parts" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
              <div className="w-16 h-16 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <span className="mt-2 text-sm font-medium text-gray-800">Phụ tùng xe</span>
            </Link>
          </div>
          </div>
        </div>

      <div className="mt-4 padding-x padding-y max-width" id="discover">
        {/* Vehicle Listings */}
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-blue"></div>
          </div>
        ) : !isDataEmpty ? (
          <section className="border border-gray-200 rounded-xl shadow-md p-6 bg-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Xe mới đăng gần đây</h2>
            <div className="w-full h-px bg-gray-200 mb-6"></div>
            
            <div className="home__vehicles-wrapper">
              {allVehicles.map((vehicle) => (
                <VehicleCard key={vehicle._id} vehicle={vehicle} />
              ))}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="mt-10 flex justify-center">
                <div className="flex gap-2">
                  {pagination.page > 1 && (
                    <Link
                      href={`/?page=${pagination.page - 1}`}
                      className="px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200"
                    >
                      Previous
                    </Link>
                  )}
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      // Calculate page numbers to show (centered around current page)
                      const pageNum = 
                        pagination.pages <= 5 
                          ? i + 1 
                          : Math.min(
                              Math.max(1, pagination.page - 2) + i,
                              pagination.pages
                            );
                      
                      return (
                        <Link
                          key={pageNum}
                          href={`/?page=${pageNum}`}
                          className={`px-4 py-2 border rounded-md ${
                            pagination.page === pageNum
                              ? 'bg-indigo-600 text-white'
                              : 'hover:bg-gray-200'
                          }`}
                        >
                          {pageNum}
                        </Link>
                      );
                    })}
                  </div>
                  
                  {pagination.page < pagination.pages && (
                    <Link
                      href={`/?page=${pagination.page + 1}`}
                      className="px-4 py-2 border rounded-md bg-gray-100 hover:bg-gray-200"
                    >
                      Next
                    </Link>
                  )}
                </div>
              </div>
            )}
          </section>
        ) : (
          <div className="home__error-container">
            <h2 className="text-black text-xl font-bold">Oops, no results</h2>
            <p>No vehicles found. Try adjusting your search.</p>
          </div>
        )}
      </div>
    </main>
  );
}
