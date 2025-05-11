import { FC, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Star } from "lucide-react";
import { changeItemQuantity, addToCart } from "@/redux/features/cart";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import formatPrice from "@/utils/formatPrice";
import { truncate } from "lodash";
import { useRouter } from "next/navigation";

interface ItemType {
  id: string;
  name: string;
  price: number;
  img1: string;
  img2: string;
  slug: string;
  discount?: number;
  isNew?: boolean;
  category?: string;
  mainCategory?: string;
  subCategory?: string;
  link?: string;
  rating?: number;
  reviewCount?: number;
}

interface Props {
  item: ItemType;
  className?: string;
}

const RatingStars: FC<{ rating: number; reviewCount?: number }> = ({
  rating,
  reviewCount,
}) => {
  const totalStars = 5;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1">
      <div
        className="flex items-center"
        role="img"
        aria-label={`Rating: ${rating} out of 5 stars`}
      >
        {[...Array(totalStars)].map((_, index) => (
          <Star
            key={index}
            className={`w-3 h-3 md:w-4 md:h-4 ${
              index < fullStars
                ? "fill-[#FFBF00] text-[#FFBF00]"
                : index === fullStars && hasHalfStar
                ? "fill-[#FFBF00] text-[#FFBF00] half-star"
                : "fill-gray-200 text-gray-200"
            } transition-colors`}
            strokeWidth={1.5}
          />
        ))}
      </div>
      {reviewCount !== undefined && (
        <span className="text-xs md:text-sm text-gray-500">
          ({reviewCount})
        </span>
      )}
    </div>
  );
};

const Card: FC<Props> = ({ item, className = "" }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.cartItems);
  const router = useRouter();

  const {
    id,
    name,
    slug,
    price,
    img1,
    img2,
    discount,
    isNew,
    category,
    mainCategory,
    subCategory,
    rating,
    reviewCount,
  } = item;

  const itemLink = item.link
    ? item.link
    : `/products/${encodeURIComponent(slug)}`;
  const discountedPrice = discount ? price - (price * discount) / 100 : price;

  const addToCartHandler = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const cartItem = {
      productId: id,
      name,
      thumbnail: img1,
      price: discountedPrice,
      quantity: 1,
      totalPrice: discountedPrice,
      variants: [],
      taxMethod: "inclusive",
      productTax: null,
    };

    const existingCartItem = cartItems.find(
      (ci) => ci.productId === cartItem.productId,
    );

    if (existingCartItem) {
      dispatch(
        changeItemQuantity({
          productId: cartItem.productId,
          quantity: existingCartItem.quantity + 1,
        }),
      );
    } else {
      dispatch(addToCart(cartItem as any));
    }

    setTimeout(() => setIsLoading(false), 500);
  };

  // Determine if we have any category information to display
  const hasCategoryInfo = mainCategory || subCategory || category;

  return (
    <div
      className={`group relative w-full bg-white rounded overflow-hidden transition-all duration-300 flex flex-col border border-gray-100 cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(itemLink)}
    >
      <div className="relative w-full pt-[133.33%] overflow-hidden">
        <Image
          src={isHovered ? img2 : img1}
          alt={name}
          fill
          className={`object-cover transition-all duration-700 ease-out ${
            isHovered ? "scale-110" : "scale-100"
          }`}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            addToCartHandler(e);
          }}
          disabled={isLoading}
          className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-blue-600 py-2 px-4 text-sm font-medium rounded-full flex items-center justify-center transition-all duration-300 ${
            isLoading
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-brand-main hover:text-white"
          } ${isHovered ? "opacity-100" : "opacity-0"}`}
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          <span className="block sm:hidden">
            {isLoading ? "Adding..." : "Add"}
          </span>
          <span className="hidden sm:block">
            {isLoading ? "Adding..." : "Add to Cart"}
          </span>
        </button>
      </div>
      <div className="p-4 space-y-1 flex-grow flex flex-col justify-between h-[140px]">
        <div>
          {/* Category information section - show any available data */}
          <div className="flex flex-col md:flex-row justify-between mb-2 text-xs text-gray-600">
            {/* Left side - category path */}
            {(mainCategory || subCategory) && (
              <span className="flex items-center gap-1">
                {mainCategory && (
                  <span className="font-semibold">{mainCategory}</span>
                )}
                {mainCategory && subCategory && "/"}
                {subCategory && <span className="italic">{subCategory}</span>}
              </span>
            )}

            {/* Right side - category name and rating */}
            <div className="flex items-center gap-2">
              {category && <span className="text-xs">{category}</span>}
              {rating && (
                <RatingStars rating={rating} reviewCount={reviewCount} />
              )}
            </div>
          </div>

          <h3 className="text-sm md:text-base font-semibold group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
            <span className="bg-left-bottom bg-gradient-to-r from-blue-600 to-blue-600 bg-[length:0%_2px] bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-300 ease-out">
              {truncate(name, {
                length: 50,
                separator: " ",
              })}
            </span>
          </h3>
        </div>
        <div>
          <p className="text-lg font-medium">
            {discount ? (
              <>
                <span className="text-gray-500 line-through mr-2">
                  {formatPrice(price)}
                </span>
                <span className="text-gray-800">
                  {formatPrice(discountedPrice)}
                </span>
              </>
            ) : (
              <span className="text-gray-800">{formatPrice(price)}</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Card;
