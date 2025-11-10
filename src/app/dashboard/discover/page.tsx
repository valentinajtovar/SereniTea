'use client';

import MainHeader from "@/components/dashboard/main-header";
// si agregaste export default:
import ActivityChatbot from "@/components/discover/activity-chatbot";
// (si prefieres named import: import { ActivitySuggester } from "@/components/discover/activity-suggester";)

export default function DiscoverPage() {
  return (
    <>
      <MainHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold font-headline">Descubre y Recárgate</h1>
        </div>
        <ActivityChatbot />
      </main>
    </>
  );
}
