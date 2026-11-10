import { NextResponse } from "next/server";
import { getProducts, getPickupZones } from "@/lib/services/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [products, pickupZones] = await Promise.all([
      getProducts(),
      getPickupZones(),
    ]);

    const catalogs = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      defaultStartTime: p.default_start_time || "08:00",
      passengerCapacity: p.passenger_capacity || 4,
      routeName: p.route_name || "",
      basePrice: p.base_price,
      status: p.status,
    }));

    return NextResponse.json({
      success: true,
      data: {
        catalogs,
        pickupZones: pickupZones.map((z) => ({
          id: z.id,
          name: z.name,
          surcharge: z.surcharge,
        })),
      },
    });
  } catch (err) {
    console.error("[API schedule/catalogs] Error:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memuat daftar katalog." },
      { status: 500 }
    );
  }
}

