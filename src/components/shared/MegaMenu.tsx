import { Transition } from "@headlessui/react";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import HeaderSearchBar from "./HeaderSearchBar";

interface SubCategory {
  _id: string;
  name: string;
  slug: string;
  category: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  subCategories?: {
    subCategory: SubCategory;
    serial: number;
    _id: string;
  }[];
  mainCategory?: string;
}

interface CategoryTree {
  _id: string;
  name: string;
  image?: string;
  slug: string;
  categories: {
    category: Category;
    serial: number;
    _id: string;
  }[];
}

interface IProduct {
  _id: string;
  name: string;
  images: string[];
  price: number;
  discount_price: number;
}

type TQueryParam = {
  name: string;
  value: string;
};

// Helper function to get the correct link for a category
const getCategoryLink = (
  categoryName: string,
  categorySlug: string,
): string => {
  return categoryName.toUpperCase() === "COMBO"
    ? "/products/combo"
    : `/categories/${categorySlug}`;
};

// NestedCategoryMenu Component
const NestedCategoryMenu = ({
  categories,
  mainCategorySlug,
  onClose,
}: {
  categories: {
    category: Category;
    serial: number;
    _id: string;
  }[];
  mainCategorySlug: string;
  onClose: () => void;
}) => {
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Sort categories by their serial number
  const sortedCategories = [...categories].sort((a, b) => a.serial - b.serial);

  return (
    <div className="py-2 max-h-[80vh] overflow-y-auto">
      {sortedCategories.map((categoryItem) => {
        const category = categoryItem.category;
        const hasSubCategories =
          category.subCategories && category.subCategories.length > 0;
        const isExpanded = expandedCategories[category._id];

        return (
          <div
            key={category._id}
            className="border-b border-gray-100 last:border-b-0"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <Link
                href={
                  category.name.toUpperCase() === "COMBO"
                    ? "/products/combo"
                    : `/categories/${mainCategorySlug}/${category.slug}`
                }
                className="text-gray-500 hover:text-tomato transition-colors duration-200 font-medium"
                onClick={onClose}
              >
                {category.name}
              </Link>
              {hasSubCategories && (
                <button
                  onClick={() => toggleCategory(category._id)}
                  className="p-1 text-gray-400 hover:text-tomato focus:outline-none"
                  aria-expanded={isExpanded}
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}
            </div>

            {/* SubCategories */}
            {hasSubCategories && isExpanded && (
              <div className="pl-4 pb-2 bg-gray-50">
                {category.subCategories &&
                  category?.subCategories.map((subCat) => (
                    <Link
                      key={subCat._id}
                      href={
                        subCat.subCategory.name.toUpperCase() === "COMBO"
                          ? "/products/combo"
                          : `/categories/${mainCategorySlug}/${category.slug}/${subCat.subCategory.slug}`
                      }
                      className="block py-2 px-4 text-gray-400 hover:text-tomato text-sm hover:bg-white transition-colors duration-200"
                      onClick={onClose}
                    >
                      {subCat.subCategory.name}
                    </Link>
                  ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Improved CategoryDropdown Component
const CategoryDropdown = ({ navigation }: { navigation: CategoryTree[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveCategory(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleCategoryHover = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const handleClose = () => {
    setIsOpen(false);
    setActiveCategory(null);
  };

  return (
    <div className="relative " ref={dropdownRef}>
      <button
        className="flex items-center gap-x-1 px-4 py-2 text-white bg-tomato rounded hover:bg-red-600 transition-colors duration-200 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="h-5 w-5" />
        <span>CATEGORIES</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <Transition
        show={isOpen}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <div className="absolute left-0 z-50 w-64 mt-2 bg-white rounded-md shadow-lg ring-1 ring-gray-200">
          {navigation.map((category) => (
            <div
              key={category._id}
              className="border-b border-gray-100 last:border-b-0 relative group"
              onMouseEnter={() => handleCategoryHover(category._id)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <div className="px-4 py-3">
                <Link
                  href={getCategoryLink(category.name, category.slug)}
                  className="flex items-center justify-between text-gray-500 hover:text-tomato font-medium"
                  onClick={handleClose}
                >
                  <span>{category.name}</span>
                  {category.categories && category.categories.length > 0 && (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Link>
              </div>

              {/* Nested dropdown for main categories */}
              {category.categories &&
                category.categories.length > 0 &&
                activeCategory === category._id && (
                  <div className="absolute left-full top-0 w-64 bg-white shadow-lg rounded-md z-50">
                    <NestedCategoryMenu
                      categories={category.categories}
                      mainCategorySlug={category.slug}
                      onClose={handleClose}
                    />
                  </div>
                )}
            </div>
          ))}
        </div>
      </Transition>
    </div>
  );
};

// Main Header Component
export default function ProfessionalHeader({
  navigation,
}: {
  navigation: CategoryTree[];
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Close mobile menu when window resizes to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileMenuOpen]);

  return (
    <header className="bg-white sticky top-0 z-40 w-full">
      <div className="container mx-auto ">
        {/* Main Header */}
        <div className="flex items-center border p-3 justify-between h-16">
          {/* Logo can go here if needed */}
          <div className="hidden border lg:block">
            <CategoryDropdown navigation={navigation} />
          </div>

          {/* Center - Search */}
          <div className={`flex-1 mx-4 ${isSearchFocused ? "z-50" : ""}`}>
            <HeaderSearchBar />
          </div>

          {/* Right Side - Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-500 hover:text-tomato font-medium transition-colors duration-200"
            >
              HOME
            </Link>
            <Link
              href="/products"
              className="text-gray-500 hover:text-tomato font-medium transition-colors duration-200"
            >
              SHOP
            </Link>
            <Link
              href="/products/combo"
              className="text-gray-500 hover:text-tomato font-medium transition-colors duration-200"
            >
              COMBO
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
