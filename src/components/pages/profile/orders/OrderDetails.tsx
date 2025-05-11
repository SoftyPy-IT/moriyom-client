"use client";

import React from "react";
import OrderSkeleton from "../../checkout/OrderSkeleton";
import { notFound } from "next/navigation";
import { useGetOrderQuery } from "@/redux/features/orders/order.api";
import { Avatar } from "@heroui/react";
import { CheckIcon } from "@heroicons/react/24/solid";
import formatPrice from "@/utils/formatPrice";
import { baseURL } from "@/redux/api/baseApi";
import Link from "next/link";

const OrderDetails = ({ id }: { id: string }) => {
  const { data, isLoading } = useGetOrderQuery(id);

  if (isLoading) return <OrderSkeleton />;
  if (!data) return notFound();

  const {
    billingAddress,
    shippingAddress,
    _id,
    orderItems,
    subTotal,
    discount,
    tax,
    total,
    phone,
    status,
  } = data.data;

  const steps = [
    { id: "01", name: "Order placed", status: "complete" },
    {
      id: "02",
      name: "Processing",
      status:
        status === "processing" ||
        status === "shipped" ||
        status === "delivered"
          ? "complete"
          : status === "pending"
          ? "current"
          : "upcoming",
    },
    {
      id: "03",
      name: "Shipped",
      status:
        status === "shipped" || status === "delivered"
          ? "complete"
          : status === "processing"
          ? "current"
          : "upcoming",
    },
    {
      id: "04",
      name: "Delivered",
      status:
        status === "delivered"
          ? "complete"
          : status === "shipped"
          ? "current"
          : "upcoming",
    },
    {
      id: "05",
      name: "Cancelled",
      status:
        status === "cancelled" || status === "returned"
          ? "complete"
          : "upcoming",
    },
    {
      id: "06",
      name: "Returned",
      status: status === "returned" ? "complete" : "upcoming",
    },
  ];

  return (
    <main className="bg-gray50  rounded-lg">
      <div className="sm:flex sm:items-center sm:justify-between sm:space-x-4 sm:px-0 border-b border-gray100 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-brand-main sm:text-3xl">
          Order #{_id}
        </h1>
        <div className="sm:flex sm:space-x-4 mt-3 sm:mt-0">
          <a
            target="_blank"
            download={`${baseURL}/order/invoice/${_id}`}
            href={`${baseURL}/order/invoice/${_id}`}
            className="text-sm font-medium text-blue hover:text-brand-main transition-colors duration-200 flex items-center"
          >
            Download invoice{" "}
            <span aria-hidden="true" className="ml-1">
              {" "}
              &rarr;
            </span>
          </a>
          <p className="text-sm text-gray400 mt-2 sm:mt-0">
            Order placed{" "}
            <time dateTime="2021-03-22" className="font-medium text-gray500">
              {new Date(data.data.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </time>
          </p>
        </div>
      </div>

      {/* Products */}
      <section aria-labelledby="products-heading" className="mt-8">
        <h2
          id="products-heading"
          className="text-lg font-medium text-brand-main mb-4"
        >
          Products purchased
        </h2>
        <div className="space-y-8">
          <div className="rounded-lg bg-white border border-gray100 shadow-sm">
            <div className="px-4 py-6 sm:px-6 lg:p-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {orderItems.map((product: any) => (
                  <div
                    key={product.productId}
                    className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-5 rounded-lg hover:bg-lightgreen transition-colors duration-200 border border-transparent hover:border-green"
                  >
                    <div className="aspect-square w-full sm:w-24 md:w-32 lg:w-40 flex-shrink-0 overflow-hidden rounded-lg bg-gray50">
                      <Avatar
                        src={product.thumbnail}
                        radius="sm"
                        alt={product.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="hover:text-blue transition-colors duration-200 inline-block">
                        {product.name}
                      </div>
                      <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                        <p className="text-sm font-medium text-gray500">
                          <span className="text-brand-main">
                            {formatPrice(product.price)}
                          </span>
                        </p>
                        <p className="text-sm text-gray400">
                          Qty:{" "}
                          <span className="font-medium text-gray500">
                            {product.quantity}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Order Status */}
      <section className="py-8 my-8 bg-white rounded-lg border border-gray100 shadow-sm">
        <div className="px-6">
          <h4 className="text-lg font-medium text-brand-main mb-4">
            Order Status
          </h4>
          <p className="text-sm font-medium text-gray500 mb-6">
            <span className="text-blue">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>{" "}
            on{" "}
            <time dateTime="2021-03-22" className="text-gray500">
              March 22, 2021
            </time>
          </p>
        </div>
        <div className="mt-6">
          <nav aria-label="Progress">
            <ol
              role="list"
              className="border-t border-b border-gray100 divide-y divide-gray100 xl:flex xl:divide-y-0"
            >
              {steps.map((step, stepIdx) => (
                <li key={step.name} className="relative xl:flex xl:flex-1">
                  {step.status === "complete" ? (
                    <div className="flex items-center w-full group">
                      <span className="flex items-center px-6 py-4 text-sm font-medium">
                        <span className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-green rounded-full group-hover:bg-blue transition-colors duration-200">
                          <CheckIcon
                            className="w-6 h-6 text-white"
                            aria-hidden="true"
                          />
                        </span>
                        <span className="ml-4 text-sm font-medium text-gray500">
                          {step.name}
                        </span>
                      </span>
                    </div>
                  ) : step.status === "current" ? (
                    <div
                      className="flex items-center px-6 py-4 text-sm font-medium"
                      aria-current="step"
                    >
                      <span className="flex items-center justify-center flex-shrink-0 w-10 h-10 border-2 border-blue rounded-full">
                        <span className="text-blue">{step.id}</span>
                      </span>
                      <span className="ml-4 text-sm font-medium text-brand-main">
                        {step.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center group">
                      <span className="flex items-center px-6 py-4 text-sm font-medium">
                        <span className="flex items-center justify-center flex-shrink-0 w-10 h-10 border border-gray300 rounded-full group-hover:border-gray400 transition-colors duration-200">
                          <span className="text-gray400 group-hover:text-gray500 transition-colors duration-200">
                            {step.id}
                          </span>
                        </span>
                        <span className="ml-4 text-sm font-medium text-gray400 group-hover:text-gray500 transition-colors duration-200">
                          {step.name}
                        </span>
                      </span>
                    </div>
                  )}

                  {stepIdx !== steps.length - 1 ? (
                    <>
                      {/* Arrow separator for lg screens and up */}
                      <div
                        className="absolute top-0 right-0 hidden w-5 h-full md:block"
                        aria-hidden="true"
                      >
                        <svg
                          className="w-full h-full text-gray100"
                          viewBox="0 0 22 80"
                          fill="none"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M0 -2L20 40L0 82"
                            vectorEffect="non-scaling-stroke"
                            stroke="currentColor"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </>
                  ) : null}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>

      {/* Billing */}
      <section aria-labelledby="summary-heading" className="mt-8">
        <h2
          id="summary-heading"
          className="text-lg font-medium text-brand-main mb-4"
        >
          Billing Summary
        </h2>
        <div className="bg-white px-4 py-6 sm:rounded-lg sm:px-6 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8 lg:py-8 border border-gray100 shadow-sm">
          <dl className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-2 md:gap-x-8 lg:col-span-7">
            <div className="bg-gray50 p-4 rounded-lg">
              <dt className="font-medium text-brand-main">Shipping address</dt>
              <dd className="mt-3 text-gray400">
                <span className="block">{shippingAddress.line1}</span>
                <span className="block">
                  {shippingAddress.city}, {shippingAddress.postalCode}
                </span>
                <span className="block">{shippingAddress.country}</span>
                <span className="block mt-2 text-blue">{phone}</span>
              </dd>
            </div>
          </dl>

          <dl className="mt-8 divide-y divide-gray100 text-sm lg:col-span-5 lg:mt-0 bg-gray50 p-4 rounded-lg">
            <div className="flex items-center justify-between pb-4">
              <dt className="text-gray400">Subtotal</dt>
              <dd className="font-medium text-gray500">
                {formatPrice(subTotal)}
              </dd>
            </div>
            <div className="flex items-center justify-between py-4">
              <dt className="text-gray400">Discount</dt>
              <dd className="font-medium text-red">-{formatPrice(discount)}</dd>
            </div>
            <div className="flex items-center justify-between py-4">
              <dt className="text-gray400">Tax</dt>
              <dd className="font-medium text-gray500">{formatPrice(tax)}</dd>
            </div>
            <div className="flex items-center justify-between pt-4">
              <dt className="font-medium text-brand-main">Order total</dt>
              <dd className="font-medium text-blue text-lg">
                {formatPrice(total)}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
};

export default OrderDetails;
