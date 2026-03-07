import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar } from 'antd';
import {
  AppstoreOutlined,
  PictureOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import { logout } from '../services/texture';
import './AdminLayout.css';

const { Sider, Header, Content } = Layout;

const menuItems = [
  // { key: '/admin/dashboard/overview', icon: <AppstoreOutlined />, label: 'Tổng quan' },
  { key: '/admin/dashboard/bag-templates', icon: <GiftOutlined />, label: 'Mẫu túi' },
  { key: '/admin/dashboard/textures', icon: <PictureOutlined />, label: 'Textures' },
  { key: '/admin/dashboard/orders', icon: <ShoppingOutlined />, label: 'Đơn hàng' },
  // { key: '/admin/dashboard/settings', icon: <SettingOutlined />, label: 'Cài đặt' },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/admin', { replace: true });
  };

  return (
    <Layout className="admin-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        className="admin-sider"
      >
        <div className="admin-logo">
          {!collapsed && <span>GreenShield Admin</span>}
          {collapsed && <span>GS</span>}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="admin-menu"
        />
      </Sider>
      <Layout>
        <Header className="admin-header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="admin-trigger"
          />
          <div className="admin-header-right">
            <Avatar size="small" className="admin-avatar">A</Avatar>
            <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
              Đăng xuất
            </Button>
          </div>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
