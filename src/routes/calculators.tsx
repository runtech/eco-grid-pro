import { createFileRoute } from "@tanstack/react-router";
import { Calculator, Zap, Sun, TrendingUp, Timer, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n, formatPrice } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/ProductCard";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/calculators")({
  component: CalculatorsPage,
  head: () => ({
    meta: [
      { title: "الحاسبات الهندسية — SolarHub" },
      { name: "description", content: "حاسبة الأحمال، تصميم المنظومة الشمسية، حاسبة ROI ومحاكي التشغيل." },
      { property: "og:title", content: "Solar Engineering Calculators — SolarHub" },
      { property: "og:description", content: "Load calc, system sizing, ROI and runtime simulator." },
      { property: "og:url", content: "/calculators" },
    ],
    links: [{ rel: "canonical", href: "/calculators" }],
  }),
});

type L = "ar" | "en";
const tr = (locale: L, ar: string, en: string) => (locale === "ar" ? ar : en);

function CalculatorsPage() {
  const { locale } = useI18n();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl gradient-primary shadow-glow">
          <Calculator className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold">{tr(locale, "الحاسبات الهندسية", "Engineering Calculators")}</h1>
        <p className="mt-2 text-muted-foreground">
          {tr(locale, "أدوات دقيقة لتصميم منظومتك الشمسية وتقدير التكلفة والاسترداد.", "Precise tools to size your solar system and estimate cost & payback.")}
        </p>
      </div>

      <Tabs defaultValue="load" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="load"><Zap className="me-1 h-4 w-4" />{tr(locale, "الأحمال", "Loads")}</TabsTrigger>
          <TabsTrigger value="system"><Sun className="me-1 h-4 w-4" />{tr(locale, "تصميم المنظومة", "System")}</TabsTrigger>
          <TabsTrigger value="roi"><TrendingUp className="me-1 h-4 w-4" />ROI</TabsTrigger>
          <TabsTrigger value="runtime"><Timer className="me-1 h-4 w-4" />{tr(locale, "زمن التشغيل", "Runtime")}</TabsTrigger>
        </TabsList>

        <TabsContent value="load" className="mt-6"><LoadCalc locale={locale} /></TabsContent>
        <TabsContent value="system" className="mt-6"><SystemDesigner locale={locale} /></TabsContent>
        <TabsContent value="roi" className="mt-6"><RoiCalc locale={locale} /></TabsContent>
        <TabsContent value="runtime" className="mt-6"><RuntimeSim locale={locale} /></TabsContent>
      </Tabs>
    </div>
  );
}

// ============ Load Calculator ============
type LoadItem = { id: string; name: string; watts: number; qty: number; hours: number };

