/**
 * СТО IRON MASTER — налаштування бізнесу
 * MVP by Mykhailo Zhuk
 */
import type { DayKey, Settings, SettingsUpdate } from "@/lib/settings-schemas";

const FAKE_TELEGRAM_TOKEN = "demo1234:tG1234567890ABCdef";
const FAKE_LIQPAY_PUBLIC = "sandbox_i00000000000";
const FAKE_LIQPAY_PRIVATE = "sandbox_XXXXXXXXXXXXXXXX";
const FAKE_MONOPAY_PUBLIC = "mp_demo_pub_0000000000";
const FAKE_MONOPAY_PRIVATE = "mp_demo_priv_0000000000";

const STORE: Settings = {
  restaurantName: "СТО IRON MASTER",
  address: "Київ, проспект Науки, 51, Голосіївський район",
  phone: "+38 (096) 688-14-14",
  email: "info@iron-master.com.ua",
  currency: "UAH",
  workingHours: {
    mon: { open: true, from: "09:00", to: "19:00" },
    tue: { open: true, from: "09:00", to: "19:00" },
    wed: { open: true, from: "09:00", to: "19:00" },
    thu: { open: true, from: "09:00", to: "19:00" },
    fri: { open: true, from: "09:00", to: "19:00" },
    sat: { open: true, from: "09:00", to: "17:00" },
    sun: { open: false, from: "10:00", to: "16:00" },
  },
  telegramBotToken: FAKE_TELEGRAM_TOKEN,
  liqPayPublicKey: FAKE_LIQPAY_PUBLIC,
  liqPayPrivateKey: FAKE_LIQPAY_PRIVATE,
  monoPayPublicKey: FAKE_MONOPAY_PUBLIC,
  monoPayPrivateKey: FAKE_MONOPAY_PRIVATE,
};

export function maskSecret(value: string | undefined): string {
  if (!value) return "";
  if (value.length <= 4) return "•".repeat(value.length);
  return `••••••••${value.slice(-4)}`;
}

export function getPublicSettings(): Omit<Settings, "telegramBotToken" | "liqPayPublicKey" | "liqPayPrivateKey" | "monoPayPublicKey" | "monoPayPrivateKey"> & {
  telegramBotToken: string;
  liqPayPublicKey: string;
  liqPayPrivateKey: string;
  monoPayPublicKey: string;
  monoPayPrivateKey: string;
  secretsConfigured: {
    telegramBotToken: boolean;
    liqPayPublicKey: boolean;
    liqPayPrivateKey: boolean;
    monoPayPublicKey: boolean;
    monoPayPrivateKey: boolean;
  };
} {
  return {
    restaurantName: STORE.restaurantName,
    address: STORE.address,
    phone: STORE.phone,
    email: STORE.email,
    currency: STORE.currency,
    workingHours: STORE.workingHours,
    telegramBotToken: maskSecret(STORE.telegramBotToken),
    liqPayPublicKey: maskSecret(STORE.liqPayPublicKey),
    liqPayPrivateKey: maskSecret(STORE.liqPayPrivateKey),
    monoPayPublicKey: maskSecret(STORE.monoPayPublicKey),
    monoPayPrivateKey: maskSecret(STORE.monoPayPrivateKey),
    secretsConfigured: {
      telegramBotToken: Boolean(STORE.telegramBotToken),
      liqPayPublicKey: Boolean(STORE.liqPayPublicKey),
      liqPayPrivateKey: Boolean(STORE.liqPayPrivateKey),
      monoPayPublicKey: Boolean(STORE.monoPayPublicKey),
      monoPayPrivateKey: Boolean(STORE.monoPayPrivateKey),
    },
  };
}

export type PublicSettings = ReturnType<typeof getPublicSettings>;

export function patchSettings(patch: SettingsUpdate): PublicSettings {
  if (patch.restaurantName !== undefined) STORE.restaurantName = patch.restaurantName;
  if (patch.address !== undefined) STORE.address = patch.address;
  if (patch.phone !== undefined) STORE.phone = patch.phone;
  if (patch.email !== undefined) STORE.email = patch.email;
  if (patch.currency !== undefined) STORE.currency = patch.currency;
  if (patch.workingHours) {
    const next = { ...STORE.workingHours };
    for (const k of ["mon","tue","wed","thu","fri","sat","sun"] as const) {
      const dayPatch = patch.workingHours[k];
      if (dayPatch) next[k] = dayPatch;
    }
    STORE.workingHours = next;
  }

  const isUnchanged = (v: string | undefined) =>
    v === undefined || v === "" || v.startsWith("•••");

  if (!isUnchanged(patch.telegramBotToken)) STORE.telegramBotToken = patch.telegramBotToken;
  if (!isUnchanged(patch.liqPayPublicKey)) STORE.liqPayPublicKey = patch.liqPayPublicKey;
  if (!isUnchanged(patch.liqPayPrivateKey)) STORE.liqPayPrivateKey = patch.liqPayPrivateKey;
  if (!isUnchanged(patch.monoPayPublicKey)) STORE.monoPayPublicKey = patch.monoPayPublicKey;
  if (!isUnchanged(patch.monoPayPrivateKey)) STORE.monoPayPrivateKey = patch.monoPayPrivateKey;

  return getPublicSettings();
}

export const DAYS: ReadonlyArray<{ key: DayKey; label: string }> = [
  { key: "mon", label: "Понеділок" },
  { key: "tue", label: "Вівторок" },
  { key: "wed", label: "Середа" },
  { key: "thu", label: "Четвер" },
  { key: "fri", label: "П'ятниця" },
  { key: "sat", label: "Субота" },
  { key: "sun", label: "Неділя" },
];
