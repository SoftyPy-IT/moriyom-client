"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import SwiperCore from "swiper/core";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/20/solid";
import {
  HeartIcon,
  ShareIcon,
  ShoppingBagIcon,
  BoltIcon,
  TruckIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import {
  Button as NextButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  Badge,
  Divider,
} from "@heroui/react";

import Button from "@/components/buttons/Button";
import GhostButton from "@/components/buttons/GhostButton";
import Preloader from "@/components/common/Preloader";
import ImageGallery from "./ImageGallery";
import ProductRating from "./ProductRating";
import ProductShareModal from "./ProductShareModal";

import {
  useAddOrRemoveWishlistMutation,
  useGetProfileQuery,
} from "@/redux/features/auth/authApi";
import { setProfile } from "@/redux/features/auth/authSlice";
import { addToCart, changeItemQuantity } from "@/redux/features/cart";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { IProduct, IProductVariant } from "@/types/products.types";
import formatPrice from "@/utils/formatPrice";

interface IProductOverview {
  product: IProduct;
  isLoading: boolean;
}

SwiperCore.use([Navigation, FreeMode, Thumbs]);

const ProductOverview = ({ product, isLoading }: IProductOverview) => {
  const cartItems = useAppSelector((state) => state.cart.cartItems);
  const [selectedVariants, setSelectedVariants] = useState<{
    [key: string]: string;
  }>({});
  const [quantity, setQuantity] = useState(1);
  const [addOrRemoveWishlist] = useAddOrRemoveWishlistMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { data: profile, isSuccess } = useGetProfileQuery(undefined, {
    skip: status !== "authenticated",
  });
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [mainImg, setMainImg] = useState(product?.images[0]);

  useEffect(() => {
    if (isSuccess && profile.data) {
      dispatch(setProfile(profile.data));
    }
  }, [isSuccess, profile, dispatch]);

  useEffect(() => {
    // Reset quantity when product changes
    setQuantity(1);

    const initialSelection: { [key: string]: string } = {};
    product?.variants?.forEach((variant: IProductVariant) => {
      const cartItem = cartItems.find(
        (item) =>
          item.productId === product._id &&
          item.variants &&
          item.variants.some((v) => v.name === variant.name),
      );

      if (cartItem) {
        const selectedVariant = cartItem?.variants?.find(
          (v) => v.name === variant.name,
        );
        initialSelection[variant.name] = selectedVariant
          ? selectedVariant.value
          : variant.values.find((v: any) => v.quantity > 0)?.name ||
            variant.values[0]?.name;
      } else {
        // Prioritize variants that have stock
        initialSelection[variant.name] =
          variant.values.find((v: any) => v.quantity > 0)?.name ||
          variant.values[0]?.name;
      }
    });
    setSelectedVariants(initialSelection);
  }, [product, cartItems]);

  // Find available quantity based on selected variants
  const availableQuantity = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) {
      return product?.stock || 0;
    }

    let minQuantity = Infinity;

    product.variants.forEach((variant) => {
      const selectedValue = selectedVariants[variant.name];
      const variantValue = variant.values.find(
        (v) => v.value === selectedValue || v.name === selectedValue,
      ) as any;

      if (variantValue && variantValue.quantity < minQuantity) {
        minQuantity = variantValue.quantity;
      }
    });

    return minQuantity === Infinity ? 0 : minQuantity;
  }, [product?.variants, product?.stock, selectedVariants]);

  const handleVariantChange = (variantName: string, value: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: value,
    }));

    // Reset quantity to 1 if current quantity exceeds available
    const variant = product.variants?.find((v) => v.name === variantName);
    const variantValue = variant?.values.find(
      (v) => v.value === value || v.name === value,
    ) as any;

    if (variantValue && quantity > variantValue.quantity) {
      setQuantity(variantValue.quantity > 0 ? 1 : 0);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > availableQuantity) return;
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (availableQuantity <= 0) {
      toast.error("This product is out of stock");
      return;
    }

    if (quantity <= 0) {
      toast.error("Please select a valid quantity");
      return;
    }

    const cartItem = {
      productId: product._id,
      name: product.name,
      thumbnail: product.thumbnail,
      price: product.discount_price || product.price,
      quantity: quantity,
      totalPrice: (product.discount_price || product.price) * quantity,
      variants: Object.entries(selectedVariants).map(([key, value]) => ({
        name: key,
        value,
      })),
      taxMethod: product.taxMethod,
      productTax: product.productTax && {
        type: product.productTax.type,
        rate: product.productTax.rate,
      },
    };

    const existingCartItem = cartItems.find((item) => {
      if (item.productId !== cartItem.productId) return false;

      // Check if all variants match
      if (!item.variants || !cartItem.variants)
        return item.productId === cartItem.productId;

      if (item.variants.length !== cartItem.variants.length) return false;

      return item.variants.every((itemVariant) => {
        const matchingVariant = cartItem.variants.find(
          (v) => v.name === itemVariant.name,
        );
        return matchingVariant && matchingVariant.value === itemVariant.value;
      });
    });

    if (existingCartItem) {
      dispatch(
        changeItemQuantity({
          productId: cartItem.productId,
          quantity: existingCartItem.quantity + quantity,
          variants: cartItem.variants,
        }),
      );
      toast.success(`Added ${quantity} more to cart`);
    } else {
      dispatch(addToCart(cartItem));
      toast.success("Added to cart");
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/cart");
  };

  const handleAddOrRemoveFromWishList = async () => {
    const toastId = toast.loading("Please wait...");
    try {
      const action = profile?.data?.wishlist?.some(
        (item: any) => item._id === product._id,
      )
        ? "remove"
        : "add";

      const data = {
        productId: product._id,
        action,
      };
      await addOrRemoveWishlist(data).unwrap();
      toast.success(
        action === "add" ? "Added to wishlist" : "Removed from wishlist",
        {
          id: toastId,
          duration: 2000,
        },
      );
    } catch (error: any) {
      toast.error(error?.data?.message || "Something went wrong", {
        id: toastId,
        duration: 2000,
      });
    }
  };

  // Calculate discount percentage
  const discountPercentage = useMemo(() => {
    if (product?.discount_price && product?.price) {
      return Math.round(
        ((product.price - product.discount_price) / product.price) * 100,
      );
    }
    return 0;
  }, [product?.discount_price, product?.price]);

  if (isLoading) return <Preloader />;
  if (!product) return null;

  return (
    <div className="bg-white w-full mt-36 relative px-4 sm:px-6 lg:px-8">
      <div className="py-6 sm:py-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-x-12">
          {/* Left: Product Gallery */}
          <div className="lg:col-span-7 bg-gray-50 rounded-2xl p-2 sm:p-4">
            <ImageGallery images={product.images} productName={product.name} />
          </div>

          {/* Right: Product Info */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 self-start">
            <div className="space-y-6">
              {/* Product Header */}
              <div>
                {/* Category & Badge */}
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-500">
                    {product.category?.name || ""}
                  </div>
                  {product.discount_price > 0 && (
                    <Badge
                      color="danger"
                      variant="flat"
                      className="text-xs px-2"
                    >
                      {discountPercentage}% OFF
                    </Badge>
                  )}
                </div>

                {/* Title and actions */}
                <div className="flex justify-between items-start">
                  <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 leading-tight">
                    {product.name}
                  </h1>

                  <div className="flex items-center space-x-1">
                    {profile?.data && (
                      <NextButton
                        isIconOnly
                        variant="light"
                        size="sm"
                        color="danger"
                        onClick={handleAddOrRemoveFromWishList}
                        className="rounded-full"
                      >
                        {profile?.data?.wishlist?.some(
                          (item: any) => item._id === product._id,
                        ) ? (
                          <HeartIconSolid className="h-6 w-6" />
                        ) : (
                          <HeartIcon className="h-6 w-6" />
                        )}
                      </NextButton>
                    )}
                    <Popover showArrow placement="bottom" radius="sm">
                      <PopoverTrigger>
                        <button className="p-2 rounded-full hover:bg-gray-100">
                          <ShareIcon className="h-5 w-5 text-gray-700" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <ProductShareModal product={product} />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                {product.short_description}
              </p>

              {/* Price & Reviews */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <div className="flex items-baseline space-x-3">
                  <span className="text-2xl md:text-3xl font-bold text-brand-main">
                    {formatPrice(product.discount_price || product.price)}
                  </span>
                  {product.discount_price > 0 && (
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>

                <div className="flex items-center">
                  <ProductRating
                    ratingValue={product?.rating}
                    totalRatings={product?.reviews?.length}
                  />
                </div>
              </div>

              <Divider className="my-4" />

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-5">
                  {product.variants.map((variant: IProductVariant) => (
                    <div key={variant.name}>
                      <div className="flex justify-between items-center mb-2">
                        <h2 className="text-sm font-medium text-gray-900">
                          {variant.name}
                        </h2>
                        {selectedVariants[variant.name] && (
                          <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                            {selectedVariants[variant.name]}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {variant.values.map((value: any) => {
                          const isAvailable = value.quantity > 0;
                          const isSelected =
                            selectedVariants[variant.name] === value.value;

                          return (
                            <Tooltip
                              key={value._id}
                              content={
                                isAvailable ? "Available" : "Out of stock"
                              }
                              placement="top"
                              delay={300}
                            >
                              <Badge
                                content={
                                  value.quantity <= 5 && value.quantity > 0
                                    ? "Low"
                                    : ""
                                }
                                size="sm"
                                color="warning"
                                placement="top-right"
                                isInvisible={
                                  value.quantity > 5 || value.quantity === 0
                                }
                              >
                                <button
                                  onClick={() =>
                                    handleVariantChange(
                                      variant.name,
                                      value.value,
                                    )
                                  }
                                  disabled={!isAvailable}
                                  className={`
                                    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                    ${
                                      !isAvailable
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }
                                    ${
                                      isSelected
                                        ? "bg-brand-main text-white border-2 border-brand-main"
                                        : isAvailable
                                        ? "bg-white border-2 border-gray-200 hover:border-brand-main/70"
                                        : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                                    }
                                  `}
                                >
                                  {value.name}
                                </button>
                              </Badge>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity Selector */}
              {availableQuantity > 0 && (
                <div className="my-6">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-sm font-medium text-gray-900">
                      Quantity
                    </h2>
                    <div className="flex items-center">
                      {availableQuantity < 10 ? (
                        <span className="text-xs text-orange-500 font-medium flex items-center space-x-1">
                          <span>Only {availableQuantity} left</span>
                        </span>
                      ) : (
                        <span className="text-xs text-green-600 font-medium flex items-center space-x-1">
                          <span>In stock</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center mt-2 border border-gray-300 rounded-lg w-32">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-xl font-semibold">-</span>
                    </button>
                    <div className="flex-grow h-10 flex items-center justify-center border-x border-gray-300">
                      <span className="font-medium">{quantity}</span>
                    </div>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= availableQuantity}
                      className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-xl font-semibold">+</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                {availableQuantity > 0 ? (
                  <>
                    <Button
                      value="Add to Cart"
                      extraClass="flex-grow text-center justify-center py-3 flex items-center gap-2"
                      onClick={handleAddToCart}
                    />
                    <GhostButton
                      extraClass="flex-grow text-center justify-center py-3 flex items-center gap-2"
                      onClick={handleBuyNow}
                    >
                      <BoltIcon className="h-5 w-5" />
                      Buy Now
                    </GhostButton>
                  </>
                ) : (
                  <Button
                    value="Out of Stock"
                    extraClass="flex-grow text-center py-3"
                    disabled
                  />
                )}
              </div>

              {/* Size Chart */}
              {product?.size_chart && (
                <div className="mt-8 p-4 border border-gray-200 rounded-lg">
                  <h2 className="text-sm font-medium text-gray-900 mb-3">
                    Size Chart
                  </h2>
                  <div className="bg-white rounded-lg overflow-hidden">
                    <Image
                      src={product.size_chart}
                      alt="Size Chart"
                      className="w-full h-auto"
                      width={500}
                      height={500}
                      priority
                    />
                  </div>
                </div>
              )}

              {/* Features/Benefits */}
              <div className="mt-8 hidden sm:block">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Shopping Benefits
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      icon: <TruckIcon className="h-5 w-5" />,
                      title: "Fast Delivery",
                      desc: "2-4 business days",
                    },
                    {
                      icon: <ArrowPathIcon className="h-5 w-5" />,
                      title: "Easy Returns",
                      desc: "30 day return policy",
                    },
                    {
                      icon: <ShieldCheckIcon className="h-5 w-5" />,
                      title: "Secure Payment",
                      desc: "Safe & encrypted",
                    },
                  ].map((feature) => (
                    <div
                      key={feature.title}
                      className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-50 border border-gray-100 transition-all hover:shadow-sm"
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-brand-main/10 rounded-full mb-2">
                        <span className="text-brand-main">{feature.icon}</span>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {feature.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductOverview;