function LoadCalc({ locale }: { locale: L }) {
  const [items, setItems] = useState<LoadItem[]>([
    { id: "1", name: tr(locale, "إضاءة LED", "LED lighting"), watts: 10, qty: 8, hours: 6 },
    { id: "2", name: tr(locale, "ثلاجة", "Refrigerator"), watts: 150, qty: 1, hours: 8 },
    { id: "3", name: tr(locale, "تلفزيون", "TV"), watts: 100, qty: 1, hours: 5 },
  ]);

  const totalW = items.reduce((s, i) => s + i.watts * i.qty, 0);
  const totalWh = items.reduce((s, i) => s + i.watts * i.qty * i.hours, 0);

  const update = (id: string, patch: Partial<LoadItem>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const add = () =>
    setItems((prev) => [...prev, { id: Math.random().toString(36).slice(2), name: "", watts: 0, qty: 1, hours: 1 }]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tr(locale, "حاسبة الأحمال الكهربائية", "Electrical Load Calculator")}</CardTitle>
        <CardDescription>
          {tr(locale, "أدخل أجهزتك لحساب إجمالي القدرة (واط) والاستهلاك اليومي (واط·ساعة).", "Enter your appliances to compute total power (W) and daily energy (Wh).")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="hidden grid-cols-12 gap-2 text-xs font-medium text-muted-foreground md:grid">
          <div className="col-span-4">{tr(locale, "الجهاز", "Device")}</div>
          <div className="col-span-2">{tr(locale, "القدرة (واط)", "Watts")}</div>
          <div className="col-span-2">{tr(locale, "العدد", "Qty")}</div>
          <div className="col-span-3">{tr(locale, "ساعات/يوم", "Hours/day")}</div>
          <div className="col-span-1" />
        </div>
        {items.map((i) => (
          <div key={i.id} className="grid grid-cols-12 gap-2">
            <Input className="col-span-12 md:col-span-4" value={i.name} placeholder={tr(locale, "اسم الجهاز", "Device name")}
              onChange={(e) => update(i.id, { name: e.target.value })} />
            <Input className="col-span-4 md:col-span-2" type="number" min={0} value={i.watts}
              onChange={(e) => update(i.id, { watts: +e.target.value || 0 })} />
            <Input className="col-span-3 md:col-span-2" type="number" min={0} value={i.qty}
              onChange={(e) => update(i.id, { qty: +e.target.value || 0 })} />
            <Input className="col-span-4 md:col-span-3" type="number" min={0} max={24} step={0.5} value={i.hours}
              onChange={(e) => update(i.id, { hours: +e.target.value || 0 })} />
            <Button variant="ghost" size="icon" className="col-span-1" onClick={() => remove(i.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={add}>
          <Plus className="h-4 w-4" />{tr(locale, "إضافة جهاز", "Add device")}
        </Button>

        <div className="mt-4 grid gap-3 rounded-lg border bg-muted/40 p-4 md:grid-cols-2">
          <Stat label={tr(locale, "إجمالي القدرة اللحظية", "Peak power")} value={`${totalW.toLocaleString()} W`} />
          <Stat label={tr(locale, "الاستهلاك اليومي", "Daily energy")} value={`${(totalWh / 1000).toFixed(2)} kWh`} />
        </div>
      </CardContent>
    </Card>
  );
}

// ============ System Designer ============
function SystemDesigner({ locale }: { locale: L }) {
  const [dailyKwh, setDailyKwh] = useState(5);
  const [sunHours, setSunHours] = useState(5.5);
  const [panelW, setPanelW] = useState(550);
  const [batteryV, setBatteryV] = useState(48);
  const [batteryAh, setBatteryAh] = useState(100);
  const [autonomy, setAutonomy] = useState(1);
  const [dod, setDod] = useState(80);
  const [systemLoss, setSystemLoss] = useState(25);

  const r = useMemo(() => {
    const requiredKwh = dailyKwh / (1 - systemLoss / 100);
    const arrayKw = requiredKwh / Math.max(sunHours, 0.1);
    const panels = Math.ceil((arrayKw * 1000) / Math.max(panelW, 1));
    const battWh = (dailyKwh * 1000 * autonomy) / (dod / 100);
    const battKwh = battWh / 1000;
    const batteries = Math.ceil(battWh / Math.max(batteryV * batteryAh, 1));
    const inverterKw = Math.ceil(arrayKw * 1.2 * 10) / 10;
    const controllerA = Math.ceil((panels * panelW) / Math.max(batteryV, 1) * 1.25);
    return { arrayKw, panels, battKwh, batteries, inverterKw, controllerA };
  }, [dailyKwh, sunHours, panelW, batteryV, batteryAh, autonomy, dod, systemLoss]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tr(locale, "تصميم المنظومة الشمسية", "Solar System Designer")}</CardTitle>
        <CardDescription>
          {tr(locale, "احسب عدد الألواح، سعة البطاريات، الإنفرتر، ومنظم الشحن بناءً على استهلاكك.", "Compute panels, batteries, inverter, and charge controller sizing.")}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <Field label={tr(locale, "الاستهلاك اليومي (kWh)", "Daily consumption (kWh)")} value={dailyKwh} onChange={setDailyKwh} step={0.1} />
          <Field label={tr(locale, "ساعات الذروة الشمسية", "Peak sun hours")} value={sunHours} onChange={setSunHours} step={0.1} />
          <Field label={tr(locale, "قدرة اللوح (واط)", "Panel wattage (W)")} value={panelW} onChange={setPanelW} />
          <Field label={tr(locale, "فولت البطارية (V)", "Battery voltage (V)")} value={batteryV} onChange={setBatteryV} />
          <Field label={tr(locale, "سعة البطارية (Ah)", "Battery capacity (Ah)")} value={batteryAh} onChange={setBatteryAh} />
          <Field label={tr(locale, "أيام الاستقلالية", "Days of autonomy")} value={autonomy} onChange={setAutonomy} step={0.5} />
          <Field label={tr(locale, "عمق التفريغ %", "Depth of discharge %")} value={dod} onChange={setDod} />
          <Field label={tr(locale, "فقد النظام %", "System losses %")} value={systemLoss} onChange={setSystemLoss} />
        </div>
        <div className="space-y-3">
          <Result label={tr(locale, "قدرة المصفوفة المطلوبة", "Required array size")} value={`${r.arrayKw.toFixed(2)} kW`} />
          <Result label={tr(locale, "عدد الألواح", "Panels count")} value={`${r.panels}`} highlight />
          <Result label={tr(locale, "سعة البنك التخزينية", "Battery bank capacity")} value={`${r.battKwh.toFixed(2)} kWh`} />
          <Result label={tr(locale, "عدد البطاريات", "Batteries count")} value={`${r.batteries}`} highlight />
          <Result label={tr(locale, "الإنفرتر المقترح", "Suggested inverter")} value={`${r.inverterKw} kW`} />
          <Result label={tr(locale, "منظم الشحن", "Charge controller")} value={`${r.controllerA} A`} />
        </div>
      </CardContent>
      <CardContent className="border-t pt-6">
        <Recommendations
          locale={locale}
          targetPanelW={panelW}
          panelsCount={r.panels}
          inverterKw={r.inverterKw}
          batteryV={batteryV}
          batteryAh={batteryAh}
          batteriesCount={r.batteries}
        />
      </CardContent>
    </Card>
  );
}

// ============ ROI Calculator ============
function RoiCalc({ locale }: { locale: L }) {
  const [systemCost, setSystemCost] = useState(2000000);
  const [monthlyBill, setMonthlyBill] = useState(50000);
  const [offsetPct, setOffsetPct] = useState(90);
  const [inflation, setInflation] = useState(5);
  const [years, setYears] = useState(20);

  const r = useMemo(() => {
    const monthlySavings = monthlyBill * (offsetPct / 100);
    let cumulative = 0;
    let paybackYear = 0;
    let yearlyBill = monthlyBill * 12 * (offsetPct / 100);
    for (let y = 1; y <= years; y++) {
      cumulative += yearlyBill;
      if (!paybackYear && cumulative >= systemCost) paybackYear = y;
      yearlyBill *= 1 + inflation / 100;
    }
    const netSavings = cumulative - systemCost;
    return { monthlySavings, paybackYear, cumulative, netSavings };
  }, [systemCost, monthlyBill, offsetPct, inflation, years]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tr(locale, "حاسبة العائد على الاستثمار (ROI)", "Return on Investment (ROI)")}</CardTitle>
        <CardDescription>
          {tr(locale, "قدّر مدة استرداد تكلفة منظومتك وصافي التوفير.", "Estimate payback period and net savings.")}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <Field label={tr(locale, "تكلفة المنظومة", "System cost")} value={systemCost} onChange={setSystemCost} />
          <Field label={tr(locale, "فاتورة الكهرباء الشهرية", "Monthly electric bill")} value={monthlyBill} onChange={setMonthlyBill} />
          <Field label={tr(locale, "نسبة التغطية %", "Offset %")} value={offsetPct} onChange={setOffsetPct} />
          <Field label={tr(locale, "تضخم أسعار الكهرباء % سنوياً", "Electricity inflation %/yr")} value={inflation} onChange={setInflation} step={0.5} />
          <Field label={tr(locale, "عدد السنوات", "Years")} value={years} onChange={setYears} />
        </div>
        <div className="space-y-3">
          <Result label={tr(locale, "توفير شهري", "Monthly savings")} value={`${formatPrice(r.monthlySavings, locale)} ${tr(locale, "ريال", "YER")}`} />
          <Result label={tr(locale, "مدة الاسترداد", "Payback period")} value={r.paybackYear ? `${r.paybackYear} ${tr(locale, "سنة", "years")}` : tr(locale, "أكثر من المدة", "> period")} highlight />
          <Result label={tr(locale, `إجمالي التوفير خلال ${years} سنة`, `Total savings in ${years} years`)} value={`${formatPrice(r.cumulative, locale)} ${tr(locale, "ريال", "YER")}`} />
          <Result label={tr(locale, "صافي الربح", "Net profit")} value={`${formatPrice(r.netSavings, locale)} ${tr(locale, "ريال", "YER")}`} highlight />
        </div>
      </CardContent>
    </Card>
  );
}

// ============ Runtime Simulator ============
function RuntimeSim({ locale }: { locale: L }) {
  const [battV, setBattV] = useState(48);
  const [battAh, setBattAh] = useState(200);
  const [dod, setDod] = useState(80);
  const [loadW, setLoadW] = useState(500);
  const [invEff, setInvEff] = useState(90);

  const usableWh = (battV * battAh * (dod / 100)) * (invEff / 100);
  const hours = loadW > 0 ? usableWh / loadW : 0;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tr(locale, "محاكي زمن التشغيل", "Runtime Simulator")}</CardTitle>
        <CardDescription>
          {tr(locale, "احسب كم ساعة ستشغل بنك البطاريات حمل معين.", "How long your battery bank can run a given load.")}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <Field label={tr(locale, "فولت البطارية (V)", "Battery voltage (V)")} value={battV} onChange={setBattV} />
          <Field label={tr(locale, "سعة البطارية (Ah)", "Battery capacity (Ah)")} value={battAh} onChange={setBattAh} />
          <Field label={tr(locale, "عمق التفريغ %", "Depth of discharge %")} value={dod} onChange={setDod} />
          <Field label={tr(locale, "الحمل (واط)", "Load (W)")} value={loadW} onChange={setLoadW} />
          <Field label={tr(locale, "كفاءة الإنفرتر %", "Inverter efficiency %")} value={invEff} onChange={setInvEff} />
        </div>
        <div className="space-y-3">
          <Result label={tr(locale, "الطاقة المتاحة", "Usable energy")} value={`${(usableWh / 1000).toFixed(2)} kWh`} />
          <Result label={tr(locale, "زمن التشغيل", "Runtime")} value={`${h}h ${m}m`} highlight />
        </div>
      </CardContent>
    </Card>
  );
}

// ============ helpers ============
function Field({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (n: number) => void; step?: number }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type="number" min={0} step={step} value={value} onChange={(e) => onChange(+e.target.value || 0)} />
    </div>
  );
}

function Result({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-lg border p-3 ${highlight ? "border-primary/40 bg-primary/5" : "bg-muted/40"}`}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-lg font-bold ${highlight ? "text-primary" : ""}`}>{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-background p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}

// ============ Store recommendations ============
type Product = Tables<"products">;

function parseVolts(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v.replace(/[^\d.]/g, "")) || 0;
  return 0;
}

function Recommendations({
  locale, targetPanelW, panelsCount, inverterKw, batteryV, batteryAh, batteriesCount,
}: {
  locale: L; targetPanelW: number; panelsCount: number; inverterKw: number;
  batteryV: number; batteryAh: number; batteriesCount: number;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["calc-recommendations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("category", ["solar_panels", "inverters", "batteries"])
        .eq("is_active", true);
      if (error) throw error;
      return data as Product[];
    },
    staleTime: 60_000,
  });

  const picks = useMemo(() => {
    const all = data ?? [];
    const rank = <T,>(items: T[], score: (x: T) => number, n = 3) =>
      [...items].sort((a, b) => score(a) - score(b)).slice(0, n);

    const panels = rank(
      all.filter((p) => p.category === "solar_panels"),
      (p) => Math.abs(((p.specs as any)?.power_w ?? 0) - targetPanelW),
    );
    const inverters = rank(
      all.filter((p) => p.category === "inverters"),
      (p) => {
        const kw = (p.specs as any)?.power_kw ?? 0;
        return kw < inverterKw ? 1000 + (inverterKw - kw) : kw - inverterKw;
      },
    );
    const batteries = rank(
      all.filter((p) => p.category === "batteries"),
      (p) => {
        const s: any = p.specs ?? {};
        const v = parseVolts(s.voltage);
        const ah = s.capacity_ah ?? 0;
        return Math.abs(v - batteryV) * 10 + Math.abs(ah - batteryAh) * 0.1;
      },
    );
    return { panels, inverters, batteries };
  }, [data, targetPanelW, inverterKw, batteryV, batteryAh]);

  if (isLoading) {
    return <p className="text-center text-sm text-muted-foreground">{tr(locale, "جاري تحميل المنتجات المقترحة…", "Loading suggestions…")}</p>;
  }
  if (!data || data.length === 0) return null;

  const sections: Array<{ key: keyof typeof picks; title: string; hint: string }> = [
    { key: "panels", title: tr(locale, "الألواح الشمسية المقترحة", "Suggested solar panels"), hint: `${panelsCount} × ~${targetPanelW}W` },
    { key: "inverters", title: tr(locale, "الإنفرترات المقترحة", "Suggested inverters"), hint: `≥ ${inverterKw} kW` },
    { key: "batteries", title: tr(locale, "البطاريات المقترحة", "Suggested batteries"), hint: `${batteriesCount} × ${batteryV}V ${batteryAh}Ah` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShoppingBag className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">{tr(locale, "منتجات من المتجر تناسب تصميمك", "Store products matching your design")}</h3>
      </div>
      {sections.map((sec) => (
        <div key={sec.key}>
          <div className="mb-3 flex items-baseline justify-between">
            <h4 className="font-medium">{sec.title}</h4>
            <span className="text-xs text-muted-foreground">{tr(locale, "الاحتياج:", "Target:")} {sec.hint}</span>
          </div>
          {picks[sec.key].length === 0 ? (
            <p className="text-sm text-muted-foreground">{tr(locale, "لا توجد منتجات متاحة حالياً.", "No products available yet.")}</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {picks[sec.key].map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
