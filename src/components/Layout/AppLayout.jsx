import React, { useState, useEffect } from 'react';
import { Layout, Menu, Tag, Button, Tooltip } from 'antd';
import { 
  DashboardOutlined, 
  SafetyCertificateOutlined, 
  DeploymentUnitOutlined, 
  DotChartOutlined, 
  FileProtectOutlined, 
  TransactionOutlined,
  LogoutOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { emailApi } from '../../services/api';

const { Sider, Header, Content, Footer } = Layout;

export default function AppLayout({ children, activePage, onPageChange }) {
  const [collapsed, setCollapsed] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    const checkApi = async () => {
      try {
        await emailApi.health();
        setApiStatus('online');
      } catch {
        setApiStatus('offline');
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 15000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'validation', icon: <SafetyCertificateOutlined />, label: 'Validation' },
    { key: 'pipeline', icon: <DeploymentUnitOutlined />, label: 'Pipeline' },
    { key: 'analytics', icon: <DotChartOutlined />, label: 'Analytics' },
    { key: 'compliance', icon: <FileProtectOutlined />, label: 'Compliance' },
    { key: 'pricing', icon: <TransactionOutlined />, label: 'Pricing' }
  ];

  return (
    <Layout className="min-h-screen bg-[#06080F]">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(val) => setCollapsed(val)}
        width={260}
        theme="dark"
        className="border-r border-slate-900 shadow-2xl relative z-20 select-none"
      >
        <div className="h-20 flex items-center px-6 border-b border-slate-900 gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <DeploymentUnitOutlined className="text-white text-lg animate-pulse" />
          </div>
          {!collapsed && (
            <span className="font-mono text-lg font-bold tracking-wider bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
              MODUL X
            </span>
          )}
        </div>

        <div className="px-3 my-4">
          <div className="relative">
            <SearchOutlined className="absolute left-3 top-3 text-slate-500" />
            <input 
              placeholder={collapsed ? "" : "Quick global search..."}
              className="w-full bg-[#0D121F] text-slate-300 placeholder-slate-600 border border-slate-900 rounded-lg py-2 pl-9 pr-4 text-xs font-mono focus:outline-none focus:border-cyan-500/50 transition-all"
              disabled={collapsed}
            />
          </div>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activePage]}
          items={menuItems}
          onClick={(e) => onPageChange(e.key)}
          className="bg-transparent border-none mt-2 px-2"
        />

        <div className="absolute bottom-16 left-0 w-full px-4 flex flex-col gap-3">
          {!collapsed && (
            <>
              <div className="p-3 bg-[#0D121F]/60 border border-slate-900 rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">System Sec</span>
                <Tag color="cyan" className="font-mono m-0 text-[10px] border-none px-2 py-0.5 bg-cyan-500/10 text-cyan-400">
                  AES-256
                </Tag>
              </div>
              <Button type="primary" shape="round" block size="large" className="bg-gradient-to-r from-cyan-500 to-blue-600 border-none shadow-[0_0_15px_rgba(6,182,212,0.35)] font-bold text-xs">
                GET STARTED
              </Button>
            </>
          )}
        </div>
      </Sider>

      <Layout className="flex flex-col">
        <Header className="h-16 px-8 flex items-center justify-between border-b border-slate-900 relative z-10 bg-[#090D1A]/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Tag color={apiStatus === 'online' ? 'success' : 'error'} className="font-mono text-[10px] uppercase tracking-wider px-2 border-none">
              {apiStatus === 'online' ? '🟢 API Core: ONLINE' : '🔴 API Core: OFFLINE'}
            </Tag>
          </div>
          <div className="flex items-center gap-6">
            <Tooltip title="GitHub Repository">
              <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </Tooltip>
            <div className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-cyan-400 transition-all font-mono text-xs">
              <LogoutOutlined />
              <span>Sign In</span>
            </div>
          </div>
        </Header>

        <Content className="p-8 max-w-[1600px] w-full mx-auto flex-1 overflow-y-auto">
          {children}
        </Content>

        <Footer className="border-t border-slate-900 text-center py-6 bg-[#06080F]">
          <div className="flex flex-col md:flex-row items-center justify-between text-xs text-slate-600 font-mono gap-4">
            <span>© 2026 BRIDGE MODUL X • ADVANCED CORE VALIDATION INC.</span>
            <div className="flex gap-6">
              <span className="hover:text-cyan-500 cursor-pointer">PRIVACY</span>
              <span className="hover:text-cyan-500 cursor-pointer">TERMS</span>
              <span className="hover:text-cyan-500 cursor-pointer">API CORE v2.0.0</span>
            </div>
          </div>
        </Footer>
      </Layout>
    </Layout>
  );
}
