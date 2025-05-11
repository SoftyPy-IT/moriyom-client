import { IStorefront } from "@/types/storefront.types";

const productionURL = process.env.NEXT_PUBLIC_API_URL;
const developmentURL = process.env.NEXT_PUBLIC_API_URL;
const mode = process.env.NEXT_PUBLIC_NODE_ENV;

export async function getGlobalData() {
  const response = await fetch(
    `${mode === "production" ? productionURL : developmentURL}/storefront/all`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch global data");
  }

  const data = await response.json();
  return data.data as IStorefront;
}

export async function getCategory(id: string) {
  const response = await fetch(
    `${
      mode === "production" ? productionURL : developmentURL
    }/category/categories`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch global data");
  }

  const data = await response.json();
  const category = data.data.filter(
    (cat: any) => cat._id === id || cat.slug === id,
  );
  return category[0];
}

export async function getProducts(id: string) {
  const response = await fetch(
    `${mode === "production" ? productionURL : developmentURL}/product/all`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch global data");
  }

  const data = await response.json();
  const product = data.data.filter(
    (prod: any) => prod._id === id || prod.slug === id,
  );
  return product[0];
}

export async function getBlog(id: string) {
  const response = await fetch(
    `${mode === "production" ? productionURL : developmentURL}/blog/${id}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch global data");
  }

  const data = await response.json();
  return data.data;
}
