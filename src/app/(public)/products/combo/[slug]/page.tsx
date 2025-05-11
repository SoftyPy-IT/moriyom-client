import Container from "@/components/common/Container";
import ComboDetailsLayout from "@/components/pages/products/ComboDetailsLayout";
import { ParamsProps } from "@/types";
import React from "react";

export default function ProductDetailsPage({ params }: ParamsProps) {
  return (
    <Container>
      <ComboDetailsLayout params={params} />
    </Container>
  );
}
