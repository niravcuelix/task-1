import { SmartList } from '@/components/SmartList';
import path from 'path';
import fs from 'fs/promises';
import { Review } from '@/lib/types';

async function getInitialData(): Promise<Review[]> {
  const filePath = path.join(process.cwd(), 'data', 'reviews.json');
  const data = await fs.readFile(filePath, 'utf-8');
  const allReviews = JSON.parse(data);
  return allReviews.slice(0, 100); // Return first 100 items for initial render
}

export default async function Home() {
  const initialData = await getInitialData();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Yelp Reviews Explorer
        </h1>
        <SmartList initialData={initialData} />
      </div>
    </main>
  );
}