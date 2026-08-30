import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, Switch, Row, Col, Alert, Empty, Tag } from 'antd';
import { 
  PlayCircleOutlined, 
  ThunderboltOutlined
} from '@ant-design/icons';
import { useSingleValidation } from '../../hooks/useValidation';
import ScoreGauge from './ScoreGauge';

const STAGE_METADATA = [
  { id: 'syntax', name: 'Syntax', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id: 'dns', name: 'DNS Lookup', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'mx', name: 'MX Records', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { id: 'disposable', name: 'Disposable', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' },
  { id: 'catchall', name: 'Catch-All', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  { id: 'smtp', name: 'SMTP', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
  { id: 'scoring', name: 'Scoring', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2zm9 0v-8a2 2 0 00-2-2h-2a2 2 0 00-2 2v8a2 2 0 002 2h2a2 2 0 002-2z' }
];

export default function SingleValidator() {
  const [email, setEmail] = useState('enterprise@modulx.io');
  const [deep, setDeep] = useState(true);
  const { result, loading, error, validate, reset } = useSingleValidation();
  
  const [pipelineIndex, setPipelineIndex] = useState(-1);
  const [stages, setStages] = useState(
    STAGE_METADATA.map(s => ({ ...s, status: 'idle', detail: 'Waiting to analyze...' }))
  );

  const conveyorRef = useRef(null);

  const runVerification = async (e) => {
    if (e) e.preventDefault();
    if (!email) return;

    // Reset components & state machine
    reset();
    setPipelineIndex(0);
    setStages(STAGE_METADATA.map(s => ({ ...s, status: 'idle', detail: 'Awaiting signal...' })));

    try {
      // Step-by-step UI pipeline sweep simulations mapping backend layers
      for (let i = 0; i < STAGE_METADATA.length; i++) {
        setPipelineIndex(i);
        setStages(prev => prev.map((s, idx) => {
          if (idx === i) return { ...s, status: 'processing', detail: 'Calculating telemetry...' };
          return s;
        }));
        
        await new Promise(r => setTimeout(r, 900)); // Dynamic delay per stage iteration
      }

      // Hit API validation endpoint [84, 90]
      const response = await validate(email, deep);

      // Map backend payload properties to UI conveyor steps [83, 85]
      setStages([
        { id: 'syntax', name: 'Syntax', status: response.syntax?.passed ? 'pass' : 'fail', detail: response.syntax?.passed ? 'RFC 5321 Pass' : response.syntax?.error || 'Format Error' },
        { id: 'dns', name: 'DNS Lookup', status: response.dns?.domain_exists ? 'pass' : 'fail', detail: response.dns?.domain_exists ? 'Domain Valid' : 'Domain Non-existent' },
        { id: 'mx', name: 'MX Records', status: response.dns?.has_mx_records ? 'pass' : 'fail', detail: response.dns?.has_mx_records ? `${response.dns.mx_records?.length || 0} Exchangers` : 'No MX Found' },
        { id: 'disposable', name: 'Disposable', status: response.disposable?.is_disposable ? 'fail' : 'pass', detail: response.disposable?.is_disposable ? 'Burner Blocked' : 'Clean Provider' },
        { id: 'catchall', name: 'Catch-All', status: response.catch_all?.is_catch_all ? 'fail' : 'pass', detail: response.catch_all?.is_catch_all ? 'Wildcard Active' : 'SMTP Specific' },
        { id: 'smtp', name: 'SMTP', status: response.smtp?.verified ? 'pass' : 'fail', detail: response.smtp?.verified ? 'Mailbox Active' : response.smtp?.error || 'Rejected Mailbox' },
        { id: 'scoring', name: 'Scoring', status: 'pass', detail: `Grade: ${response.scoring?.risk_level || 'UNKNOWN'}` }
      ]);
      setPipelineIndex(-1);

    } catch (err) {
      setPipelineIndex(-1);
      setStages(prev => prev.map(s => s.status === 'processing' ? { ...s, status: 'fail', detail: 'Process Interrupted' } : s));
    }
  };

  const getStepColorClass = (status, idx) => {
    if (idx === pipelineIndex || status === 'processing') return 'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] bg-cyan-950/20';
    if (status === 'pass') return 'border-emerald-500/30 bg-emerald-950/10 text-emerald-400';
    if (status === 'fail') return 'border-rose-500/30 bg-rose-950/10 text-rose-400';
    return 'border-slate-800/80 bg-[#0D121F]/40 text-slate-500';
  };

  return (
    <div className="space-y-8 select-none">
      {/* Search Bar Input Panel */}
      <Card className="cyber-panel bg-[#0D121F]/80 p-3">
        <form onSubmit={runVerification} className="flex flex-col md:flex-row gap-4 items-center">
          <Input
            size="large"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Type corporate target domain or address to scrutinize..."
            className="flex-1 font-mono bg-[#06080F] text-white border-slate-800 focus:border-cyan-500/60 text-sm"
          />
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">Deep SMTP Verification</span>
              <Switch checked={deep} onChange={setDeep} className="bg-slate-800" />
            </div>
            <Button
              type="primary"
              size="large"
              loading={loading}
              onClick={runVerification}
              icon={<PlayCircleOutlined />}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 border-none px-8 font-bold font-mono tracking-wider text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              RUN VALIDATION
            </Button>
          </div>
        </form>
      </Card>

      {/* Futuristic 7-Layer SVG Conveyor Belt Pipeline */}
      <Card className="cyber-panel bg-[#0D121F]/80 scanline-overlay overflow-hidden py-10 relative">
        <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-10 px-4">
          <div className="flex items-center gap-2">
            <ThunderboltOutlined className="text-cyan-500 animate-pulse text-lg" />
            <h3 className="font-mono text-sm font-bold tracking-widest text-slate-300 uppercase">
              7-Layer Validation Pipeline (Live telemetry Map)
            </h3>
          </div>
          <Tag color="cyan" className="font-mono text-[10px] m-0 border-none bg-cyan-500/10 text-cyan-400">
            Node status: ACTIVE
          </Tag>
        </div>

        {/* Conveyor Tracks */}
        <div className="relative w-full py-8 px-4 flex justify-between items-center z-10" ref={conveyorRef}>
          {/* Main Track Metal Belt Graphic */}
          <div className="absolute left-0 right-0 h-4 bg-slate-950 border-t border-b border-slate-800 rounded-full top-[50%] -translate-y-1/2 z-0 overflow-hidden">
            <div className="w-[200%] h-full animate-conveyor flex gap-2">
              {[...Array(60)].map((_, i) => (
                <div key={i} className="w-1 h-full bg-slate-800 opacity-30 transform skew-x-12" />
              ))}
            </div>
          </div>

          {/* Sequential SVG Pipeline Machines (from image) */}
          {stages.map((stage, idx) => (
            <div key={stage.id} className="relative z-10 flex flex-col items-center">
              {/* Device Model with status indicators */}
              <div className={`w-14 h-14 rounded-xl border flex items-center justify-center transition-all duration-300 ${getStepColorClass(stage.status, idx)}`}>
                <svg className="w-6 h-6 fill-none stroke-current" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={stage.icon} />
                </svg>
                {/* Micro LED status pings */}
                <div className={`absolute -top-1 w-2.5 h-2.5 rounded-full border border-black ${
                  stage.status === 'pass' ? 'bg-emerald-400' :
                  stage.status === 'fail' ? 'bg-rose-500' :
                  stage.status === 'processing' ? 'bg-cyan-400 animate-ping' :
                  'bg-slate-800'
                }`} />
              </div>

              {/* Step metadata */}
              <div className="text-center mt-3 font-mono">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  {stage.name}
                </span>
                <span className={`text-[9px] mt-0.5 block ${
                  stage.status === 'pass' ? 'text-emerald-400 font-bold' :
                  stage.status === 'fail' ? 'text-rose-400 font-bold' :
                  stage.status === 'processing' ? 'text-cyan-400 animate-pulse' :
                  'text-slate-600'
                }`}>
                  {stage.status === 'processing' ? 'PROCESSING...' : stage.detail}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Validation Results Bento Container */}
      {result ? (
        <Row gap={24} gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <Card className="cyber-panel bg-[#0D121F]/80 h-full p-4">
              <div className="flex items-center justify-between mb-8 border-b border-slate-900 pb-3">
                <h3 className="font-mono text-xs text-slate-400 uppercase tracking-widest">
                  Result Analysis Report
                </h3>
                <Tag color={result.status === 'VALID' ? 'success' : result.status === 'RISKY' ? 'warning' : 'error'} className="font-mono text-[10px] px-3 m-0 border-none">
                  {result.status}
                </Tag>
              </div>

              <Row gutter={[24, 24]}>
                <Col span={12}>
                  <div className="space-y-4">
                    <div className="bg-[#131A2E]/50 p-4 rounded-xl border border-slate-900">
                      <span className="text-[10px] text-slate-500 font-mono block uppercase">TARGET SUBJECT</span>
                      <span className="text-sm font-bold text-white font-mono mt-1 block truncate">{result.email}</span>
                    </div>
                    <div className="bg-[#131A2E]/50 p-4 rounded-xl border border-slate-900">
                      <span className="text-[10px] text-slate-500 font-mono block uppercase">PROVIDER</span>
                      <span className="text-sm font-bold text-white font-mono mt-1 block capitalize">
                        {result.disposable?.provider_name || 'Enterprise Domain'}
                      </span>
                    </div>
                  </div>
                </Col>

                <Col span={12}>
                  <div className="space-y-4">
                    <div className="bg-[#131A2E]/50 p-4 rounded-xl border border-slate-900">
                      <span className="text-[10px] text-slate-500 font-mono block uppercase">PROCESS DURATION</span>
                      <span className="text-sm font-bold text-cyan-400 font-mono mt-1 block">{result.processing_time_ms} ms</span>
                    </div>
                    <div className="bg-[#131A2E]/50 p-4 rounded-xl border border-slate-900">
                      <span className="text-[10px] text-slate-500 font-mono block uppercase">TIMESTAMP</span>
                      <span className="text-xs font-bold text-white font-mono mt-1 block">
                        {new Date(result.validated_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Warning Panels if any */}
              {result.scoring?.warnings?.length > 0 && (
                <div className="mt-6 space-y-2">
                  {result.scoring.warnings.map((warn, i) => (
                    <Alert key={i} message={warn} type="warning" showIcon className="bg-amber-500/5 text-amber-300 border-amber-500/10" />
                  ))}
                </div>
              )}
            </Card>
          </Col>

          {/* Calibrated Dial scoring metric indicator */}
          <Col xs={24} md={8}>
            <Card className="cyber-panel bg-[#0D121F]/80 h-full flex flex-col items-center justify-center py-10">
              <ScoreGauge score={result.scoring?.score || 0} />
              
              <div className="mt-8 text-center space-y-2">
                <Tag color={result.scoring?.score >= 75 ? 'emerald' : result.scoring?.score >= 45 ? 'amber' : 'red'} className="border-none font-mono px-4 text-xs font-bold">
                  {result.scoring?.risk_level || 'UNKNOWN'} RISK PROFILE
                </Tag>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  AI scoring calibrated dynamically against domain health patterns and active DNS verification weights.
                </p>
              </div>
            </Card>
          </Col>
        </Row>
      ) : (
        <Card className="cyber-panel bg-[#0D121F]/40 py-24 text-center">
          <Empty description={<span className="text-slate-500 font-mono text-xs">Awaiting signal validation sequence trigger...</span>} />
        </Card>
      )}
    </div>
  );
}
