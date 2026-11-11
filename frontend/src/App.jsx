import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { TrendingUp, Activity, DollarSign, Layers, Calendar, ArrowUpRight, ArrowDownRight, RefreshCw, Coins, ShieldCheck } from 'lucide-react';

export default function App() {
  const [selectedMetric, setSelectedMetric] = useState('usd_syp');
  const [targetYear, setTargetYear] = useState(2030);
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("https://onrender.com" + selectedMetric + "&target_year=" + targetYear)
      .then(res => {
        if (!res.ok) throw new Error("تعذر الاتصال بسيرفر البيانات");
        return res.json();
      })
      .then(data => {
        setApiData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [selectedMetric, targetYear]);

 const actualYears = apiData ? apiData.actual.map(item => String(item.year)) : new Array();
  const forecastYears = apiData ? apiData.forecast.map(item => String(item.year)) : new Array();
  const allCategories = actualYears.concat(forecastYears);

  const actualSeriesData = apiData 
    ? apiData.actual.map(item => Math.round(item.value)).concat(new Array(forecastYears.length).fill(null)) 
    : new Array();

  const forecastSeriesData = apiData && apiData.actual.length > 0
    ? new Array(actualYears.length - 1).fill(null)
        .concat(Math.round(apiData.actual[apiData.actual.length - 1].value))
        .concat(apiData.forecast.map(item => Math.round(item.value)))
    : new Array();

  const latestVal = apiData ? apiData.latest_value : 0;
  const predictedVal = apiData && apiData.forecast.length > 0 ? apiData.forecast[apiData.forecast.length - 1].value : latestVal;
  const changePercent = latestVal !== 0 ? (((predictedVal - latestVal) / latestVal) * 100).toFixed(1) : "0.0";
  const isUp = parseFloat(changePercent) >= 0;

  const chartOptions = {
    chart: { id: 'real-neon-chart', toolbar: { show: false }, background: 'transparent' },
    colors: ['#a855f7', '#00f2fe'],
    stroke: { curve: 'smooth', width: 4, lineCap: 'round' },
    grid: { borderColor: 'rgba(255, 255, 255, 0.04)', strokeDashArray: 5 },
    xaxis: {
      categories: allCategories,
      labels: { style: { colors: '#94a3b8', fontSize: '12px' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: { opposite: true, labels: { style: { colors: '#94a3b8', fontSize: '12px' } } },
    markers: { size: 5, strokeColors: '#060913', strokeWidth: 2 },
    legend: { labels: { colors: '#cbd5e1' }, position: 'top', horizontalAlign: 'right' },
    tooltip: { theme: 'dark' }
  };

  const donutOptions = {
    chart: { id: 'model-accuracy-donut', background: 'transparent' },
    colors: ['#00f2fe', '#a855f7'],
    labels: ['بيانات التدريب (Train)', 'بيانات الاختبار (Test)'],
    stroke: { colors: ['#040712'], width: 2 },
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            name: { show: true, fontSize: '10px', color: '#94a3b8', offsetY: -4 },
            value: { show: true, fontSize: '15px', fontWeight: '800', color: '#00f2fe', offsetY: 4 },
            total: {
              show: true,
              label: 'سنوات الرصد',
              color: '#94a3b8',
              formatter: () => (apiData ? apiData.count + " سنة" : "24 سنة")
            }
          }
        }
      }
    },
    tooltip: { theme: 'dark', y: { formatter: (val) => val + "%" } }
  };

const forecastYearOptions = Array.from({ length: 9 }, (_, i) => 2027 + i);  return (
    <div className="min-h-screen bg-bgMain text-slate-100 flex font-sans overflow-x-hidden">
      
      {/* القائمة الجانبية الفاخرة */}
      <div className="w-80 bg-[#040712]/90 backdrop-blur-2xl border-l border-panelBorder p-6 flex flex-col gap-5 z-10 shadow-[5px_0_30px_rgba(0,0,0,0.5)]">
        
        <div className="flex items-center gap-3.5 pb-4 border-b border-panelBorder/60">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-neonCyan text-neonCyan font-bold text-2xl shadow-[0_0_20px_rgba(0,242,254,0.25)]">
            ◈
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide text-white">مِرصَد</h1>
            <p className="text-[11px] font-medium text-slate-400">غرفة الاستشراف الاقتصادي السوري</p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1">
            <Layers size={14} className="text-neonCyan" /> المؤشرات الحقيقية (CSV)
          </h3>
          
          <button 
            onClick={() => setSelectedMetric('usd_syp')}
            className={selectedMetric === 'usd_syp' ? "w-full text-right p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-between bg-cyan-500/10 border-neonCyan text-neonCyan shadow-[0_0_15px_rgba(0,242,254,0.15)]" : "w-full text-right p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-between bg-transparent border-panelBorder/40 hover:border-slate-500 text-slate-300"}
          >
            <div className="flex items-center gap-2"><DollarSign size={16} /><span>سعر الصرف الرسمي</span></div>
            <div className={selectedMetric === 'usd_syp' ? "w-2 h-2 rounded-full bg-neonCyan" : "w-2 h-2 rounded-full bg-transparent"}></div>
          </button>

          <button 
            onClick={() => setSelectedMetric('gold_price')}
            className={selectedMetric === 'gold_price' ? "w-full text-right p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-between bg-amber-500/10 border-neonGold text-neonGold shadow-[0_0_15px_rgba(255,183,3,0.15)]" : "w-full text-right p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-between bg-transparent border-panelBorder/40 hover:border-slate-500 text-slate-300"}
          >
            <div className="flex items-center gap-2"><Coins size={16} /><span>سعر الذهب (غرام)</span></div>
            <div className={selectedMetric === 'gold_price' ? "w-2 h-2 rounded-full bg-neonGold" : "w-2 h-2 rounded-full bg-transparent"}></div>
          </button>

          <button 
            onClick={() => setSelectedMetric('purchasing_power')}
            className={selectedMetric === 'purchasing_power' ? "w-full text-right p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-between bg-purple-500/10 border-neonPurple text-neonPurple shadow-[0_0_15px_rgba(168,85,247,0.15)]" : "w-full text-right p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-between bg-transparent border-panelBorder/40 hover:border-slate-500 text-slate-300"}
          >
            <div className="flex items-center gap-2"><Activity size={16} /><span>القدرة الشرائية</span></div>
            <div className={selectedMetric === 'purchasing_power' ? "w-2 h-2 rounded-full bg-neonPurple" : "w-2 h-2 rounded-full bg-transparent"}></div>
          </button>

          <button 
            onClick={() => setSelectedMetric('economic_confidence')}
            className={selectedMetric === 'economic_confidence' ? "w-full text-right p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-between bg-emerald-500/10 border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.15)]" : "w-full text-right p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-between bg-transparent border-panelBorder/40 hover:border-slate-500 text-slate-300"}
          >
            <div className="flex items-center gap-2"><ShieldCheck size={16} /><span>الثقة الاقتصادية</span></div>
            <div className={selectedMetric === 'economic_confidence' ? "w-2 h-2 rounded-full bg-emerald-400" : "w-2 h-2 rounded-full bg-transparent"}></div>
          </button>
        </div>

        <div className="p-3.5 bg-slate-900/50 border border-panelBorder/40 rounded-xl flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">سنة الاستشراف:</span>
          <select 
            value={targetYear} 
            onChange={(e) => setTargetYear(Number(e.target.value))}
            className="bg-[#040712] border border-neonCyan/40 text-neonCyan text-xs font-bold rounded-lg px-2.5 py-1.5 outline-none"
          >
            {forecastYearOptions.map(yr => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        </div>

        <div className="p-3.5 bg-slate-900/40 border border-panelBorder/40 rounded-2xl shadow-inner">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neonCyan shadow-[0_0_6px_#00f2fe]"></span>
              هيكلة تدريب النموذج (AI)
            </h4>
            <span className="text-[10px] font-mono text-neonCyan bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
              80% / 20%
            </span>
          </div>
          <div className="flex justify-center items-center">
            <Chart options={donutOptions} series={[80, 20]} type="donut" width="100%" height="145" />
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-1">
            {"سلسلة زمنية متصلة (" + (apiData ? apiData.first_year + " - " + apiData.last_year : "2003 - 2026") + ")"}
          </p>
        </div>
      </div>
{/* منطقة المحتوى ولوحة المؤشرات */}
      <div className="flex-1 p-8 max-w-[1450px] mx-auto w-full flex flex-col gap-6 z-10">
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-neonCyan tracking-widest uppercase mb-1">غرفة التحليل المتقدم المباشر</h2>
            <h1 className="text-2xl font-bold text-white">المؤشرات الحيوية والتوقعات المستقبلية</h1>
          </div>
          <div className={error ? "flex items-center gap-2 text-xs px-4 py-2 rounded-xl border text-rose-400 bg-rose-500/10 border-rose-500/20" : "flex items-center gap-2 text-xs px-4 py-2 rounded-xl border text-emerald-400 bg-emerald-500/5 border-emerald-500/10"}>
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> 
            {error ? "سيرفر الباك إند متوقف" : loading ? "جاري جلب البيانات..." : "متصل بملف exchange_rate.csv"}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-panelBg backdrop-blur-3xl border border-panelBorder rounded-2xl p-6 shadow-xl border-l-4 border-l-purple-500">
            <p className="text-xs font-bold text-slate-400 mb-2">{"آخر قراءة فعلية (" + (apiData ? apiData.last_year : "...") + ")"}</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-extrabold text-white font-mono">
                {apiData ? Math.round(latestVal).toLocaleString() + " " + apiData.unit : "..."}
              </h3>
              <span className="text-lg">📊</span>
            </div>
            <p className="mt-3 pt-3 border-t border-white/5 text-[11px] text-purple-300">من البيانات التاريخية المرصودة</p>
          </div>

          <div className="bg-panelBg backdrop-blur-3xl border border-panelBorder rounded-2xl p-6 shadow-xl border-l-4 border-l-cyan-400">
            <p className="text-xs font-bold text-slate-400 mb-2">{"التوقع المستقبلي لعام (" + targetYear + ")"}</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-extrabold text-neonCyan font-mono">
                {apiData ? Math.round(predictedVal).toLocaleString() + " " + apiData.unit : "..."}
              </h3>
              <span className="text-lg">🔮</span>
            </div>
            <p className="mt-3 pt-3 border-t border-white/5 text-[11px] text-cyan-300">نموذج Linear Regression</p>
          </div>

          <div className="bg-panelBg backdrop-blur-3xl border border-panelBorder rounded-2xl p-6 shadow-xl border-l-4 border-l-rose-500">
            <p className="text-xs font-bold text-slate-400 mb-2">معدل التغير المتوقع</p>
            <div className="flex items-baseline justify-between">
              <h3 className={isUp ? "text-3xl font-extrabold font-mono text-emerald-400" : "text-3xl font-extrabold font-mono text-rose-400"}>
                {apiData ? (isUp ? "+" : "") + changePercent + "%" : "..."}
              </h3>
              <div className={isUp ? "p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400" : "p-1.5 rounded-lg bg-rose-500/10 text-rose-400"}>
                {isUp ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
              </div>
            </div>
            <p className="mt-3 pt-3 border-t border-white/5 text-[11px] text-slate-300">
              {apiData && apiData.rmse ? "مؤشر دقة النموذج (RMSE): " + Math.round(apiData.rmse) : "تحليل السلسلة الزمنية"}
            </p>
          </div>
        </div>

        <div className="bg-panelBg backdrop-blur-3xl border border-panelBorder rounded-2xl p-7 shadow-2xl flex-1 flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-panelBorder/30">
            <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-5 bg-neonCyan rounded-full shadow-[0_0_12px_#00f2fe]"></span>
              <h2 className="text-md font-bold text-slate-100">
                {apiData ? "استشراف " + apiData.label + " (" + apiData.unit + ")" : "جاري تحميل المخطط..."}
              </h2>
            </div>
            <div className="text-xs text-slate-300 flex items-center gap-1.5 bg-[#040712]/60 px-3 py-1.5 rounded-xl border border-panelBorder/40">
              <Calendar size={13} className="text-neonCyan" /> {"النطاق: " + (apiData ? apiData.first_year + " - " + targetYear : "...")}
            </div>
          </div>
          
          <div className="flex-1 w-full relative min-h-[320px]">
            {apiData && (
              <Chart 
                options={chartOptions} 
                series={[
                  { name: 'بيانات فعلية مرصودة', data: actualSeriesData },
                  { name: 'المسار التنبئي (AI)', data: forecastSeriesData }
                ]} 
                type="line" 
                height="100%" 
                width="100%" 
              />
            )}
          </div>
        </div>

        {/* قسم المصادر والمنهجية العلمية لتوثيق المشروع أكاديمياً */}
        <div className="bg-panelBg backdrop-blur-3xl border border-panelBorder/60 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
            <span className="w-1.5 h-4 bg-neonPurple rounded-full shadow-[0_0_8px_#a855f7]"></span>
            <h3 className="text-sm font-bold text-slate-200 tracking-wide">المصادر المعتمدة والمنهجية العلمية للبيانات (2003 - 2026)</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-400 leading-relaxed">
            <div className="bg-[#040712]/50 p-4 rounded-xl border border-white/5">
              <h4 className="font-bold text-neonCyan mb-2">📚 أولاً: مصادر السلاسل الزمنية الخام</h4>
              <ul className="space-y-1.5 list-disc list-inside">
                <li><strong className="text-slate-300">مصرف سوريا المركزي (CBS) والبنك الدولي:</strong> لبيانات أسعار الصرف الرسمية ومؤشرات الاستقرار للفترة (2003 - 2010).</li>
                <li><strong className="text-slate-300">تقارير الإسكوا (ESCWA) وجمعية الصاغة:</strong> لمتوسطات أسعار الصرف الموازية وأسعار الذهب عيار 21 (2011 - 2024).</li>
                <li><strong className="text-slate-300">نشرات إعادة التقييم (2025 - 2026):</strong> بيانات موحدة المقياس الحسابي لضمان استمرارية السلسلة الزمنية بعد حذف صفرين من العملة.</li>
              </ul>
            </div>

            <div className="bg-[#040712]/50 p-4 rounded-xl border border-white/5">
              <h4 className="font-bold text-neonPurple mb-2">🧮 ثانياً: بناء المؤشرات المركبة ونموذج التنبؤ</h4>
              <ul className="space-y-1.5 list-disc list-inside">
                <li><strong className="text-slate-300">مؤشر القدرة الشرائية:</strong> رقم قياسي مركب (سنة الأساس 2003 = 100) محسوب عكسياً من الرقم القياسي لأسعار المستهلك (CPI).</li>
                <li><strong className="text-slate-300">مؤشر الثقة الاقتصادية:</strong> مؤشر استدلالي (من 100) يدمج استقرار الصرف ومعدلات نمو الناتج المحلي الحقيقي (IMF).</li>
                <li><strong className="text-slate-300">خوارزمية الاستشراف:</strong> تدريب آلي مستمر باستخدام الانحدار الخطي (Linear Regression) مع حساب معامل الخطأ التربيعي (RMSE).</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}