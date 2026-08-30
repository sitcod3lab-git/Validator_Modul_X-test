import React from 'react';
import { Timeline, Tag } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  LoadingOutlined, 
  MinusCircleOutlined 
} from '@ant-design/icons';

export default function LayerTimeline({ stages = [], activeIndex = -1 }) {
  const getTimelineIcon = (stage, index) => {
    if (stage.status === 'processing' || index === activeIndex) {
      return <LoadingOutlined className="text-cyan-400 text-base" />;
    }
    if (stage.status === 'pass') {
      return <CheckCircleOutlined className="text-emerald-400 text-base" />;
    }
    if (stage.status === 'fail') {
      return <CloseCircleOutlined className="text-rose-400 text-base" />;
    }
    return <MinusCircleOutlined className="text-slate-700 text-sm" />;
  };

  const getTagColor = (status) => {
    if (status === 'pass') return 'success';
    if (status === 'fail') return 'error';
    if (status === 'processing') return 'processing';
    return 'default';
  };

  const timelineItems = stages.map((stage, idx) => ({
    dot: getTimelineIcon(stage, idx),
    children: (
      <div className="flex items-start justify-between bg-[#131A2E]/30 p-3 rounded-lg border border-slate-900/50 mb-3 hover:border-slate-800/80 transition-all">
        <div>
          <span className="font-mono text-xs text-white block font-medium">
            Layer {idx + 1}: {stage.name}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {stage.detail}
          </span>
        </div>
        <Tag color={getTagColor(stage.status)} className="font-mono text-[9px] uppercase tracking-wider m-0 px-2 border-none h-5 flex items-center">
          {stage.status}
        </Tag>
      </div>
    )
  }));

  return (
    <div className="p-4 bg-[#0D121F]/80 rounded-xl border border-slate-900">
      <h4 className="font-mono text-xs text-slate-400 tracking-wider uppercase mb-6 border-b border-slate-900 pb-3 flex justify-between items-center">
        <span>7-Layer Processing Logs</span>
        <span className="text-[10px] text-cyan-400">RFC 5321</span>
      </h4>
      <Timeline items={timelineItems} className="custom-timeline" />
    </div>
  );
}
