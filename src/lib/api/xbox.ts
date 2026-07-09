import { StorePrice } from "@/types";

const XBOX_CATALOG = "https://displaycatalog.mp.microsoft.com/v7.0/products";

interface XboxProductWrapper {
  Product?: {
    ProductId?: string;
    Title?: string;
    Properties?: Record<string, unknown>;
    DisplaySkuAvailabilities?: Array<{
      Availabilities?: Array<{
        OrderManagementData?: {
          Price?: { ListPrice?: number; MSRP?: number };
        };
      }>;
    }>;
  };
}

export async function getXboxPrices(gameTitle: string): Promise<StorePrice[]> {
  try {
    const res = await fetch(
      `${XBOX_CATALOG}?market=TR&languages=tr&query=${encodeURIComponent(gameTitle)}&mediaType=Games&count=3`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];

    const data = await res.json();
    const products: XboxProductWrapper[] = data?.Products || [];
    if (!products.length) return [];

    const product = products[0]?.Product;
    if (!product) return [];

    const availability = product.DisplaySkuAvailabilities?.[0]?.Availabilities?.[0];
    const priceData = availability?.OrderManagementData?.Price;
    if (!priceData) return [];

    const listPrice = priceData.MSRP ?? priceData.ListPrice ?? 0;
    const salePrice = priceData.ListPrice ?? listPrice;
    const discount =
      listPrice > 0 ? Math.round(((listPrice - salePrice) / listPrice) * 100) : 0;

    const productId = product.ProductId || "";
    const dealUrl = productId
      ? `https://www.xbox.com/tr-tr/games/store/${productId}`
      : `https://www.xbox.com/tr-tr/games/store/search?q=${encodeURIComponent(gameTitle)}`;

    const base: Omit<StorePrice, "platformId" | "platformName"> = {
      price: salePrice,
      normalPrice: listPrice,
      discount,
      savings: Math.round((listPrice - salePrice) * 100) / 100,
      dealUrl,
      isOnSale: discount > 0,
      lastUpdated: new Date().toISOString(),
    };

    return [
      { ...base, platformId: "xbox-series", platformName: "Xbox Store (Series X|S)" },
      { ...base, platformId: "xbox-one", platformName: "Xbox Store (One)" },
    ];
  } catch {
    return [];
  }
}

export async function getXboxGamePassStatus(gameTitle: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${XBOX_CATALOG}?market=TR&languages=tr&query=${encodeURIComponent(gameTitle)}&mediaType=Games&count=1`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return false;
    const data = await res.json();
    const product = data?.Products?.[0]?.Product;
    const categories = (product?.Properties?.Categories as string[]) || [];
    return categories.some((c) => /game pass/i.test(c));
  } catch {
    return false;
  }
}
