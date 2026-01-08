"use client";

import { Button, Avatar, Dropdown, Space, Typography } from "antd";
import {
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function InstructorHeader({ collapsed, onToggle, user, onLogout }) {
  const userMenuItems = [
    {
      key: 'logout',
      label: 'ออกจากระบบ',
      icon: <LogoutOutlined />,
      onClick: onLogout,
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      {/* Left side - Toggle button */}
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
      />

      {/* Right side - User info and actions */}
      <Space size="middle">
        {/* User Profile Dropdown */}
        <Dropdown
          menu={{
            items: userMenuItems,
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Space style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: '8px' }}>
            <Avatar 
              size="default" 
              icon={<UserOutlined />}
              style={{ backgroundColor: '#52c41a' }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'I'}
            </Avatar>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Text strong style={{ fontSize: '14px', lineHeight: '1.2' }}>
                {user?.name || 'Instructor'}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px', lineHeight: '1.2' }}>
                ผู้สอน
              </Text>
            </div>
          </Space>
        </Dropdown>
      </Space>
    </div>
  );
}
