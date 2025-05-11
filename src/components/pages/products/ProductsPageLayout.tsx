"use client";

import React, { useState } from "react";
import ProductsFilterDesktop from "@/components/pages/products/ProductsFilterDesktop";
import Link from "next/link";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import ProductCardSkeleton from "../products/ProductCardSkeleton";
import { Pagination } from "@heroui/react";
import ProductFilterMobile from "../products/ProductFilterMobile";
import ProductsFilterHeader from "../products/ProductsFilterHeader";
import { useGetShopProductsQuery } from "@/redux/features/products/product.api";
import Preloader from "@/components/common/Preloader";
import Card from "@/components/Card/Card";

const ProductsPageLayout = () => {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetShopProductsQuery({
    filters,
    page,
    limit: 15,
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };
  if (isLoading) return <Preloader />;
  const products = data?.data || [];
  const meta = data?.meta;
  const filterOptions = data?.filterOptions;
  return (
    <div className="my-24 relative top-10">
      {data && (
        <ProductFilterMobile
          filters={filterOptions}
          onFilterChange={handleFilterChange}
        />
      )}
      <main>
        {/* <Breadcrumbs
          pages={[
            { name: "Home", href: "/", current: false },
            { name: "Products", href: "/products", current: true },
          ]}
        /> */}
        <div className="flex items-center justify-between border-b border-gray200 pb-6 pt-6">
          <h1 className="text-xl lg:text-4xl font-bold tracking-tight text-gray-900">
            Products
          </h1>
          <ProductsFilterHeader />
        </div>

        <section aria-labelledby="products-heading" className="pt-6">
          <h2 id="products-heading" className="sr-only">
            Products
          </h2>
          <div className="flex flex-col lg:flex-row gap-x-8">
            {data && (
              <div className="w-3/12">
                <ProductsFilterDesktop
                  filters={filterOptions}
                  onFilterChange={handleFilterChange}
                />
              </div>
            )}

            <div className="flex-1 t top-2/4">
              {isFetching ? (
                <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                  {Array(9)
                    .fill(null)
                    .map((_, index) => (
                      <ProductCardSkeleton key={index} />
                    ))}
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 sticky top-0">
                    {products.map((product: any) => (
                      <Card
                        key={product._id}
                        item={{
                          id: product._id,
                          name: product.name,
                          price: product.price,
                          img1: product.thumbnail,
                          img2: product?.images && product.images[0],
                          slug: product.slug,
                          category: product.category,
                          subCategory: product.subCategory,
                          mainCategory: product.mainCategory,
                          rating: product.rating,
                          reviewCount: product.reviewCount,
                        }}
                      />
                    ))}
                  </div>
                  {meta && meta.total > meta.limit && (
                    <div className="my-8 flex justify-center">
                      <Pagination
                        total={Math.ceil(meta.total / meta.limit)}
                        initialPage={meta.page}
                        onChange={(page) => setPage(page)}
                        color="warning"
                        size="sm"
                        className="-z-0"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center col-span-full">
                  <p className="text-lg text-gray-500">
                    No products found in this category.
                  </p>
                  <div className="mt-4">
                    <Link href="/products">
                      <span className="text-purple-600 hover:underline">
                        View all products
                      </span>
                    </Link>
                    <Link href="/">
                      <span className="text-purple-600 hover:underline ml-4">
                        Go back home
                      </span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductsPageLayout;
