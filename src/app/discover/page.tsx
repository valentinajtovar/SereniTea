import { ActivitySuggester } from "@/components/discover/activity-suggester";
import { Header } from "@/components/shared/header";

export default function DiscoverPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">Descubre y Recárgate</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Encuentra nuevas actividades creativas y terapéuticas adaptadas a tu estado de ánimo, y descubre lugares locales para la recreación y la diversión.
            </p>
        </div>
        <ActivitySuggester />
      </main>
    </>
  );
}
