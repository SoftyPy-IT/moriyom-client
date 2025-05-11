"use client";

import Button from "@/components/buttons/Button";
import ErrorMessage from "@/components/common/ErrorMessage";
import SuccessMessage from "@/components/common/SuccessMessage";
import AppForm from "@/components/form/AppForm";
import AppInput from "@/components/form/AppInput";
import AppPhoneInput from "@/components/form/AppPhoneInput";
import { removeAllFromCart } from "@/redux/features/cart";
import { useCreateOrderMutation } from "@/redux/features/orders/order.api";
import {
  clearOrderData,
  selectCoupon,
  selectIsCouponApplied,
  selectOrderSummary,
} from "@/redux/features/orders/orderSlice";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import formatPrice from "@/utils/formatPrice";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import * as zod from "zod";

const checkoutSchema = zod.object({
  name: zod.string().min(1, "Name is required"),
  email: zod.string().email("Invalid email address"),
  phone: zod.string().min(1, "Phone number is required"),
  shippingAddress: zod.object({
    line1: zod.string().min(1, "Address line 1 is required"),
    line2: zod.string().optional(),
    city: zod.string().min(1, "City is required"),
    postalCode: zod.string().min(1, "Postal code is required"),
    state: zod.string().optional(),
    country: zod.string().min(1, "Country is required"),
    phone: zod.string().min(1, "Phone number is required"),
  }),
});

const CheckoutForm = ({ user }: { user: any }) => {
  const dispatch = useDispatch();
  const orderSummary = useSelector(selectOrderSummary);
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const [createOrder, { isLoading, isSuccess, isError }] =
    useCreateOrderMutation();
  const hasCoupon = useAppSelector(selectIsCouponApplied);
  const coupon = useAppSelector(selectCoupon);
  const [error, setError] = React.useState<any>(null);
  const router = useRouter();
  const onSubmit = async (data: any) => {
    const toastId = toast.loading("Submitting order...");
    try {
      const orderData = {
        orderItems: cartItems,
        orderTotal: orderSummary.total,
        ...orderSummary,
        ...data,
        paymentMethod: "Cash On Delivery",
        hasCoupon: hasCoupon,
        couponCode: coupon?.code,
      };

      const res = await createOrder(orderData).unwrap();

      if (res.success) {
        toast.success("Order submitted successfully", {
          id: toastId,
          duration: 2000,
        });
        router.push(`/checkout/success/${res.data._id}`);
        dispatch(removeAllFromCart());
        dispatch(clearOrderData());
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit order", {
        id: toastId,
        duration: 2000,
      });
      setError(error.data?.message || "Failed to submit order");
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 rounded-xl border border-gray-200 shadow-sm bg-white">
      <div className="mb-8 border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
        <p className="text-gray-500 mt-2">
          Complete your purchase by filling out the information below
        </p>
        {isError && <ErrorMessage errorMessage={error} />}
        {isSuccess && (
          <SuccessMessage successMessage="Order submitted successfully" />
        )}
      </div>

      <AppForm
        onSubmit={onSubmit}
        defaultValues={{
          name: user.name,
          email: user.email,
          phone: user.phone,
          shippingAddress: {
            line1: "",
            line2: "",
            city: "",
            postalCode: "",
            state: "",
            country: "",
            phone: "",
          },
        }}
        resolver={zodResolver(checkoutSchema)}
      >
        <div className="space-y-10">
          {/* Personal Information Section */}
          <section>
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                <span className="text-indigo-600 font-semibold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                Personal Information
              </h3>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <AppInput
                    type="text"
                    name="name"
                    label="Full Name"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <AppInput
                    type="email"
                    name="email"
                    label="Email Address"
                    placeholder="john@example.com"
                    required
                    variant="bordered"
                  />
                </div>
                <div className="md:col-span-1">
                  <AppPhoneInput
                    name="phone"
                    label="Phone Number"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Shipping Address Section */}
          <section>
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                <span className="text-indigo-600 font-semibold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                Shipping Address
              </h3>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <AppInput
                    type="text"
                    name="shippingAddress.line1"
                    label="Address Line 1"
                    placeholder="123 Main Street"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <AppInput
                    type="text"
                    name="shippingAddress.line2"
                    label="Address Line 2 (Optional)"
                    placeholder="Apartment, suite, unit, etc."
                    required={false}
                  />
                </div>
                <div>
                  <AppInput
                    type="text"
                    name="shippingAddress.city"
                    label="City"
                    placeholder="New York"
                    required
                  />
                </div>
                <div>
                  <AppInput
                    type="text"
                    name="shippingAddress.postalCode"
                    label="Postal / ZIP Code"
                    placeholder="10001"
                    required
                  />
                </div>
                <div>
                  <AppInput
                    type="text"
                    name="shippingAddress.state"
                    label="State / Province"
                    placeholder="NY"
                  />
                </div>
                <div>
                  <AppInput
                    name="shippingAddress.country"
                    label="Country"
                    placeholder="United States"
                    type="text"
                    required
                  />
                </div>
                <div>
                  <AppPhoneInput
                    name="shippingAddress.phone"
                    label="Delivery Phone"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Payment Method Section (Currently Cash on Delivery only) */}
          <section>
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                <span className="text-indigo-600 font-semibold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                Payment Method
              </h3>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center p-4 border border-indigo-200 rounded-lg bg-indigo-50">
                <div className="w-5 h-5 rounded-full border-2 border-indigo-600 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                </div>
                <span className="ml-3 font-medium text-gray-800">
                  Cash On Delivery
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500 pl-2">
                You'll pay when your order is delivered
              </p>
            </div>
          </section>
        </div>

        <div className="mt-10">
          <Button
            onClick={() => {}}
            value={isLoading ? "Processing..." : "Complete Purchase"}
            extraClass="w-full py-4 text-lg bg-brand-main hover:bg-brand-main text-white font-medium rounded-lg transition-all duration-200"
            type="submit"
            disabled={isLoading}
          />
          <p className="text-center text-sm text-gray-500 mt-4">
            By completing this purchase, you agree to our Terms of Service and
            Privacy Policy
          </p>
        </div>
      </AppForm>
    </div>
  );
};

export default CheckoutForm;
