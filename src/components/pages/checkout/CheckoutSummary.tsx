"use client";

import React from "react";
import { useAppSelector } from "@/redux/hooks";
import { selectOrderSummary } from "@/redux/features/orders/orderSlice";
import formatPrice from "@/utils/formatPrice";
import { selectCartItems } from "@/redux/features/cart";
import { Avatar } from "@heroui/react";

const CheckoutSummary: React.FC = () => {
  const orderSummary = useAppSelector(selectOrderSummary);
  const cartItems = useAppSelector(selectCartItems);

  return (
    <section
      aria-labelledby="summary-heading"
      className=" rounded-lg bg-white border border-gray100 shadow-sm px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8 sticky top-0"
    >
      <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
        Order summary
      </h2>

      <div className="my-6 space-y-4">
        {cartItems.map((item) => (
          <div
            key={item.productId}
            className="flex items-center justify-between border-b border-gray200 py-4"
          >
            <Avatar
              src={item.thumbnail}
              alt={item.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="ml-4 flex-1">
              <h3 className="text-base font-medium text-gray-900">
                {item.name}
              </h3>

              <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
            </div>
            <div className="text-xl font-medium text-gray-900">
              {formatPrice(item.price)}
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between  border-gray200 pt-4">
          <dt className="text-base font-medium text-gray-900">Subtotal</dt>
          <dd className="text-xl font-medium text-gray-900">
            {formatPrice(orderSummary.subTotal)}
          </dd>
        </div>
        <div className="flex items-center justify-between border-t border-gray200 pt-4">
          <dt className="text-base font-medium text-gray-900">Discount</dt>
          <dd className="text-xl font-medium text-gray-900">
            - {formatPrice(orderSummary.discount)}
          </dd>
        </div>
        {orderSummary.tax > 0 && (
          <div className="flex items-center justify-between border-t border-gray200 pt-4">
            <dt className="text-base font-medium text-gray-900">Tax</dt>
            <dd className="text-xl font-medium text-gray-900">
              {formatPrice(orderSummary.tax)}
            </dd>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-gray200 pt-4">
          <dt className="text-base font-medium text-gray-900">Total</dt>
          <dd className="text-xl font-medium text-gray-900">
            {formatPrice(orderSummary.total)}
          </dd>
        </div>
      </div>
    </section>
  );
};

export default CheckoutSummary;
