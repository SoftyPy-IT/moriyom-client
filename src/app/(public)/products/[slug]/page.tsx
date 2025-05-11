import Container from "@/components/common/Container";
import ProductDetailsLayout from "@/components/pages/products/ProductDetailsLayout";
import { ParamsProps } from "@/types";
import { getGlobalData, getProducts } from "@/utils/getGlobalData";
import type { Metadata } from "next";

export default function ProductDetailsPage({ params }: ParamsProps) {
  return (
    <Container>
      <ProductDetailsLayout params={params} />
    </Container>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const data = await getGlobalData();
  const product = await getProducts(params.slug);

  return {
    title: product?.name + " | " + data?.shopName,
    description: product?.meta_description || data?.description || "",
    openGraph: {
      type: "website",
      title: product?.name || "",
      description: product?.meta_description || data?.description || "",
      images: [
        {
          url: product?.thumbnail || `${data?.logo}`,
          alt: product?.name || data?.shopName,
        },
      ],
    },
  };
}
