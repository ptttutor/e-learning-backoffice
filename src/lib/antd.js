import { ConfigProvider, App } from 'antd';
import thTH from 'antd/locale/th_TH';

export const antdConfig = {
  locale: thTH,
  theme: {
    token: {
      // ปรับแต่ง theme ตามต้องการ
    },
  },
};

export function AntdConfigProvider({ children }) {
  return (
    <ConfigProvider {...antdConfig}>
      <App>
        {children}
      </App>
    </ConfigProvider>
  );
}
