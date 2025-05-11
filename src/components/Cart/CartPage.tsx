"use client";

import {
  CartItem as CartItemType,
  changeItemQuantity,
  removeAllFromCart,
  removeFromCart,
} from "@/redux/features/cart";
import {
  selectCoupon,
  setOrderSummary,
} from "@/redux/features/orders/orderSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import formatPrice from "@/utils/formatPrice";
import { ArrowLeftCircle as LeftArrow } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "../buttons/Button";
import GhostButton from "../buttons/GhostButton";
import CouponForm from "./CouponForm";

const CartPage = () => {
  const cartItems = useAppSelector((state) => state.cart.cartItems);
  const dispatch = useAppDispatch();
  const coupon = useAppSelector(selectCoupon);
  const router = useRouter();
  const subTotal = cartItems?.reduce(
    (acc: number, item) => acc + item.price * item.quantity,
    0,
  );

  const [quantityInput, setQuantityInput] = useState(
    cartItems.reduce((acc, item) => {
      acc[item.productId] = item.quantity;
      return acc;
    }, {} as { [key: string]: number }),
  );

  const handleQuantityChange = (
    productId: string,
    newQuantity: number,
    variants: {
      name: string;
      value: string;
    }[],
  ) => {
    setQuantityInput({ ...quantityInput, [productId]: newQuantity });
    dispatch(
      changeItemQuantity({
        productId,
        quantity: newQuantity,
        variants: variants,
      }),
    );
  };

  const discount = coupon
    ? coupon.discountType === "percentage"
      ? (subTotal * coupon.discount) / 100
      : coupon.discount
    : 0;

  const tax = cartItems?.reduce((acc: number, item) => {
    if (item.taxMethod === "Exclusive") {
      if (item.productTax?.type === "Percentage") {
        return acc + (item.price * item.productTax.rate * item.quantity) / 100;
      } else if (item.productTax?.type === "Fixed") {
        return acc + item.productTax.rate * item.quantity;
      }
    } else if (item.taxMethod === "Inclusive") {
      if (item.productTax?.type === "Percentage") {
        return (
          acc +
          (item.price * item.productTax.rate) / (100 + item.productTax.rate)
        );
      } else if (item.productTax?.type === "Fixed") {
        return acc + item.productTax.rate;
      }
    }
    return acc;
  }, 0);

  const gotoCheckout = () => {
    dispatch(
      setOrderSummary({
        subTotal,
        discount,
        totalBeforeTax: subTotal - discount,
        tax,
        total: subTotal + tax - discount,
      }),
    );

    router.push("/checkout");
  };

  return (
    <>
      <div>
        {/* ===== Heading & Continue Shopping */}
        <div className="px-4  w-full ">
          <h1 className="text-2xl sm:text-4xl text-center sm:text-left mt-6 mb-2 animatee__animated animate__bounce">
            Shopping Cart
          </h1>
          <div className="mt-6 mb-3">
            <Link href="/" className="inline-block">
              <span className=" flex items-center space-x-3">
                <LeftArrow size="sm" className="inline-block h-5 w-5" />{" "}
                <span> Continue Shopping</span>
              </span>
            </Link>
          </div>
        </div>

        {/* ===== Cart Table Section ===== */}
        <div className=" px-4  mb-14 flex flex-col lg:flex-row">
          <div className="h-full w-full lg:w-4/6 mr-4">
            <table className="w-full mb-6">
              <thead>
                <tr className="border-t-2 border-b-2 border-gray200">
                  <th className="font-normal text-left sm:text-center py-2 xl:w-72">
                    Product
                  </th>
                  <th
                    className={`font-normal py-2 hidden sm:block ${
                      cartItems.length === 0 ? "text-center" : "text-right"
                    }`}
                  >
                    Unit Price
                  </th>
                  <th className="font-normal py-2">Quantity</th>
                  <th className="font-normal py-2 text-right">Amount</th>
                  <th
                    className="font-normal py-2 text-right"
                    style={{ minWidth: "3rem" }}
                  ></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.length === 0 ? (
                  <tr className="w-full text-center h-60 border-b-2 border-gray200">
                    <td colSpan={5}>Cart is empty. </td>
                  </tr>
                ) : (
                  cartItems.map((item: CartItemType) => {
                    return (
                      <tr
                        className="border-b-2 border-gray200"
                        key={item.productId}
                      >
                        <td className="my-3 flex flex-col xl:flex-row items-start sm:items-center xl:space-x-2 text-center xl:text-left">
                          <Link
                            href={`/products/${encodeURIComponent(
                              item.productId,
                            )}`}
                          >
                            <div>
                              <Image
                                src={item.thumbnail as string}
                                alt={item.name}
                                width={95}
                                height={128}
                                className="h-32 xl:mr-4"
                              />
                            </div>
                          </Link>
                          <div className="flex flex-col items-start sm:items-center xl:items-start">
                            <span>{item.name}</span>
                            {item.variants && item.variants.length > 0 && (
                              <div className="flex flex-col mt-2">
                                {item.variants.map((variant, index) => (
                                  <span
                                    key={index}
                                    className="text-gray500 text-sm"
                                  >
                                    {variant.name}: {variant.value}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="text-right text-gray400 hidden sm:table-cell">
                          {formatPrice(item.price)}
                        </td>
                        <td>
                          <div className="w-12 h-32 sm:h-auto sm:w-3/4 md:w-2/6 mx-auto flex flex-col-reverse sm:flex-row border border-gray300 sm:divide-x-2 divide-gray300">
                            <div
                              onClick={() =>
                                handleQuantityChange(
                                  item.productId,
                                  item.quantity - 1 < 1 ? 1 : item.quantity - 1,
                                  item.variants || [],
                                )
                              }
                              className="h-full w-12 flex justify-center items-center cursor-pointer hover:bg-gray500 hover:text-gray100"
                            >
                              -
                            </div>
                            <div className="h-full w-12 flex justify-center items-center pointer-events-none">
                              {item.quantity}
                            </div>
                            <div
                              onClick={() =>
                                handleQuantityChange(
                                  item.productId,
                                  item.quantity + 1,
                                  item.variants || [],
                                )
                              }
                              className="h-full w-12 flex justify-center items-center cursor-pointer hover:bg-gray500 hover:text-gray100"
                            >
                              +
                            </div>
                          </div>
                        </td>
                        <td className="text-right text-gray400">
                          {formatPrice(item.price * item.quantity)}
                          <br />
                          <span className="text-xs">
                            {formatPrice(item.price)} x {item.quantity}
                          </span>
                        </td>
                        <td className="text-right" style={{ minWidth: "3rem" }}>
                          <button
                            onClick={() =>
                              dispatch(removeFromCart(item.productId))
                            }
                            type="button"
                            className="outline-none text-gray300 hover:text-gray500 focus:outline-none text-4xl sm:text-2xl"
                          >
                            &#10005;
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div>
              <GhostButton
                onClick={() => dispatch(removeAllFromCart())}
                extraClass="hidden sm:inline-block"
              >
                Clear Cart
              </GhostButton>
            </div>
          </div>
          <div className="h-full w-full lg:w-4/12 mt-10 lg:mt-0">
            {/* Cart Totals */}
            <div className="border border-gray300 divide-y-2 divide-gray200 p-6">
              <CouponForm />
              <h2 className="text-xl mb-3">Cart Total</h2>
              <div className="flex justify-between py-2">
                <span className="uppercase">Subtotal</span>
                <span>{formatPrice(subTotal)}</span>
              </div>

              <div className="flex justify-between py-2">
                <span>Discount</span>
                <span>{formatPrice(discount)}</span>
              </div>

              <div className="flex justify-between py-2">
                <span>Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>

              <div className="flex justify-between py-3">
                <span>Grand Total</span>
                <span>{formatPrice(subTotal + tax - discount)}</span>
              </div>
              <Button
                value="Proceed to Checkout"
                size="xl"
                extraClass="w-full"
                onClick={gotoCheckout}
                disabled={cartItems.length < 1 ? true : false}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;
