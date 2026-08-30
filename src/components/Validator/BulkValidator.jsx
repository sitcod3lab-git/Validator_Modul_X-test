import React, { useState } from 'react';
import { Card, Button, Input, Progress, Table, Row, Col, Upload, Tag, message, Alert } from 'antd';
import { InboxOutlined, DownloadOutlined, ClearOutlined, PlaySquareOutlined } from '@ant-design/icons';
import { useBulkValidation } from '../../hooks/useValidation';
import Papa from 'papaparse';

const { Dragger } = Upload;
const { TextArea } = Input;

export default function BulkValidator() {
  const [textInput, setTextInput] = useState('');
  const { status, results, progress, total, processed, error, startBulk, reset } = useBulkValidation();

  // CSV/TXT File Processing via PapaParse
  const handleFileUpload = (file) => {
    Papa.parse(file, {
      complete: (res) => {
        const emails = res.data
          .flat()
          .map(e => e?.trim())
          .filter(e => e && e.includes('@'));
        
        if (emails.length === 0) {
          message.error('No valid emails parsed from CSV file');
          return;
        }
        setTextInput(emails.join('\n'));
        message.success(`Parsed ${emails.length} emails from document`);
      },
      error: () => {
        message.error('CSV Parsing Error');
      }
    });
    return false; // Prevent auto-upload trigger
  };

  const handleLaunch = () => {
    const parsedList = textInput
      .split(/[\n,]+/)
      .map(e => e.trim())
      .filter(e => e.length > 0 && e.includes('@'));

    if (parsedList.length === 0) {
      message.error('Please input a list of valid emails to validate');
      return;
    }

    startBulk(parsedList);
  };

  const downloadResultsCSV = () => {
    if (results.length === 0) return;
    const csvContent = Papa.unparse(results.map(r => ({
      Email: r.email,
      Status: r.status,
      Score: r.scoring?.score || 0,
      Risk: r.scoring?.risk_level || 'UNKNOWN',
      MX_Domain: r.dns?.domain_exists ? 'YES' : 'NO',
      Disposable: r.disposable?.is_disposable ? 'YES' : 'NO',
      SMTP_Deliverable: r.smtp?.verified ? 'YES' : 'NO'
    })));

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ModulX_BulkResult_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    { title: 'Email Address', dataIndex: 'email', key: 'email', render: text => <span className="font-mono text-xs">{text}</span> },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: status => {
        const color = status === 'VALID' ? 'success' : status === 'RISKY' ? 'warning' : 'error';
        return <Tag color={color} className="font-mono text-[9px] border-none px-2">{status}</Tag>;
      }
    },
    { title: 'Score', dataIndex: ['scoring', 'score'], key: 'score', sorter: (a, b) => a.scoring?.score - b.scoring?.score, render: score => <span className="font-mono text-xs font-bold text-cyan-400">{score}%</span> },
    { title: 'Risk Tier', dataIndex: ['scoring', 'risk_level'], key: 'risk_level', render: tier => <span className="text-xs">{tier}</span> },
    { title: 'SMTP Status', dataIndex: ['smtp', 'verified'], key: 'smtp', render: verified => <Tag color={verified ? 'success' : 'error'} className="text-[10px] border-none">{verified ? 'ACTIVE' : 'BLOCKED'}</Tag> }
  ];

  const validCount = results.filter(r => r.status === 'VALID').length;
  const invalidCount = results.filter(r => r.status === 'INVALID').length;
  const riskyCount = results.filter(r => r.status === 'RISKY').length;

  return (
    <div className="space-y-8">
      {/* Upload & Paste Inputs Bento Container */}
      {status === 'idle' ? (
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card className="cyber-panel bg-[#0D121F]/80 h-full p-4 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-mono text-sm font-bold tracking-wider uppercase text-slate-300">
                  Bulk Input List
                </h3>
                <p className="text-xs text-slate-500">
                  Paste emails separated by lines, commas, or semicolons.
                </p>
                <TextArea
                  rows={8}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="name@company.com&#10;support@agency.org"
                  className="font-mono bg-[#06080F] text-white border-slate-800 focus:border-cyan-500/50 text-xs"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button icon={<ClearOutlined />} onClick={() => setTextInput('')} className="bg-slate-800 border-none font-mono text-xs">
                  CLEAR
                </Button>
                <Button type="primary" icon={<PlaySquareOutlined />} onClick={handleLaunch} className="bg-cyan-500 border-none font-mono font-bold text-xs">
                  LAUNCH BULK AGENT
                </Button>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card className="cyber-panel bg-[#0D121F]/80 h-full p-4">
              <h3 className="font-mono text-sm font-bold tracking-wider uppercase text-slate-300 mb-4">
                Upload CSV / TXT Document
              </h3>
              <Dragger
                beforeUpload={handleFileUpload}
                showUploadList={false}
                className="bg-[#06080F]/40 border border-dashed border-slate-800 rounded-xl hover:border-cyan-500/50 py-12"
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined className="text-cyan-500 text-5xl animate-pulse" />
                </p>
                <p className="ant-upload-text font-mono text-xs font-bold mt-4 text-slate-300">
                  Drag and drop raw file to analyze here
                </p>
                <p className="ant-upload-hint text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">
                  Automatically parses columns. Supported formats: `.csv`, `.txt`, `.xlsx`
                </p>
              </Dragger>
            </Card>
          </Col>
        </Row>
      ) : (
        <Card className="cyber-panel bg-[#0D121F]/80 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-mono text-sm font-bold text-slate-300 uppercase tracking-widest">
                Active Verification Campaign
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Processing bulk matrix in parallel clusters [26].
              </p>
            </div>
            {status === 'completed' && (
              <div className="flex gap-3">
                <Button icon={<DownloadOutlined />} type="primary" onClick={downloadResultsCSV} className="bg-cyan-500 border-none font-mono text-xs">
                  DOWNLOAD REPORT CSV
                </Button>
                <Button icon={<ClearOutlined />} onClick={reset} className="bg-slate-800 border-none font-mono text-xs">
                  RESET CAMPAIGN
                </Button>
              </div>
            )}
          </div>

          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} md={8}>
              <div className="bg-[#131A2E]/50 p-4 border border-slate-900 rounded-xl">
                <span className="text-[10px] text-slate-500 font-mono block">PROCESSED TELEMETRY</span>
                <span className="text-2xl font-bold font-mono text-white mt-1 block">
                  {processed} / {total}
                </span>
                <Progress percent={progress} strokeColor="#06B6D4" trailColor="#1E293B" showInfo={false} className="mt-4" />
              </div>
            </Col>
            <Col xs={24} md={16}>
              <Row gutter={16}>
                <Col span={8}>
                  <div className="bg-[#131A2E]/30 p-4 border border-slate-900 rounded-xl text-center">
                    <span className="text-[10px] text-emerald-400 font-mono block">VALID ACTIVE</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">{validCount}</span>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="bg-[#131A2E]/30 p-4 border border-slate-900 rounded-xl text-center">
                    <span className="text-[10px] text-amber-400 font-mono block">RISKY/WARN</span>
                    <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">{riskyCount}</span>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="bg-[#131A2E]/30 p-4 border border-slate-900 rounded-xl text-center">
                    <span className="text-[10px] text-rose-400 font-mono block">INVALID BLOCKED</span>
                    <span className="text-2xl font-bold font-mono text-rose-400 mt-1 block">{invalidCount}</span>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>

          {error && <Alert message={error} type="error" className="bg-rose-500/5 border-rose-500/10 text-rose-300 mb-6" />}

          <Table
            dataSource={results}
            columns={columns}
            rowKey="email"
            pagination={{ pageSize: 10, size: 'small' }}
            className="custom-antd-table"
          />
        </Card>
      )}
    </div>
  );
}
