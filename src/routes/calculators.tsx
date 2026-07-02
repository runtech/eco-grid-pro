import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Sun, Battery, TrendingUp, Timer, Plus, Trash2, Zap } from "lucide-react";
import { useI18n, formatPrice } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/calculators")({
  head: () => ({
    meta: [
      { title: "Engineering Calculators — SolarHub" },
      { name: "description", content: "Load, system design, ROI, and runtime calculators for solar systems." },
      { property: "og:title", content: "Solar Engineering Calculators — SolarHub" },
      { property: "og:description", content: "Precise tools to design your solar system." },
    ],
  }),
  component: CalculatorsPage,
});

function CalculatorsPage() {
  const { t, locale } = useI18n();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl gradient-primary shadow-glow">
          <Calculator className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t("calc.title")}</h1>
        <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">{t("calc.subtitle")}</p>
      </motion.div>

      <Tabs defaultValue="load" className="w-full">
        <TabsList className="mx-auto grid w-full max-w-2xl grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="load"><Zap className="me-1 h-4 w-4" />{t("calc.tab.load")}</TabsTrigger>
          <TabsTrigger value="system"><Sun className="me-1 h-4 w-4" />{t("calc.tab.system")}</TabsTrigger>
          <TabsTrigger value="roi"><TrendingUp className="me-1 h-4 w-4" />{t("calc.tab.roi")}</TabsTrigger>
          <TabsTrigger value="runtime"><Timer className="me-1 h-4 w-4" />{t("calc.tab.runtime")}</TabsTrigger>
        </TabsList>

        <TabsContent value="load" className="mt-6"><LoadCalculator /></TabsContent>
        <TabsContent value="system" className="mt-6"><SystemDesigner /></TabsContent>
        <TabsContent value="roi" className="mt-6"><RoiCalculator locale={locale} /></TabsContent>
        <TabsContent value="runtime" className="mt-6"><RuntimeSimulator /></TabsContent>
      </Tabs>
    </div>
  );
}

// ============ Load Calculator ============
interface Appliance {
  id: string;
  name: string;
  watts: number;
  qty: number;
  hours: number;
}

const defaultAppliances: Appliance[] = [
  { id: "1", name: "LED", watts: 15, qty: 8, hours: 6 },
  { id: "2", name: "TV", watts: 120, qty: 1, hours: 5 },
  { id: "3", name: "Fridge", watts: 200, qty: 1, hours: 10 },
];

