"use client";

import { useGetComboProductDetailsQuery } from "@/redux/features/products/combo.api";
import { IProduct } from "@/types/products.types";
import React from "react";
import ComboProductOverview from "./ComboProductOverview";
import ProductDetails from "./ProductDetails";
import Preloader from "@/components/common/Preloader";

interface IParams {
  slug: string;
}

const ComboDetailsLayout = ({ params }: { params: IParams }) => {
  const { data, isLoading } = useGetComboProductDetailsQuery(
    params.slug,
  ) as any;

  const product = data as IProduct;
  const items = data?.items as IProduct[];

  if (isLoading) return <Preloader />;

  return (
    <div className="container mx-auto px-4">
      <ComboProductOverview
        product={product}
        items={items}
        isLoading={isLoading}
      />
      <ProductDetails product={product} />
    </div>
  );
};

export default ComboDetailsLayout;
