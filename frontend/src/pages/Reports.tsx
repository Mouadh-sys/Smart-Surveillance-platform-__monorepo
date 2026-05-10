import React, { useEffect, useState } from 'react';
import { BarChart as BarChartIcon, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { reportsApi } from '../api/reportsApi';
import { LoadingSpinner } from '../components/LoadingSpinner';

const COLORS = {
  AUTHORIZED: '#22c55e',
  UNKNOWN: '#ef4444',
  NON_AUTHORIZED: '#f97316',
};

export default function Reports() {
  const [summary, setSummary] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [sumData, dData] = await Promise.all([
        reportsApi.getSummary().catch(() => null),
        reportsApi.getDaily().catch(() => ({ items: [] }))
      ]);
      setSummary(sumData);
      
      const dailyItems = Array.isArray(dData) ? dData : dData?.items || [];
      const formatted = dailyItems.map((item: any) => ({
        date: item.date,
        total: item.total_events,
        authorized: item.authorized_events,
        unauthorized: item.unauthorized_events,
        unknown: item.unknown_events,
      }));
      setDailyData(formatted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading && !summary) return <LoadingSpinner />;

  const pieData = [
    { name: 'Authorized', value: summary?.authorized_events || 0, color: COLORS.AUTHORIZED },
    { name: 'Unknown', value: summary?.unknown_events || 0, color: COLORS.UNKNOWN },
    { name: 'Non-Authorized', value: summary?.unauthorized_events || 0, color: COLORS.NON_AUTHORIZED },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-[12px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <BarChartIcon className="w-4 h-4 text-indigo-500" /> Analytics & Telemetry
          </h1>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">Visualize surveillance trends and system usage.</p>
        </div>
        <button className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-colors">
           <Download className="w-3 h-3" />
           <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Line Chart */}
         <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-col">
            <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">Detection Trends (Last 30 Days)</h2>
            <div className="h-80 flex-1">
               {dailyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                       <defs>
                         <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                           <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                       <XAxis dataKey="date" stroke="#737373" fontSize={10} tickLine={false} axisLine={false} fontFamily="monospace" />
                       <YAxis stroke="#737373" fontSize={10} tickLine={false} axisLine={false} fontFamily="monospace" />
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#0a0a0c', borderColor: '#262626', borderRadius: '0.25rem', color: '#fff', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'monospace' }} 
                         itemStyle={{ color: '#e5e7eb' }}
                       />
                       <Area type="monotone" dataKey="total" stroke="#6366f1" fillOpacity={1} fill="url(#colorTotal)" name="Total Detections" />
                     </AreaChart>
                  </ResponsiveContainer>
               ) : (
                  <div className="h-full flex items-center justify-center text-neutral-600 text-[10px] font-bold uppercase tracking-widest">No trend data available.</div>
               )}
            </div>
         </div>

         {/* Distribution */}
         <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-col">
            <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">Status Distribution</h2>
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
               {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={pieData}
                         cx="50%"
                         cy="50%"
                         innerRadius={60}
                         outerRadius={80}
                         paddingAngle={2}
                         dataKey="value"
                         stroke="none"
                       >
                         {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                       </Pie>
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#0a0a0c', borderColor: '#262626', borderRadius: '0.25rem', color: '#fff', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'monospace' }} 
                       />
                       <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontFamily: 'monospace' }} />
                     </PieChart>
                  </ResponsiveContainer>
               ) : (
                  <div className="text-neutral-600 text-[10px] font-bold uppercase tracking-widest text-center">No event data to distribute.</div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
