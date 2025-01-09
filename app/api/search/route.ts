import { NextResponse } from 'next/server';
import type { Review, SearchParams } from '@/lib/types';
import path from 'path';
import fs from 'fs/promises';

let reviews: Review[] = [];

function parseCSV(csv: string): Review[] {
  const lines = csv.split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = line.split(',').map(val => val.trim());
      return {
        id: values[0],
        phone: values[2],
        organization: values[3].replace(/^"|"$/g, ''),
        rating: parseFloat(values[5]),
        totalReview: parseInt(values[6], 10),
        category: values[7],
        country: values[8],
        state: values[9],
        city: values[10],
        street: values[11],
        building: parseInt(values[12], 10)
      };
    });
}

// Load reviews data on first request
async function loadReviews() {
  try {
    if (reviews.length === 0) {
      const filePath = path.join(process.cwd(), 'data', 'yelp_database.csv');
      const data = await fs.readFile(filePath, 'utf-8');
      reviews = parseCSV(data);
    }
    return reviews;
  } catch (error) {
    console.error('Error loading reviews:', error);
    return [];
  }
}

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const allReviews = await loadReviews();

    // Filter reviews based on search query
    const filtered = query
      ? allReviews.filter(review =>
        review.organization.toLowerCase().includes(query.toLowerCase())
      )
      : allReviews;

    const start = (page - 1) * limit;
    const end = start + limit;
    const items = filtered.slice(start, end);

    return NextResponse.json({
      items,
      total: filtered.length,
      hasMore: end < filtered.length
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({
      items: [],
      total: 0,
      hasMore: false,
      error: 'Failed to process search request'
    }, { status: 500 });
  }
}