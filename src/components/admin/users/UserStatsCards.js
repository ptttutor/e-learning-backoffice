import { Card, Row, Col, Statistic, Skeleton } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CrownOutlined,
} from "@ant-design/icons";

export default function UserStatsCards({ stats, loading }) {
  if (loading) {
    return (
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        {[...Array(4)].map((_, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Skeleton loading={true} active />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  const statCards = [
    {
      title: "ผู้ใช้งานทั้งหมด",
      value: stats.total || 0,
      icon: <UserOutlined style={{ fontSize: "24px", color: "#1890ff" }} />,
      color: "#1890ff",
      bgColor: "#f0f9ff",
    },
    {
      title: "นักเรียน",
      value: stats.students || 0,
      icon: <TeamOutlined style={{ fontSize: "24px", color: "#52c41a" }} />,
      color: "#52c41a",
      bgColor: "#f6ffed",
    },
    {
      title: "ผู้สอน",
      value: stats.instructors || 0,
      icon: <BookOutlined style={{ fontSize: "24px", color: "#fa8c16" }} />,
      color: "#fa8c16",
      bgColor: "#fff7e6",
    },
    {
      title: "ผู้ดูแลระบบ",
      value: stats.admins || 0,
      icon: <CrownOutlined style={{ fontSize: "24px", color: "#eb2f96" }} />,
      color: "#eb2f96",
      bgColor: "#fff0f6",
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
      {statCards.map((stat, index) => (
        <Col xs={24} sm={12} lg={6} key={index}>
          <Card
            style={{
              background: stat.bgColor,
              border: `1px solid ${stat.color}20`,
            }}
            // bodyStyle={{ padding: "20px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  background: `${stat.color}15`,
                  padding: "12px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {stat.icon}
              </div>
              <div style={{ flex: 1 }}>
                <Statistic
                  title={
                    <span style={{ fontSize: "14px", color: "#666" }}>
                      {stat.title}
                    </span>
                  }
                  value={stat.value}
                  valueStyle={{
                    color: stat.color,
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                />
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
