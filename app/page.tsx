import { SmartList } from '@/components/SmartList';
import path from 'path';
import fs from 'fs/promises';
import { Review } from '@/lib/types';

export default async function Home() {

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Yelp Reviews Explorer
        </h1>
        <SmartList />
      </div>
    </main>
  );
}
