import Container from "@/components/common/Container";
import BlogDetailsLayout from "@/components/pages/home/BlogDetailsLayout";
import { baseURL } from "@/redux/api/baseApi";
import { ParamsProps } from "@/types";
import { getBlog } from "@/utils/getGlobalData";
import type { Metadata } from "next";

export default function BlogDetailsPage({ params }: ParamsProps) {
  return (
    <Container>
      <BlogDetailsLayout params={params} />
    </Container>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;

  const data = await getBlog(slug);

  return {
    title: data?.title || "Blog Details",
    description: data?.meta_description || "Blog Details",
    openGraph: {
      type: "website",
      title: data?.title || "Blog Details",
      description: data?.meta_description || "Blog Details",
      images: [
        {
          url: data?.thumbnail || `${baseURL}/images/default.png`,
          alt: data?.title || "Blog Details",
        },
      ],
    },
  };
}
