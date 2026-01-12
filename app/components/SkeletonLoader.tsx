export function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-20 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
          <div className="hidden lg:block h-10 w-96 bg-gray-200 rounded-full"></div>
          <div className="flex gap-4">
             <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
             <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
      
      {/* Hero Skeleton */}
      <div className="h-[500px] bg-gray-200 w-full mb-8"></div>
      
      {/* Grid Skeleton */}
      <div className="container mx-auto px-4">
         <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-gray-200 rounded-xl"></div>
            ))}
         </div>
      </div>
    </div>
  );
}
