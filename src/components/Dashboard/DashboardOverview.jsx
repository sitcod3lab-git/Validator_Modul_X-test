import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'antd';

const Icons = {
  HardwareAcc: () => (
    <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m21-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
  ZeroTrust: () => (
    <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  GlobalNetwork: () => (
    <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
  PredictiveScoring: () => (
    <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
};

export default function DashboardOverview() {
  const [uptimeScore, setUptimeScore] = useState(99.999);
  const [scrolledLogs, setScrolledLogs] = useState([
    'SYSTEM OK // Edge Nodes Active across 18 Locations.',
    'Ready for hardware-accelerated processing pipeline...'
  ]);
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [scrolledLogs]);

  useEffect(() => {
    const interval = setInterval(() => {
      const locations = ['London', 'New York', 'Tokyo', 'Singapore', 'Sydney', 'Frankfurt', 'São Paulo'];
      const randomLoc = locations[Math.floor(Math.random() * locations.length)];
      const responseTime = (Math.random() * 12 + 2).toFixed(1);
      const newLog = `[${new Date().toLocaleTimeString()}] NODE_${randomLoc.toUpperCase()} processed heartbeat in ${responseTime}ms - 200 OK`;
      setScrolledLogs(prev => [...prev.slice(-30), newLog]);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-12">
      {/* SECTION 1: GLOBAL EDGE TELEMETRY */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-[#090D1A] border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold">Local Validator Node</h3>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-slate-500 text-xs">Host Identifier</span>
                <p className="text-sm font-mono font-semibold text-white">bx-validator-lon-04</p>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Encryption Profile</span>
                <p className="text-sm font-mono font-semibold text-white">AES-GCM-256-QUANTUM</p>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Core Thread Pool</span>
                <p className="text-sm font-mono font-semibold text-white">128 Concurrent Sockets</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-slate-500 text-xs mb-1.5 font-semibold uppercase">Live Telemetry Ledger</div>
            <div 
              ref={logContainerRef}
              className="bg-[#04060B] border border-slate-900 rounded-lg p-3 h-36 font-mono text-[10px] text-cyan-500/90 overflow-y-auto space-y-1.5"
            >
              {scrolledLogs.map((log, index) => (
                <div key={index} className="leading-relaxed border-l border-cyan-500/20 pl-2">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#090D1A] border border-slate-800/80 rounded-xl p-5 relative min-h-[300px] flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.4)] overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none select-none">
            <svg className="w-full h-full text-slate-600" viewBox="0 0 1000 500" fill="currentColor">
              <path d="M150,150 Q180,100 220,110 T280,160 T350,150 T320,220 T250,280 T200,320 T180,420 T200,450 T150,400 T120,300 T100,200 Z" opacity="0.3"/>
              <path d="M450,100 Q500,80 550,110 T620,90 T680,140 T700,220 T600,240 T550,300 T510,320 T480,250 Z" opacity="0.3"/>
              <path d="M750,150 Q800,120 850,160 T900,220 T880,300 T800,320 T760,250 Z" opacity="0.3"/>
              <path d="M800,350 Q850,380 880,410 T850,450 T800,420 Z" opacity="0.3"/>
            </svg>
          </div>

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[28%] left-[22%] w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-60" />
            <div className="absolute top-[28%] left-[22%] w-2 h-2 bg-cyan-400 rounded-full" />
            
            <div className="absolute top-[24%] left-[48%] w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-60" />
            <div className="absolute top-[24%] left-[48%] w-2 h-2 bg-cyan-400 rounded-full" />

            <div className="absolute top-[42%] left-[76%] w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-60" />
            <div className="absolute top-[42%] left-[76%] w-2 h-2 bg-cyan-400 rounded-full" />

            <svg className="absolute inset-0 w-full h-full" stroke="currentColor" fill="none">
              <path d="M 220 140 Q 350 80 480 120" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1.5" strokeDasharray="5 5" className="animate-[dash_10s_linear_infinite]" />
              <path d="M 480 120 Q 620 160 760 210" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1.5" strokeDasharray="5 5" className="animate-[dash_10s_linear_infinite]" />
            </svg>
          </div>

          <div className="flex items-center justify-between z-10">
            <div>
              <h3 className="text-white font-semibold text-sm">Global Edge Network Capacity</h3>
              <p className="text-xs text-slate-500">18 validation centers routing real-time lookups globally.</p>
            </div>
            <div className="bg-slate-900/80 px-2 py-1 rounded border border-slate-800 text-[10px] font-mono text-cyan-400">
              SECURE TUNNEL ACTIVE
            </div>
          </div>

          <div className="mt-auto pt-24 flex items-center justify-center z-10">
            <div className="bg-slate-950/90 border border-emerald-500/20 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-semibold text-emerald-400">
                System Operational - {uptimeScore.toFixed(3)}% Uptime
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ARCHITECTURAL SUPERIORITY */}
      <section className="space-y-6">
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-white tracking-tight">Architectural Superiority</h2>
          <p className="text-slate-400 text-xs">Modular components designed for high-frequency transactional environments.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#090D1A] border border-slate-800/80 rounded-xl p-5 space-y-4 hover:border-cyan-500/30 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <Icons.HardwareAcc />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Hardware Acceleration</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  Bypassing standard software stacks, Modul X interfaces directly with specialized hardware to execute MX lookups and SMTP handshakes concurrently.
                </p>
              </div>
            </div>
            <div>
              <div className="flex gap-1.5 pt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((seg) => (
                  <div 
                    key={seg} 
                    className={`h-1.5 flex-1 rounded bg-cyan-400 animate-pulse`} 
                    style={{ animationDelay: `${seg * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#090D1A] border border-slate-800/80 rounded-xl p-5 space-y-3 hover:border-cyan-500/30 transition-all">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Icons.ZeroTrust />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Zero-Trust Processing</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Data is processed in memory and immediately purged. No logs, no traces, maintaining absolute cryptographic integrity.
              </p>
            </div>
          </div>

          <div className="bg-[#090D1A] border border-slate-800/80 rounded-xl p-5 space-y-3 hover:border-cyan-500/30 transition-all">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Icons.GlobalNetwork />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Global Edge Network</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Distributed validation nodes ensure ultra-low latency globally, routing domain queries to closest topological systems.
              </p>
            </div>
          </div>

          <div className="bg-[#090D1A] border border-slate-800/80 rounded-xl p-5 space-y-4 hover:border-cyan-500/30 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Icons.PredictiveScoring />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Predictive Scoring Engine</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  Machine learning models analyze historical bounce patterns and domain reputation to assign a confidence score before SMTP validation.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-t border-slate-800/60 pt-3">
              <div className="w-9 h-9 rounded-full border-2 border-emerald-500 flex items-center justify-center text-[10px] font-bold text-emerald-400 font-mono">
                96%
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider leading-none">
                Confidence Matrix
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
