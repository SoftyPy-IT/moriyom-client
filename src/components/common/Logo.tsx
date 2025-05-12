"use client";

import { selectStorefrontData } from "@/redux/features/storefront/storeSlice";
import { useAppSelector } from "@/redux/hooks";
import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  const data = useAppSelector(selectStorefrontData);

  return (
    <Link
      href="/"
      className="flex justify-center py-2 items-center rounded-md focus:outline-none overflow-hidden"
    >
      <Image
        src={data ? data.logo : "/logo.png"}
        alt="E-soft logo"
        width={150}
        height={100}
        className="scale-[100%]"
      />
    </Link>
  );
};

export default Logo;
