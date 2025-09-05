"use client";

import { Button, Avatar, Dropdown, Space, Badge, Typography } from "antd";
import {
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
  MailOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function AdminHeader({ collapsed, onToggle, user, onLogout }) {
  // User menu items
  const userMenuItems = [
    {
      key: 'profile',
      label: 'ข้อมูลส่วนตัว',
      icon: <UserOutlined />,
    },
    {
      key: 'settings',
      label: 'การตั้งค่า',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider',
    },
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
        style={{
          fontSize: '16px',
          width: 64,
          height: 64,
        }}
      />

      {/* Right side - User info and actions */}
      <Space size="middle">
        {/* Notifications */}
        <Badge count={5} size="small">
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: '18px' }} />}
            style={{ height: '40px', width: '40px' }}
          />
        </Badge>

        {/* Messages */}
        <Badge count={2} size="small">
          <Button
            type="text"
            icon={<MailOutlined style={{ fontSize: '18px' }} />}
            style={{ height: '40px', width: '40px' }}
          />
        </Badge>

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
              style={{ backgroundColor: '#1890ff' }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </Avatar>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Text strong style={{ fontSize: '14px', lineHeight: '1.2' }}>
                {user?.name || 'Admin User'}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px', lineHeight: '1.2' }}>
                ผู้ดูแลระบบ
              </Text>
            </div>
          </Space>
        </Dropdown>
      </Space>
    </div>
  );
}
