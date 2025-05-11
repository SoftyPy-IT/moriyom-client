import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addToCart } from "@/redux/features/cart";
import { IProduct } from "@/types/products.types";
import { Checkbox } from "@heroui/react";
import formatPrice from "@/utils/formatPrice";
import Button from "@/components/buttons/Button";
import GhostButton from "@/components/buttons/GhostButton";
import Image from "next/image";
import ImageGallery from "./ImageGallery";

interface IComboProductOverview {
  product: IProduct;
  isLoading: boolean;
  items: IProduct[];
}

const ComboProductOverview = ({
  product,
  isLoading,
  items,
}: IComboProductOverview) => {
  const dispatch = useAppDispatch();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [itemQuantities, setItemQuantities] = useState<{
    [key: string]: number;
  }>({});
  const [selectedVariants, setSelectedVariants] = useState<{
    [key: string]: { [variantName: string]: string };
  }>({});

  useEffect(() => {
    if (items) {
      const initialQuantities: { [key: string]: number } = {};
      const initialVariants: {
        [key: string]: { [variantName: string]: string };
      } = {};

      items.forEach((item) => {
        initialQuantities[item._id] = 1;
        if (item.variants) {
          initialVariants[item._id] = {};
          item.variants.forEach((variant) => {
            initialVariants[item._id][variant.name] =
              variant.values[0]?.value || "";
          });
        }
      });

      setItemQuantities(initialQuantities);
      setSelectedVariants(initialVariants);
      setSelectedItems(items.map((item) => item._id));
    }
  }, [items]);

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const updateItemQuantity = (itemId: string, delta: number) => {
    setItemQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + delta),
    }));
  };

  const handleVariantChange = (
    itemId: string,
    variantName: string,
    value: string,
  ) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [variantName]: value,
      },
    }));
  };

  const calculateTotalPrice = () => {
    return selectedItems.reduce((total, itemId) => {
      const item = items.find((i) => i._id === itemId);
      if (!item) return total;
      const price = item.discount_price || item.price;
      return total + price * (itemQuantities[itemId] || 1);
    }, 0);
  };

  const handleAddToCart = () => {
    selectedItems.forEach((itemId) => {
      const item = items.find((i) => i._id === itemId);
      if (!item) return;

      const selectedVariantsList = item.variants
        ? Object.entries(selectedVariants[itemId] || {}).map(
            ([name, value]) => ({ name, value }),
          )
        : undefined;

      const cartItem = {
        productId: item._id,
        name: item.name,
        thumbnail: item.thumbnail,
        price: item.discount_price || item.price,
        quantity: itemQuantities[itemId] || 1,
        totalPrice:
          (item.discount_price || item.price) * (itemQuantities[itemId] || 1),
        variants: selectedVariantsList,
        taxMethod: item.taxMethod,
        productTax: item.productTax,
      };

      dispatch(addToCart(cartItem));
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="bg-white border-b border-gray100 mt-28 relative top-5">
      <div className="pb-16 pt-6 sm:pb-24">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8 relative">
          {/* Image Gallery */}
          <div className="lg:col-span-7 lg:sticky top-36 max-h-[calc(100vh-80px)] overflow-y-auto">
            <ImageGallery images={product.images} productName={product.name} />
          </div>

          {/* Combo Details */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {product.name}
              </h1>
            </div>

            <p className="mt-4 text-gray-500">{product.short_description}</p>

            <h2 className="mt-6 text-lg font-medium text-gray-900">
              Combo Items
            </h2>

            <div className="mt-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col p-4 border rounded-lg  transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Checkbox
                        checked={selectedItems.includes(item._id)}
                        onChange={() => toggleItemSelection(item._id)}
                        isSelected={selectedItems.includes(item._id)}
                      />
                      <Image
                        height={64}
                        width={64}
                        src={item.thumbnail}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          {formatPrice(item.discount_price || item.price)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-2 border rounded hover:bg-gray-100"
                        onClick={() => updateItemQuantity(item._id, -1)}
                      >
                        -
                      </button>
                      <span className="w-8 text-center">
                        {itemQuantities[item._id] || 1}
                      </span>
                      <button
                        className="p-2 border rounded hover:bg-gray-100"
                        onClick={() => updateItemQuantity(item._id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Variants */}
                  {item.variants && (
                    <div className="mt-4 pl-12">
                      {item.variants.map((variant) => (
                        <div key={variant.name} className="mt-4">
                          <div className="flex flex-wrap gap-2">
                            {variant.values.map((value) => (
                              <button
                                key={value._id}
                                onClick={() =>
                                  handleVariantChange(
                                    item._id,
                                    variant.name,
                                    value.value,
                                  )
                                }
                                className={`px-2 py-1 rounded-lg border text-sm font-medium transition-all duration-200 ${
                                  selectedVariants[item._id]?.[variant.name] ===
                                  value.value
                                    ? variant.name === "Color"
                                      ? "border-gray-400"
                                      : "bg-brand-main text-white border-green-500"
                                    : "bg-gray-200 text-gray-900 border-gray-400 hover:bg-gray-300"
                                }`}
                                style={
                                  variant.name === "Color"
                                    ? {
                                        backgroundColor: value.value,
                                        padding: "12px",

                                        border:
                                          selectedVariants[item._id]?.[
                                            variant.name
                                          ] === value.value
                                            ? "2px solid #134865"
                                            : "2px solid #ECECEC",
                                      }
                                    : {}
                                }
                              >
                                {variant.name === "Color" ? "" : value.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total Price:</span>
                <span className="text-2xl font-bold text-orange-500">
                  {formatPrice(calculateTotalPrice())}
                </span>
              </div>

              <div className="mt-6 flex space-x-4">
                <Button
                  value="Add to Cart"
                  size="sm"
                  extraClass="flex-grow"
                  onClick={handleAddToCart}
                  disabled={selectedItems.length === 0}
                />
                <GhostButton size="sm" onClick={handleAddToCart}>
                  Buy Now
                </GhostButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComboProductOverview;
