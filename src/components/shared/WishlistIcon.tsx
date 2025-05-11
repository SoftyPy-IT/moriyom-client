"use client";

import { useCallback, useEffect, useState } from "react";

import { selectProfile } from "@/redux/features/auth/authSlice";
import { useAppSelector } from "@/redux/hooks";
import { Heart } from "lucide-react";

import Link from "next/link";
import React from "react";

const WishlistIcon = () => {
  const [animate, setAnimate] = useState("");
  const profile = useAppSelector(selectProfile);
  const noOfWishlist = profile?.wishlist?.length || 0;

  const handleAnimate = useCallback(() => {
    if (noOfWishlist === 0) return;
    setAnimate("animate__animated animate__headShake");
  }, [noOfWishlist, setAnimate]);

  // Set animate when no of wishlist changes
  useEffect(() => {
    handleAnimate();
    setTimeout(() => {
      setAnimate("");
    }, 1000);
  }, [handleAnimate]);

  return (
    <Link href="/wishlist" passHref>
      <Heart className="w-5 h-5 text-brand-main" />
      {noOfWishlist > 0 && (
        <span
          className={`${animate} absolute text-xs -top-2.5 sm:-top-3 -right-2.5 sm:-right-3 bg-gray500 text-gray100 py-0.5 sm:py-1 px-1.5 sm:px-2 rounded-full`}
        >
          {noOfWishlist}
        </span>
      )}
    </Link>
  );
};

export default WishlistIcon;
