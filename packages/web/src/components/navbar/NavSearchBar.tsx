'use client'

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useVehicleSearch } from '@/hooks/useVehicleSearch'

export default function NavSearchBar() {
  const {
    query,
    results,
    isLoading,
    showResults,
    setShowResults,
    handleQueryChange,
    handleSearch,
    handleResultClick,
  } = useVehicleSearch()

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <input
        type="text"
        placeholder="Tìm kiếm xe trên Carzy"
        className="w-full rounded-md border-0 py-2 pl-3 pr-10 text-sm text-gray-900 focus:ring-2 focus:ring-orange-500"
        value={query}
        onChange={handleQueryChange}
        onClick={(e) => {
          e.stopPropagation()
          if (query.trim().length >= 2) setShowResults(true)
        }}
      />
      <button
        type="submit"
        className="absolute inset-y-0 right-0 flex items-center px-3 bg-orange-500 text-white rounded-r-md hover:bg-orange-600 transition-colors"
        aria-label="Search"
      >
        <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
      </button>

      {showResults && (
        <div
          className="absolute mt-1 w-full bg-white rounded-md shadow-lg z-10 max-h-80 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {isLoading ? (
            <div className="flex justify-center items-center py-4">
              <svg className="animate-spin h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="py-2">
                {results.map((vehicle) => (
                  <div
                    key={vehicle._id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={() => handleResultClick(vehicle._id)}
                  >
                    <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-200 mr-3">
                      {vehicle.images?.[0] ? (
                        <img src={vehicle.images[0]} alt={vehicle.title || vehicle.model} className="h-full w-full object-cover rounded" />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full text-gray-400">
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{vehicle.title || `${vehicle.make} ${vehicle.model}`}</p>
                      <p className="text-sm text-gray-500">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(vehicle.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-gray-100">
                <button
                  className="text-orange-500 hover:text-orange-600 text-sm font-medium w-full text-center"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSearch(e) }}
                >
                  Xem tất cả kết quả
                </button>
              </div>
            </>
          ) : query.trim().length >= 2 ? (
            <div className="px-4 py-3 text-sm text-gray-500">Không tìm thấy kết quả phù hợp với "{query}"</div>
          ) : null}
        </div>
      )}
    </form>
  )
}
