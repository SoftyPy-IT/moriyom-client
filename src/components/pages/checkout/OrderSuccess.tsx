"use client";

import React from "react";
import { useGetOrderQuery } from "@/redux/features/orders/order.api";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";

import Preloader from "@/components/common/Preloader";

interface OrderProps {
  id: string;
}

const OrderSuccess: React.FC<OrderProps> = ({ id }) => {
  const { data, isLoading } = useGetOrderQuery(id);

  if (isLoading) return <Preloader />;

  if (!data) return notFound();

  return (
    <main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 text-center">
        <Image
          src="/order-success.jpg"
          alt="Order Success"
          width={300}
          height={300}
          className="mx-auto"
        />
        <h1 className="text-2xl font-bold mt-6">Thank You!</h1>
        <p className="text-lg mt-2">Your order has been successfully placed.</p>
        <p className="text-lg font-semibold mt-4">Order ID: {id}</p>
        <Link href="/" className="text-blue-500 hover:underline mt-6 block">
          Continue Shopping
        </Link>
      </div>
    </main>
  );
};

export default OrderSuccess;
