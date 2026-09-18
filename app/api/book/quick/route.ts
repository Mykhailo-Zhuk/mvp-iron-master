import { NextResponse } from "next/server";
import { DEMO_SERVICES } from "@/data/demo";
import { BookingSchema } from "@/lib/schemas";
import { generateId } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = BookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    const service = DEMO_SERVICES.find((s) => s.id === payload.serviceId);

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    if (!service.available) {
      return NextResponse.json(
        { error: "Service is not available" },
        { status: 409 }
      );
    }

    const bookingDate = new Date(`${payload.date}T${payload.time}:00`);
    if (bookingDate.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Booking time must be in the future" },
        { status: 400 }
      );
    }

    const bookingId = generateId("book");

    console.log("[QUICK_BOOKING_CREATED]", {
      bookingId,
      service: service.name,
      customer: payload.customerName,
      phone: payload.customerPhone,
      date: payload.date,
      time: payload.time,
      notes: payload.notes,
    });

    return NextResponse.json(
      {
        success: true,
        booking: {
          id: bookingId,
          ...payload,
          service: {
            id: service.id,
            name: service.name,
            duration: service.duration,
            price: service.price,
          },
          createdAt: new Date().toISOString(),
          status: "pending_call",
        },
      },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}
