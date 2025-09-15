import React, { useState } from "react";
import {
  Card,
  Tabs,
  Row,
  Col,
  Statistic,
  Switch,
  Space,
  Typography,
  Avatar,
  Divider,
  Badge,
} from "antd";
import {
  DashboardOutlined,
  BookOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  SettingOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  BarChartOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import SalesChart from "./SalesChart";
import CourseSalesDetail from "./CourseSalesDetail";
import EbookSalesDetail from "./EbookSalesDetail";
import { useDashboardStats, useCourseSales } from "@/hooks/useDashboard";

const { Title } = Typography;
const { TabPane } = Tabs;

const DashboardOverview = () => {
  const [period, setPeriod] = useState(30);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { stats, loading: statsLoading } = useDashboardStats(period);
  const { courseSales, loading: courseSalesLoading } = useCourseSales(period);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat("th-TH").format(number);
  };

  return (
    <div style={{ background: "#f5f7fa", minHeight: "100vh", padding: "0" }}>
      {/* Header Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "32px",
          marginBottom: "24px",
          borderRadius: "0 0 24px 24px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space align="start">
              <Avatar
                size={64}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  fontSize: "24px",
                }}
              >
                <DashboardOutlined />
              </Avatar>
              <div>
                <Title
                  level={1}
                  style={{ margin: 0, color: "#fff", fontWeight: "300" }}
                >
                  Dashboard
                </Title>
                <Typography.Text
                  style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px" }}
                >
                  ภาพรวมการขายและสถิติ
                </Typography.Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Card
              size="small"
              style={{
                background: "rgba(255,255,255,0.95)",
                borderRadius: "12px",
                border: "none",
                backdropFilter: "blur(10px)",
              }}
            >
              <Space align="center">
                <SettingOutlined style={{ color: "#667eea" }} />
                <Typography.Text strong>รายละเอียด:</Typography.Text>
                <Switch
                  checked={showDetailedView}
                  onChange={setShowDetailedView}
                  checkedChildren={<EyeOutlined />}
                  unCheckedChildren={<EyeInvisibleOutlined />}
                  style={{
                    background: showDetailedView ? "#52c41a" : "#d9d9d9",
                  }}
                />
              </Space>
            </Card>
          </Col>
        </Row>
      </div>

      <div style={{ padding: "0 24px" }}>
        {/* Sales Chart */}
        <div style={{ marginBottom: "24px" }}>
          <SalesChart />
        </div>

        {/* Overview Stats */}
        {stats && (
          <Card
            title={
              <Space>
                <BarChartOutlined style={{ color: "#1890ff" }} />
                <span style={{ fontSize: "18px", fontWeight: "600" }}>
                  สถิติโดยรวม
                </span>
              </Space>
            }
            style={{
              marginBottom: "24px",
              borderRadius: "16px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              padding: "20px",
            }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={4}>
                <Card
                  size="small"
                  style={{
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                    border: "none",
                    minHeight: "120px",
                    padding: "16px",
                  }}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "rgba(255,255,255,0.9)",
                          fontSize: "12px",
                        }}
                      >
                        รายได้รวม
                      </span>
                    }
                    value={stats.stats.revenue.total}
                    prefix={
                      <DollarOutlined
                        style={{ color: "#fff", fontSize: "16px" }}
                      />
                    }
                    suffix="บาท"
                    valueStyle={{
                      color: "#fff",
                      fontSize: "18px",
                      fontWeight: "bold",
                    }}
                  />
                  <div
                    style={{
                      marginTop: "6px",
                      padding: "3px 6px",
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: "4px",
                      fontSize: "10px",
                      color: "#fff",
                    }}
                  >
                    <RiseOutlined /> +12.5% เทียบเดือนก่อน
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={4}>
                <Card
                  size="small"
                  style={{
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                    border: "none",
                    minHeight: "120px",
                    padding: "16px",
                  }}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "rgba(255,255,255,0.9)",
                          fontSize: "12px",
                        }}
                      >
                        คำสั่งซื้อทั้งหมด
                      </span>
                    }
                    value={stats.stats.orders.total}
                    prefix={
                      <ShoppingCartOutlined
                        style={{ color: "#fff", fontSize: "16px" }}
                      />
                    }
                    valueStyle={{
                      color: "#fff",
                      fontSize: "18px",
                      fontWeight: "bold",
                    }}
                  />
                  <div style={{ marginTop: "6px", fontSize: "10px" }}>
                    <Badge status="success" />
                    <span style={{ color: "rgba(255,255,255,0.9)" }}>
                      สำเร็จ: {stats.stats.orders.completed}
                    </span>
                    <br />
                    <Badge status="processing" />
                    <span style={{ color: "rgba(255,255,255,0.9)" }}>
                      รออนุมัติ: {stats.stats.orders.pending}
                    </span>
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={4}>
                <Card
                  size="small"
                  style={{
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #722ed1 0%, #531dab 100%)",
                    border: "none",
                    minHeight: "120px",
                    padding: "16px",
                  }}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "rgba(255,255,255,0.9)",
                          fontSize: "12px",
                        }}
                      >
                        ผู้ใช้ใหม่
                      </span>
                    }
                    value={stats.stats.users.new}
                    prefix={
                      <UserOutlined
                        style={{ color: "#fff", fontSize: "16px" }}
                      />
                    }
                    valueStyle={{
                      color: "#fff",
                      fontSize: "18px",
                      fontWeight: "bold",
                    }}
                  />
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "10px",
                      color: "rgba(255,255,255,0.8)",
                    }}
                  >
                    ผู้ใช้ทั้งหมด: {formatNumber(stats.stats.users.total)}
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={4}>
                <Card
                  size="small"
                  style={{
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #13c2c2 0%, #08979c 100%)",
                    border: "none",
                    minHeight: "120px",
                    padding: "16px",
                  }}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "rgba(255,255,255,0.9)",
                          fontSize: "12px",
                        }}
                      >
                        Course ทั้งหมด
                      </span>
                    }
                    value={stats.stats.courses.total}
                    prefix={
                      <BookOutlined
                        style={{ color: "#fff", fontSize: "16px" }}
                      />
                    }
                    valueStyle={{
                      color: "#fff",
                      fontSize: "18px",
                      fontWeight: "bold",
                    }}
                  />
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "10px",
                      color: "rgba(255,255,255,0.8)",
                    }}
                  >
                    เปิดใช้งาน: {stats.stats.courses.published}
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={4}>
                <Card
                  size="small"
                  style={{
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #fa541c 0%, #d4380d 100%)",
                    border: "none",
                    minHeight: "120px",
                    padding: "16px",
                  }}
                >
                  <Statistic
                    title={
                      <span
                        style={{
                          color: "rgba(255,255,255,0.9)",
                          fontSize: "12px",
                        }}
                      >
                        E-book ทั้งหมด
                      </span>
                    }
                    value={stats.stats.ebooks?.total || 0}
                    prefix={
                      <BookOutlined
                        style={{ color: "#fff", fontSize: "16px" }}
                      />
                    }
                    valueStyle={{
                      color: "#fff",
                      fontSize: "18px",
                      fontWeight: "bold",
                    }}
                  />
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "10px",
                      color: "rgba(255,255,255,0.8)",
                    }}
                  >
                    เปิดใช้งาน: {stats.stats.ebooks?.published || 0}
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={8} lg={4}>
                <Card
                  size="small"
                  style={{
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #eb2f96 0%, #c41d7f 100%)",
                    border: "none",
                    padding: "20px",
                  }}
                >
                  <Statistic
                    title={
                      <span style={{ color: "rgba(255,255,255,0.9)" }}>
                        การลงทะเบียนใหม่
                      </span>
                    }
                    value={stats.stats.enrollments.total}
                    valueStyle={{
                      color: "#fff",
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  />
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.8)",
                    }}
                  >
                    ใช้งานอยู่: {stats.stats.enrollments.active}
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        )}

        {/* Detailed View */}
        {showDetailedView && (
          <Card
            style={{
              borderRadius: "16px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              marginBottom: "32px",
              padding: "0",
            }}
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              size="large"
              style={{ padding: "0 24px" }}
              tabBarStyle={{
                borderBottom: "2px solid #f0f0f0",
                marginBottom: "0",
              }}
            >
              <TabPane
                tab={
                  <Space>
                    <DashboardOutlined />
                    <span>ภาพรวม</span>
                  </Space>
                }
                key="overview"
              >
                <div style={{ padding: "24px" }}>
                  <Row gutter={[24, 24]}>
                    <Col xs={24} lg={12}>
                      <Card
                        title={
                          <Space>
                            <BookOutlined style={{ color: "#1890ff" }} />
                            <span>สถิติ Course</span>
                          </Space>
                        }
                        size="small"
                        style={{ borderRadius: "12px" }}
                      >
                        <Row gutter={[16, 16]}>
                          <Col span={12}>
                            <Statistic
                              title="รายได้ Course"
                              value={courseSales?.summary?.totalRevenue || 0}
                              suffix="บาท"
                              valueStyle={{
                                fontSize: "16px",
                                color: "#1890ff",
                              }}
                            />
                          </Col>
                          <Col span={12}>
                            <Statistic
                              title="ออร์เดอร์ Course"
                              value={courseSales?.summary?.totalOrders || 0}
                              valueStyle={{
                                fontSize: "16px",
                                color: "#52c41a",
                              }}
                            />
                          </Col>
                          <Col span={12}>
                            <Statistic
                              title="Course ที่ขายได้"
                              value={courseSales?.summary?.totalCourses || 0}
                              valueStyle={{
                                fontSize: "16px",
                                color: "#722ed1",
                              }}
                            />
                          </Col>
                          <Col span={12}>
                            <Statistic
                              title="ค่าเฉลี่ย/ออร์เดอร์"
                              value={
                                courseSales?.summary?.averageOrderValue || 0
                              }
                              precision={0}
                              suffix="บาท"
                              valueStyle={{
                                fontSize: "16px",
                                color: "#fa8c16",
                              }}
                            />
                          </Col>
                        </Row>
                      </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                      <Card
                        title={
                          <Space>
                            <BookOutlined style={{ color: "#fa541c" }} />
                            <span>สถิติ E-book</span>
                          </Space>
                        }
                        size="small"
                        style={{ borderRadius: "12px" }}
                      >
                        <Row gutter={[16, 16]}>
                          <Col span={12}>
                            <Statistic
                              title="รายได้ E-book"
                              value={0}
                              suffix="บาท"
                              valueStyle={{
                                fontSize: "16px",
                                color: "#fa541c",
                              }}
                            />
                          </Col>
                          <Col span={12}>
                            <Statistic
                              title="ออร์เดอร์ E-book"
                              value={0}
                              valueStyle={{
                                fontSize: "16px",
                                color: "#52c41a",
                              }}
                            />
                          </Col>
                          <Col span={12}>
                            <Statistic
                              title="E-book ที่ขายได้"
                              value={0}
                              valueStyle={{
                                fontSize: "16px",
                                color: "#13c2c2",
                              }}
                            />
                          </Col>
                          <Col span={12}>
                            <Statistic
                              title="ดาวน์โหลดทั้งหมด"
                              value={0}
                              valueStyle={{
                                fontSize: "16px",
                                color: "#eb2f96",
                              }}
                            />
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              <TabPane
                tab={
                  <Space>
                    <BookOutlined />
                    <span>Course รายละเอียด</span>
                  </Space>
                }
                key="courses"
              >
                <div style={{ padding: "24px" }}>
                  <CourseSalesDetail />
                </div>
              </TabPane>

              <TabPane
                tab={
                  <Space>
                    <BookOutlined />
                    <span>E-book รายละเอียด</span>
                  </Space>
                }
                key="ebooks"
              >
                <div style={{ padding: "24px" }}>
                  <EbookSalesDetail />
                </div>
              </TabPane>
            </Tabs>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
