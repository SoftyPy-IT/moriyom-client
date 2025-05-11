export { default } from "next-auth/middleware";
export const config = {
  matcher: [
    "/profile",
    "/checkout",
    "/checkout/:path*",
    "/profile/:path*",
    "/track-order",
    "/wishlist",
  ],
};
