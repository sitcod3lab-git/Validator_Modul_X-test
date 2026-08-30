import { theme } from 'antd';

export const darkThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#06B6D4', // Glowing Cyan
    colorSuccess: '#10B981', // Emerald Pass
    colorWarning: '#F59E0B', // Amber Alert
    colorError: '#EF4444',   // Rose Blocked
    colorInfo: '#3B82F6',    // Blue Network
    colorBgBase: '#06080F',  // Deep Space Canvas
    colorBgContainer: '#0D121F', // Module Card Backplate
    colorBgElevated: '#131A2E',
    colorTextBase: '#F1F5F9',
    colorTextSecondary: '#94A3B8',
    colorBorder: '#1E293B',
    fontFamily: 'Inter, "JetBrains Mono", sans-serif',
    borderRadius: 12,
    controlHeight: 40,
    boxShadow: '0 0 20px rgba(6, 182, 212, 0.08)'
  },
  components: {
    Layout: {
      siderBg: '#080B15',
      headerBg: '#090D1A',
      bodyBg: '#06080F'
    },
    Menu: {
      itemSelectedColor: '#06B6D4',
      itemSelectedBg: 'rgba(6, 182, 212, 0.1)'
    },
    Card: {
      headerBg: 'rgba(13, 18, 31, 0.8)',
      headerBorderColor: '#1E293B'
    },
    Input: {
      activeBorderColor: '#06B6D4',
      hoverBorderColor: '#06B6D4'
    },
    Table: {
      headerBg: '#131A2E',
      headerColor: '#94A3B8',
      rowHoverBg: 'rgba(6, 182, 212, 0.04)'
    }
  }
};
