/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useRef, useEffect } from "react";
import { SearchCheck as MagnifyingGlassIcon, X as XIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { debounce } from "lodash";
import { useGetAllProductsQuery } from "@/redux/features/products/product.api";
import { TQueryParam } from "@/types/global.types";
import { IProduct } from "@/types/products.types";
import formatPrice from "@/utils/formatPrice";

const HeaderSearchBar = () => {
  const [params, setParams] = useState<TQueryParam[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    data: products,
    isLoading,
    isFetching,
  } = useGetAllProductsQuery([...params]);

  const debouncedSearch = useCallback(
    debounce((search: string) => {
      setParams([{ name: "searchTerm", value: search }]);
    }, 300),
    [],
  );

  useEffect(() => {
    // Handle click outside
    const handleClickOutside = (event: { target: any }) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value;
    setSearchTerm(search);
    debouncedSearch(search);

    if (search) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setParams([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-4xl mx-auto">
      {/* Search Input */}
      <div className="w-full">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4">
            <MagnifyingGlassIcon
              className={`w-5 h-5 transition-colors duration-200 ${
                isFocused ? "text-tomato" : "text-gray300"
              }`}
            />
          </div>

          <input
            ref={inputRef}
            type="search"
            className={`w-full py-2 pl-12 pr-12 text-lg bg-white border rounded outline-none transition-all duration-200
              ${
                isFocused
                  ? "border-tomato shadow-sm shadow-brand-light1"
                  : "border-gray300 hover:border-gray300"
              }
              placeholder:text-gray400`}
            placeholder="Search for products..."
            value={searchTerm}
            onChange={handleSearch}
            onFocus={() => {
              setIsFocused(true);
              if (searchTerm) setShowResults(true);
            }}
            onBlur={() => setIsFocused(false)}
          />

          {/* Clear button */}
          {searchTerm && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                onClick={clearSearch}
                className="p-2 text-gray300 hover:text-tomato rounded-full hover:bg-gray50"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow-2xl rounded-lg border border-gray100 z-50">
          <div className="max-h-96 overflow-y-auto">
            {/* Loading State */}
            {(isLoading || isFetching) && (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gray100 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray100 rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-gray100 rounded animate-pulse w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Results */}
            {!isFetching && searchTerm && products?.data && (
              <div className="divide-y divide-gray100">
                {products.data.map((product: IProduct) => (
                  <Link
                    href={`/products/${product._id}`}
                    key={product._id}
                    className="block hover:bg-gray50 transition-colors"
                    onClick={() => setShowResults(false)}
                  >
                    <div className="flex items-center p-4 gap-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray50 flex-shrink-0">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray500 line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="mt-1 flex items-center gap-2">
                          {product.discount_price > 0 ? (
                            <>
                              <span className="text-tomato font-medium">
                                {formatPrice(product.discount_price)}
                              </span>
                              <span className="text-gray300 line-through">
                                {formatPrice(product.price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray500 font-medium">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isFetching &&
              searchTerm &&
              (!products?.data || !products.data.length) && (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray50 mb-4">
                    <MagnifyingGlassIcon className="w-8 h-8 text-gray300" />
                  </div>
                  <p className="text-gray500 font-medium">No results found</p>
                  <p className="text-gray400 mt-1">
                    Try adjusting your search terms
                  </p>
                </div>
              )}

            {/* Initial State */}
            {!searchTerm && (
              <div className="p-4 text-center text-gray400">
                <p>Start typing to search for products</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderSearchBar;
