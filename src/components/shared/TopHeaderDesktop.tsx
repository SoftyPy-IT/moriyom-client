"use client";

import Link from "next/link";
import Logo from "../common/Logo";

import {
  selectProfile,
  useCurrentToken,
} from "@/redux/features/auth/authSlice";
import { useAppSelector } from "@/redux/hooks";
import UserIcon from "./UserIcon";

const TopHeaderDesktop = () => {
  const user = useAppSelector(selectProfile);
  const isAuthenticated = useAppSelector(useCurrentToken);
  return (
    <div className="relative flex h-16 px-6 justify-between z-50">
      <div className="relative flex flex-1 items-center justify-center px-2 sm:absolute sm:inset-0">
        <Link href="/" className=" hidden flex-shrink-0 items-center lg:flex">
          <Logo />
        </Link>
      </div>

      <div className="hidden space-x-3 lg:relative lg:z-10  lg:flex lg:items-center">
        {isAuthenticated ? (
          <>
            <UserIcon profile={isAuthenticated ? user : null} />
          </>
        ) : (
          <>
            <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-4">
              <Link
                href="/register"
                className="text-sm font-medium text-gray-800 hover:text-gray-500"
              >
                Create an account
              </Link>
              <span className="h-6 w-px bg-gray400" aria-hidden="true" />
              <Link
                href="/login"
                className="text-sm font-medium text-gray-800 hover:text-gray-500"
              >
                Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TopHeaderDesktop;
