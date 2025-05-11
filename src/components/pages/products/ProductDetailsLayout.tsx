"use client";
import React from "react";
import ProductDetails from "@/components/pages/products/ProductDetails";
import ProductOverview from "@/components/pages/products/ProductOverview";
import RelatedProducts from "@/components/pages/products/RelatedProducts";
import { useGetProductDetailsQuery } from "@/redux/features/products/product.api";
import { IProduct } from "@/types/products.types";

interface IParams {
  slug: string;
}

const ProductDetailsLayout = ({ params }: { params: IParams }) => {
  const { data, isLoading } = useGetProductDetailsQuery(params.slug) as any;

  const product = data?.product as IProduct;
  const relatedProducts = data?.relatedProducts as Partial<IProduct>[];
  return (
    <>
      <ProductOverview product={product} isLoading={isLoading} />
      <ProductDetails product={product} />
      <RelatedProducts
        products={relatedProducts as any}
        isLoading={isLoading}
      />
    </>
  );
};

export default ProductDetailsLayout;
