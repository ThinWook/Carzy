import { NextResponse } from 'next/server';
import { endpoints } from '@/config/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = searchParams.get('limit') || '5';

    if (!search) {
      return NextResponse.json({ vehicles: [] });
    }

    const params = new URLSearchParams({
      search,
      limit,
    });

    const response = await fetch(`${endpoints.vehicles.list}?${params.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch data from API');
    }

    const data = await response.json();
    
    // Trả về kết quả đúng định dạng cho dropdown
    if (data.vehicles && Array.isArray(data.vehicles)) {
      return NextResponse.json({ vehicles: data.vehicles });
    } else if (Array.isArray(data)) {
      return NextResponse.json({ vehicles: data });
    }
    
    return NextResponse.json({ vehicles: [] });
  } catch (error) {
    console.error('Error in quick-search API:', error);
    return NextResponse.json({ vehicles: [] }, { status: 500 });
  }
} 