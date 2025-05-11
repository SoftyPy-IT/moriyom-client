const ProductCardSkeleton = () => {
  return (
    <>
      <div className="group relative w-full bg-white rounded-lg overflow-hidden animate-pulse">
        <div className="relative aspect-[3/4] overflow-hidden">
          <div className="w-full h-full bg-gray-200"></div>
        </div>

        <div className="p-4 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="flex justify-between items-center space-x-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>

        <div className="md:hidden absolute bottom-0 left-0 right-0 h-12 bg-gray-200"></div>
      </div>
    </>
  );
};

export default ProductCardSkeleton;
