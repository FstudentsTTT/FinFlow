export const fmtUZS = (n: number) =>
  new Intl.NumberFormat("uz-UZ").format(Math.round(n)) + " so'm";

export const fmtDate = (s: string) =>
  new Date(s).toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const RATING_COLORS: Record<string, string> = {
  PREMIUM: "text-emerald-400",
  STRONG: "text-blue-400",
  EXCELLENT: "text-emerald-400",
  ACCEPTABLE: "text-blue-400",
  QUALIFIED: "text-sky-400",
  DEVELOPING: "text-amber-400",
  MARGINAL: "text-amber-400",
  INELIGIBLE: "text-red-400",
};

export const TAX_STATUS_COLORS: Record<string, string> = {
  VERIFIED: "bg-emerald-500/20 text-emerald-400",
  PENDING: "bg-amber-500/20 text-amber-400",
  UNVERIFIED: "bg-slate-500/20 text-slate-400",
  FLAGGED: "bg-red-500/20 text-red-400",
};

export const SECTOR_LABELS: Record<string, string> = {
  technology: "IT / Texnologiya",
  retail: "Savdo",
  manufacturing: "Ishlab chiqarish",
  agriculture: "Qishloq xo'jaligi",
  services: "Xizmat ko'rsatish",
  food_beverage: "Oziq-ovqat",
  construction: "Qurilish",
  education: "Ta'lim",
  healthcare: "Sog'liqni saqlash",
};

export const REGION_LABELS: Record<string, string> = {
  tashkent_city: "Toshkent shahri",
  tashkent_region: "Toshkent viloyati",
  samarkand: "Samarqand",
  bukhara: "Buxoro",
  fergana: "Farg'ona",
  namangan: "Namangan",
  andijan: "Andijon",
  sirdaryo: "Sirdaryo",
  navoi: "Navoiy",
  jizzakh: "Jizzax",
  kashkadarya: "Qashqadaryo",
  surkhandarya: "Surxondaryo",
  khorezm: "Xorazm",
  karakalpakstan: "Qoraqalpog'iston",
};
