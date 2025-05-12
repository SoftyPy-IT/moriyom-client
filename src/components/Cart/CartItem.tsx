import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  useDisclosure,
} from "@heroui/react";
import { ShoppingCart as BagIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  CartItem as CartItemType,
  changeItemQuantity,
  removeFromCart,
} from "@/redux/features/cart";
import {
  selectCoupon,
  setOrderSummary,
} from "@/redux/features/orders/orderSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import formatPrice from "@/utils/formatPrice";
import { useRouter } from "next/navigation";
import Button from "../buttons/Button";
import LinkButton from "../buttons/LinkButton";
import Item from "./Item";

const CartItem = () => {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [animate, setAnimate] = useState("");
  const cartItems = useAppSelector((state) => state.cart.cartItems);
  const dispatch = useAppDispatch();
  const coupon = useAppSelector(selectCoupon);

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

  const noOfItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleAnimate = useCallback(() => {
    if (noOfItems === 0) return;
    setAnimate("animate__animated animate__headShake");
  }, [noOfItems]);

  useEffect(() => {
    handleAnimate();
    setTimeout(() => {
      setAnimate("");
    }, 1000);
  }, [handleAnimate]);

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
        total: subTotal - discount + tax,
      }),
    );
    router.push("/checkout");
  };

  return (
    <>
      <div className="relative cursor-pointer" onClick={onOpen}>
        <BagIcon className="w-5 h-5 text-white" />
        {noOfItems > 0 && (
          <span
            className={`absolute -top-2 -right-2 sm:-top-3 sm:-right-3 text-xs sm:text-sm bg-tomato text-white px-1 sm:px-2 py-0.5 rounded-full font-medium shadow-md animate-bounce`}
          >
            {noOfItems}
          </span>
        )}
      </div>

      <Drawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        closeButton={
          <button
            type="button"
            className="outline-none focus:outline-none text-3xl sm:text-2xl"
            onClick={onOpenChange}
          >
            ✕
          </button>
        }
      >
        <DrawerContent className="rounded-none" style={{ height: "100vh" }}>
          {(onClose) => (
            <>
              <DrawerHeader className="bg-lightgreen flex justify-between items-center p-6">
                <h3 className="text-xl">cart ({noOfItems})</h3>
              </DrawerHeader>
              <DrawerBody className="px-4 overflow-y-auto custom-scrollbar">
                {cartItems.map((item: CartItemType) => (
                  <Item
                    key={item.productId}
                    name={item.name}
                    price={item.price * item.quantity!}
                    qty={item.quantity!}
                    img={item.thumbnail as string}
                    onAdd={() =>
                      handleQuantityChange(
                        item.productId as string,
                        item.quantity! + 1,
                        item.variants || [],
                      )
                    }
                    onRemove={() =>
                      handleQuantityChange(
                        item.productId,
                        item.quantity - 1 < 1 ? 1 : item.quantity - 1,
                        item.variants || [],
                      )
                    }
                    onDelete={() =>
                      dispatch(removeFromCart(item.productId as string))
                    }
                    variants={item.variants}
                  />
                ))}
              </DrawerBody>

              <DrawerFooter className="mt-4 px-4 flex flex-col">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>{formatPrice(discount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total</span>
                  <span>
                    {formatPrice(
                      subTotal - discount + tax > 0
                        ? subTotal - discount + tax
                        : 0,
                    )}
                  </span>
                </div>

                <LinkButton
                  href="/cart"
                  onClick={onClose}
                  extraClass="my-4 w-full"
                  noBorder={false}
                  inverted={false}
                >
                  View Cart
                </LinkButton>
                <Button
                  value="Checkout"
                  onClick={() => {
                    gotoCheckout();
                    onClose();
                  }}
                  disabled={cartItems.length < 1}
                  extraClass="text-center"
                  size="lg"
                />
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default CartItem;
