import { NextResponse } from "next/server";
import { DEMO_SERVICES } from "@/data/demo";
import { ServiceSlotParamsSchema, ServiceSlotSchema } from "@/lib/schemas";
import { generateSlotsForService } from "@/lib/data-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ serviceId: string; slotId: string }> }
) {
  const { serviceId, slotId } = await params;
  // Validate path params with Zod → 400 on invalid shape.
  const parsed = ServiceSlotParamsSchema.safeParse({ serviceId, slotId });
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid path parameters",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const service = DEMO_SERVICES.find((s) => s.id === serviceId);
  if (!service) {
    return NextResponse.json(
      { error: "Service not found" },
      { status: 404 }
    );
  }

  const allSlots = generateSlotsForService(serviceId);
  // First try to find by exact id (slot-{serviceId}-{dateStr}-{HHMM}).
  let slot = allSlots.find((s) => s.id === slotId);

  // If no exact match (e.g. user revisited a deep link from a past day),
  // try to recover by parsing date+time out of the slotId and looking
  // up a slot with the same date+time but fresh availability.
  if (!slot) {
    const m = slotId.match(
      /^slot-[a-z0-9-]+-(\d{4}-\d{2}-\d{2})-(\d{2})(\d{2})$/i
    );
    if (m) {
      const [, dateStr, hh, mm] = m;
      const recoveredTime = `${hh}:${mm}`;
      slot = allSlots.find(
        (s) => s.date === dateStr && s.time === recoveredTime
      );
    }
  }

  // Final fallback: just pick the first available slot so the user can
  // still complete a booking instead of seeing a dead-end error.
  if (!slot) {
    slot = allSlots.find((s) => s.available) ?? allSlots[0];
    if (!slot) {
      return NextResponse.json(
        { error: "No slots available" },
        { status: 404 }
      );
    }
  }

  const validated = ServiceSlotSchema.parse(slot);

  return NextResponse.json(
    {
      slot: validated,
      service: {
        id: service.id,
        name: service.name,
        duration: service.duration,
        price: service.price,
        provider: service.provider,
        masterName: service.masterName ?? null,
      },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    }
  );
}
