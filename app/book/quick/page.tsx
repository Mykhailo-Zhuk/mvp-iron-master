"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Phone,
  User as UserIcon,
  MessageSquare,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Service } from "@/lib/schemas";
import { generateSlotsForService, getSlotsByDate } from "@/lib/data-helpers";

export default function QuickBookPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load services on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/book");
        if (!res.ok) throw new Error("Failed to load services");
        const data = await res.json();
        if (!cancelled) {
          const list = (data.services as Service[]) ?? [];
          setServices(list);
          if (list.length && !serviceId) setServiceId(list[0].id);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute slots for the selected service
  const slots = useMemo(
    () => (serviceId ? generateSlotsForService(serviceId, 7) : []),
    [serviceId]
  );
  const grouped = useMemo(() => getSlotsByDate(slots), [slots]);
  const dates = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  // Auto-pick first date when service changes
  useEffect(() => {
    if (!serviceId) return;
    if (dates.length && !dates.includes(date)) {
      setDate(dates[0]);
      setTime("");
    }
  }, [serviceId, dates, date]);

  const timesForDate = (date && grouped[date]) || [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!serviceId) return setError("Оберіть послугу");
    if (!date) return setError("Оберіть дату");
    if (!time) return setError("Оберіть час");
    if (customerName.trim().length < 2) return setError("Введіть імʼя (мінімум 2 символи)");
    if (customerPhone.trim().length < 8) return setError("Введіть коректний телефон");

    setSubmitting(true);
    fetch("/api/book/quick", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        date,
        time,
        notes: notes.trim() || undefined,
      }),
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
        setConfirmed(true);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unknown error");
      })
      .finally(() => setSubmitting(false));
  }

  if (confirmed) {
    const svc = services.find((s) => s.id === serviceId);
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-6 dark:from-emerald-950/30 dark:to-teal-950/30">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="max-w-md rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-xl dark:border-emerald-800 dark:bg-zinc-950"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold">Заявку прийнято!</h2>
          <p className="mt-2 text-muted-foreground">
            {svc?.name && <span className="font-semibold">{svc.name}</span>}
            {svc ? " · " : ""}
            <span className="font-semibold">{date} о {time}</span>
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Ми зателефонуємо вам найближчим часом, щоб підтвердити запис.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/">На головну</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/book/quick">Нова заявка</Link>
            </Button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 flex-shrink-0" />
              <span>На головну</span>
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <section className="mx-auto max-w-2xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
              <Sparkles className="h-3 w-3" />
              Швидкий запис
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl">Записатись онлайн</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Заповніть форму і ми зателефонуємо вам для підтвердження.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Деталі запису
              </CardTitle>
              <CardDescription>Оберіть зручну послугу, дату та час.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-medium">
                    <Sparkles className="h-3 w-3" />
                    Оберіть послугу <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {s.price > 0 ? `${s.price} ₴` : "безкоштовно"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium">
                      <CalendarDays className="h-3 w-3" />
                      Дата <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setTime("");
                      }}
                      className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <option value="">Оберіть дату</option>
                      {dates.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium">
                      <Clock className="h-3 w-3" />
                      Час <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      disabled={!date}
                      className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <option value="">Оберіть час</option>
                      {timesForDate
                        .filter((s) => s.available)
                        .map((s) => (
                          <option key={s.id} value={s.time}>
                            {s.time}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium">
                      <UserIcon className="h-3 w-3" />
                      Імʼя <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      minLength={2}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ваше імʼя"
                      className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-950"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium">
                      <Phone className="h-3 w-3" />
                      Телефон <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+380 ..."
                      className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-950"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-medium">
                    <MessageSquare className="h-3 w-3" />
                    Коментар
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Додаткові побажання або деталі..."
                    rows={3}
                    maxLength={500}
                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-950"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    Натискаючи кнопку, ви погоджуєтесь з обробкою персональних даних.
                  </p>
                  <Button type="submit" size="lg" disabled={submitting}>
                    {submitting ? "Надсилаємо..." : "Підтвердити запис"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </main>
  );
}
