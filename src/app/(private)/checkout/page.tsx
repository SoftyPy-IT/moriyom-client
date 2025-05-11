import Container from "@/components/common/Container";
import CheckoutForm from "@/components/pages/checkout/CheckoutForm";
import CheckoutSummary from "@/components/pages/checkout/CheckoutSummary";
import { getGlobalData } from "@/utils/getGlobalData";
import { Metadata } from "next";
import React from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const CheckoutPage = async () => {
  const session = (await getServerSession(authOptions)) as any;

  if (!session) {
    redirect("/login");
  }

  return (
    <Container>
      <div className="flex flex-col lg:flex-row justify-between mx-auto my-24 w-full p-4 bg-white">
        <div className="lg:w-2/3">
          <CheckoutForm user={session.user} />
        </div>
        <div className="lg:w-1/3 lg:ml-8">
          <CheckoutSummary />
        </div>
      </div>
    </Container>
  );
};

export default CheckoutPage;

export async function generateMetadata(): Promise<Metadata> {
  const data = await getGlobalData();
  return {
    title: data?.shopName + " | Checkout",
    description: data?.description || "",
    openGraph: {
      images: [
        {
          url: data?.logo || "",
          alt: data?.shopName || "",
        },
      ],
    },
  };
}