function LoadCalculator() {
  const { t, locale } = useI18n();
  const [items, setItems] = useState<Appliance[]>(defaultAppliances);

  const { peakW, dailyWh } = useMemo(() => {
    const peak = items.reduce((s, i) => s + i.watts * i.qty, 0);
    const wh = items.reduce((s, i) => s + i.watts * i.qty * i.hours, 0);
    return { peakW: peak, dailyWh: wh };
  }, [items]);

  const update = (id: string, patch: Partial<Appliance>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const add = () =>
    setItems((prev) => [...prev, { id: Date.now().toString(), name: "", watts: 0, qty: 1, hours: 1 }]);

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{t("calc.tab.load")}</CardTitle>
          <CardDescription>{locale === "ar" ? "أضف أجهزتك وساعات تشغيلها اليومية." : "Add your appliances and daily hours."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="hidden gap-2 text-xs font-medium text-muted-foreground md:grid md:grid-cols-[1fr_100px_80px_100px_40px]">
            <span>{t("calc.load.appliance")}</span>
            <span>{t("calc.load.power")}</span>
            <span>{t("calc.load.qty")}</span>
            <span>{t("calc.load.hours")}</span>
            <span></span>
          </div>
          {items.map((it) => (
            <div key={it.id} className="grid gap-2 md:grid-cols-[1fr_100px_80px_100px_40px]">
              <Input value={it.name} onChange={(e) => update(it.id, { name: e.target.value })} placeholder={t("calc.load.appliance")} />
              <Input type="number" min={0} value={it.watts} onChange={(e) => update(it.id, { watts: +e.target.value || 0 })} />
              <Input type="number" min={0} value={it.qty} onChange={(e) => update(it.id, { qty: +e.target.value || 0 })} />
              <Input type="number" min={0} max={24} step={0.5} value={it.hours} onChange={(e) => update(it.id, { hours: +e.target.value || 0 })} />
              <Button variant="ghost" size="icon" onClick={() => remove(it.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={add} className="w-full">
            <Plus className="me-1 h-4 w-4" />{t("calc.load.add")}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <ResultCard icon={<Zap className="h-5 w-5" />} label={t("calc.load.totalW")} value={`${peakW.toLocaleString()} W`} />
        <ResultCard icon={<Battery className="h-5 w-5" />} label={t("calc.load.totalWh")} value={`${(dailyWh / 1000).toFixed(2)} kWh`} highlight />
        <ResultCard icon={<TrendingUp className="h-5 w-5" />} label={t("calc.load.monthlyKwh")} value={`${((dailyWh * 30) / 1000).toFixed(0)} kWh`} />
      </div>
    </div>
  );
}

// ============ System Designer ============
function SystemDesigner() {
  const { t, locale } = useI18n();
  const [dailyKwh, setDailyKwh] = useState(10);
  const [sunHours, setSunHours] = useState(5.5);
  const [autonomy, setAutonomy] = useState(1);
  const [batteryV, setBatteryV] = useState(48);
  const [panelW, setPanelW] = useState(550);
  const [dod, setDod] = useState(80);

  const results = useMemo(() => {
    // Panels: kWh_daily / (sun_hours * system_efficiency 0.75)
    const arrayW = (dailyKwh * 1000) / (sunHours * 0.75);
    const panels = Math.ceil(arrayW / panelW);
    const totalArrayW = panels * panelW;
    // Battery: Wh / V / (DoD/100) * autonomy
    const batteryAh = Math.ceil(((dailyKwh * 1000) / batteryV / (dod / 100)) * autonomy);
    // Inverter: peak load ~ daily kWh * 0.4 factor, min 3kW
    const inverterW = Math.max(3000, Math.ceil((dailyKwh * 400) / 100) * 100);
    // Controller: array W / battery V * 1.25 safety
    const controllerA = Math.ceil((totalArrayW / batteryV) * 1.25);
    return { panels, totalArrayW, batteryAh, inverterW, controllerA };
  }, [dailyKwh, sunHours, autonomy, batteryV, panelW, dod]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("calc.tab.system")}</CardTitle>
          <CardDescription>{locale === "ar" ? "أدخل احتياجاتك لحساب المكونات." : "Enter your needs to size components."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <NumberField label={t("calc.sys.dailyKwh")} value={dailyKwh} onChange={setDailyKwh} step={0.5} min={0.1} />
          <NumberField label={t("calc.sys.sunHours")} value={sunHours} onChange={setSunHours} step={0.1} min={1} max={12} />
          <SliderField label={t("calc.sys.autonomy")} value={autonomy} onChange={setAutonomy} min={1} max={5} step={1} suffix={locale === "ar" ? "يوم" : "d"} />
          <div className="grid grid-cols-2 gap-4">
            <NumberField label={t("calc.sys.batteryV")} value={batteryV} onChange={setBatteryV} step={12} min={12} max={96} />
            <NumberField label={t("calc.sys.panelW")} value={panelW} onChange={setPanelW} step={50} min={100} max={800} />
          </div>
          <SliderField label={t("calc.sys.dod")} value={dod} onChange={setDod} min={30} max={95} step={5} suffix="%" />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <ResultCard icon={<Sun className="h-5 w-5" />} label={t("calc.sys.result.panels")} value={`${results.panels} × ${panelW}W`} highlight />
        <ResultCard icon={<Zap className="h-5 w-5" />} label={t("calc.sys.result.arrayW")} value={`${(results.totalArrayW / 1000).toFixed(2)} kW`} />
        <ResultCard icon={<Battery className="h-5 w-5" />} label={t("calc.sys.result.batteryAh")} value={`${results.batteryAh} Ah @ ${batteryV}V`} highlight />
        <ResultCard icon={<Zap className="h-5 w-5" />} label={t("calc.sys.result.inverter")} value={`${(results.inverterW / 1000).toFixed(1)} kW`} />
        <ResultCard icon={<Calculator className="h-5 w-5" />} label={t("calc.sys.result.controller")} value={`${results.controllerA} A MPPT`} />
      </div>
    </div>
  );
}

// ============ ROI Calculator ============
function RoiCalculator({ locale }: { locale: "ar" | "en" }) {
  const { t } = useI18n();
  const [cost, setCost] = useState(500000);
  const [bill, setBill] = useState(15000);
  const [savingsPct, setSavingsPct] = useState(85);
  const [inflation, setInflation] = useState(8);

  const results = useMemo(() => {
    const monthlySavings = (bill * savingsPct) / 100;
    const yearlySavings = monthlySavings * 12;
    // Payback with inflation compounding
    let cumulative = 0;
    let years = 0;
    let annual = yearlySavings;
    while (cumulative < cost && years < 30) {
      cumulative += annual;
      annual *= 1 + inflation / 100;
      years++;
    }
    // 10 year net
    let tenYear = 0;
    let a = yearlySavings;
    for (let i = 0; i < 10; i++) {
      tenYear += a;
      a *= 1 + inflation / 100;
    }
    const netProfit = tenYear - cost;
    const fractionalYears = cumulative >= cost ? years - (cumulative - cost) / (annual / (1 + inflation / 100)) : years;
    return { monthlySavings, yearlySavings, payback: fractionalYears, netProfit };
  }, [cost, bill, savingsPct, inflation]);

  const cur = t("common.currency");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("calc.tab.roi")}</CardTitle>
          <CardDescription>{locale === "ar" ? "قدّر فترة استرداد التكلفة والأرباح." : "Estimate payback period and profits."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <NumberField label={`${t("calc.roi.systemCost")} (${cur})`} value={cost} onChange={setCost} step={10000} min={0} />
          <NumberField label={`${t("calc.roi.monthlyBill")} (${cur})`} value={bill} onChange={setBill} step={500} min={0} />
          <SliderField label={t("calc.roi.savingsPct")} value={savingsPct} onChange={setSavingsPct} min={30} max={100} step={5} suffix="%" />
          <SliderField label={t("calc.roi.inflation")} value={inflation} onChange={setInflation} min={0} max={25} step={1} suffix="%" />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <ResultCard icon={<TrendingUp className="h-5 w-5" />} label={t("calc.roi.result.monthly")} value={`${formatPrice(results.monthlySavings, locale)} ${cur}`} />
        <ResultCard icon={<TrendingUp className="h-5 w-5" />} label={t("calc.roi.result.yearly")} value={`${formatPrice(results.yearlySavings, locale)} ${cur}`} />
        <ResultCard icon={<Timer className="h-5 w-5" />} label={t("calc.roi.result.payback")} value={`${results.payback.toFixed(1)} ${t("calc.roi.result.years")}`} highlight />
        <ResultCard icon={<TrendingUp className="h-5 w-5" />} label={t("calc.roi.result.tenYear")} value={`${formatPrice(results.netProfit, locale)} ${cur}`} highlight />
      </div>
    </div>
  );
}

// ============ Runtime Simulator ============
function RuntimeSimulator() {
  const { t, locale } = useI18n();
  const [ah, setAh] = useState(200);
  const [v, setV] = useState(24);
  const [loadW, setLoadW] = useState(500);
  const [eff, setEff] = useState(90);

  const hours = useMemo(() => {
    if (loadW <= 0) return 0;
    const usableWh = ah * v * 0.8 * (eff / 100); // 80% DoD default
    return usableWh / loadW;
  }, [ah, v, loadW, eff]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("calc.tab.runtime")}</CardTitle>
          <CardDescription>{locale === "ar" ? "احسب مدة تشغيل الأجهزة على البطارية." : "Estimate how long the battery runs your loads."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <NumberField label={t("calc.rt.batteryAh")} value={ah} onChange={setAh} step={10} min={1} />
            <NumberField label={t("calc.rt.batteryV")} value={v} onChange={setV} step={12} min={12} max={96} />
          </div>
          <NumberField label={t("calc.rt.loadW")} value={loadW} onChange={setLoadW} step={50} min={1} />
          <SliderField label={t("calc.rt.efficiency")} value={eff} onChange={setEff} min={70} max={98} step={1} suffix="%" />
        </CardContent>
      </Card>

      <div className="flex items-center">
        <ResultCard
          icon={<Timer className="h-5 w-5" />}
          label={t("calc.rt.result.hours")}
          value={`${hours.toFixed(1)} ${t("calc.rt.result.h")}`}
          highlight
          className="w-full"
        />
      </div>
    </div>
  );
}

// ============ Shared UI ============
function NumberField({
  label, value, onChange, step = 1, min, max,
}: { label: string; value: number; onChange: (n: number) => void; step?: number; min?: number; max?: number }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(+e.target.value || 0)}
      />
    </div>
  );
}

function SliderField({
  label, value, onChange, min, max, step, suffix,
}: { label: string; value: number; onChange: (n: number) => void; min: number; max: number; step: number; suffix?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-sm font-semibold text-primary">{value}{suffix}</span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} />
    </div>
  );
}

function ResultCard({
  icon, label, value, highlight = false, className = "",
}: { icon: React.ReactNode; label: string; value: string; highlight?: boolean; className?: string }) {
  return (
    <Card className={`${highlight ? "border-primary/40 bg-primary/5" : ""} ${className}`}>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`grid h-10 w-10 place-items-center rounded-lg ${highlight ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
