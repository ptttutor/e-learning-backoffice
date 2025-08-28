"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Card,
  Typography,
  Tag,
} from "antd";
import {
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  FilePdfOutlined,
  LinkOutlined,
  QuestionCircleOutlined,
  FileOutlined,
  OrderedListOutlined,
  ArrowLeftOutlined,
  HolderOutlined,
  ReloadOutlined,
  SaveOutlined,
  UndoOutlined,
  WarningFilled,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const { Option } = Select;
const { Title, Text } = Typography;

// Draggable Handle Component
const DragHandle = ({ ...props }) => (
  <div
    {...props}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "8px",
      borderRadius: "6px",
      backgroundColor: "#e6f7ff",
      border: "2px solid #1890ff",
      cursor: "grab",
      transition: "all 0.2s",
      minHeight: "32px",
      minWidth: "32px",
      touchAction: "none",
      userSelect: "none",
      ...props.style,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = "#1890ff";
      e.currentTarget.style.borderColor = "#1890ff";
      e.currentTarget.style.transform = "scale(1.1)";
      e.currentTarget.style.boxShadow = "0 2px 8px rgba(24, 144, 255, 0.3)";
      e.currentTarget.style.cursor = "grabbing";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = "#e6f7ff";
      e.currentTarget.style.borderColor = "#1890ff";
      e.currentTarget.style.transform = "scale(1)";
      e.currentTarget.style.boxShadow = "none";
      e.currentTarget.style.cursor = "grab";
    }}
    title="คลิกและลากเพื่อเรียงลำดับ"
  >
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <HolderOutlined
        style={{
          fontSize: "18px",
          color: "#1890ff",
          marginBottom: "2px",
        }}
      />
      <div
        style={{
          fontSize: "10px",
          color: "#666",
          fontWeight: "normal",
        }}
      >
        ลาก
      </div>
    </div>
  </div>
);

// Sortable Row Component - ปรับปรุงใหม่
const SortableRow = ({ children, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props["data-row-key"],
  });

  const style = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? "#f0f0f0" : "transparent",
    position: "relative",
    zIndex: isDragging ? 999 : "auto",
  };

  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes}>
      {React.Children.map(children, (child, index) => {
        if (child.key === "sort") {
          return React.cloneElement(child, {
            children: <DragHandle {...listeners} />,
          });
        }
        return child;
      })}
    </tr>
  );
};

// Row Item for Drag Overlay
const DragOverlayRow = ({ item }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      padding: "12px",
      backgroundColor: "#fff",
      borderRadius: "6px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      border: "1px solid #d9d9d9",
      minWidth: "300px",
    }}
  >
    <DragHandle style={{ marginRight: "12px" }} />
    <div>
      <Text strong>{item.title}</Text>
      <div>
        <Tag color="blue">{item.contentType}</Tag>
      </div>
    </div>
  </div>
);

export default function AdminContentPage() {
  const { chapterId } = useParams();
  const router = useRouter();
  const [contents, setContents] = useState([]);
  const [initialOrder, setInitialOrder] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [activeId, setActiveId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // ปรับปรุง sensors สำหรับการลากที่ดีขึ้น
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // ต้องลากอย่างน้อย 8px ถึงจะเริ่มการลาก
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch contents
  const fetchContents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/contents?chapterId=${chapterId}`);
      const data = await res.json();
      // เรียงลำดับตาม order
      const sortedContents = (data.data || []).sort(
        (a, b) => a.order - b.order
      );
      setContents(sortedContents);

      // เก็บ initial order เมื่อโหลดครั้งแรก
      const initOrder = sortedContents.map((item) => ({
        id: item.id,
        order: item.order,
      }));
      setInitialOrder(initOrder);
      setHasUnsavedChanges(false); // รีเซ็ตสถานะการเปลี่ยนแปลง
    } catch (e) {
      message.error("โหลดข้อมูลเนื้อหาไม่สำเร็จ");
    }
    setLoading(false);
  }, [chapterId]);
  initialOrder;
  useEffect(() => {
    console.log("initialOrder :>> ", initialOrder);
  }, [initialOrder]);
  useEffect(() => {
    if (chapterId) fetchContents();
  }, [chapterId, fetchContents]);

  // บันทึกการเปลี่ยนแปลงลำดับ
  const saveOrderChanges = async () => {
    setSavingOrder(true);
    try {
      const updatePromises = contents.map((content) =>
        fetch(`/api/admin/contents/${content.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: content.title,
            contentType: content.contentType,
            contentUrl: content.contentUrl,
            order: content.order,
          }),
        })
      );

      await Promise.all(updatePromises);

      // อัพเดต initial order ให้เป็นลำดับปัจจุบัน
      const newInitOrder = contents.map((item) => ({
        id: item.id,
        order: item.order,
      }));
      setInitialOrder(newInitOrder);
      setHasUnsavedChanges(false);

      message.success("บันทึกการเปลี่ยนแปลงลำดับสำเร็จ");
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการบันทึกลำดับ");
    }
    setSavingOrder(false);
  };

  // ยกเลิกการเปลี่ยนแปลงลำดับ
  const cancelOrderChanges = () => {
    if (initialOrder.length === 0) return;

    // เรียงลำดับ contents ตาม initial order
    const resetContents = [...contents]
      .sort((a, b) => {
        const aInitOrder =
          initialOrder.find((item) => item.id === a.id)?.order || 0;
        const bInitOrder =
          initialOrder.find((item) => item.id === b.id)?.order || 0;
        return aInitOrder - bInitOrder;
      })
      .map((content) => {
        const originalOrder =
          initialOrder.find((item) => item.id === content.id)?.order ||
          content.order;
        return { ...content, order: originalOrder };
      });

    setContents(resetContents);
    setHasUnsavedChanges(false);
    message.info("ยกเลิกการเปลี่ยนแปลงลำดับ");
  };

  // Reset order กลับไปเป็นค่าเริ่มต้น
  const resetOrder = async () => {
    if (initialOrder.length === 0) return;

    try {
      // เรียงลำดับ contents ตาม initial order
      const resetContents = [...contents].sort((a, b) => {
        const aInitOrder =
          initialOrder.find((item) => item.id === a.id)?.order || 0;
        const bInitOrder =
          initialOrder.find((item) => item.id === b.id)?.order || 0;
        return aInitOrder - bInitOrder;
      });

      setContents(resetContents);

      // อัพเดทในฐานข้อมูล
      const updatePromises = initialOrder.map((item) => {
        const content = contents.find((c) => c.id === item.id);
        return fetch(`/api/admin/contents/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: content.title,
            contentType: content.contentType,
            contentUrl: content.contentUrl,
            order: item.order,
          }),
        });
      });

      await Promise.all(updatePromises);
      setHasUnsavedChanges(false);
      message.success("รีเซ็ตลำดับกลับไปเป็นค่าเริ่มต้นสำเร็จ");
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการรีเซ็ตลำดับ");
      fetchContents(); // Reload data on error
    }
  };

  // Handle drag start
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // Handle drag end - ไม่บันทึกทันที แต่แสดงปุ่มยืนยัน
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = contents.findIndex((item) => item.id === active.id);
    const newIndex = contents.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // อัพเดท state ทันที พร้อมกับอัพเดตเลขลำดับในตาราง
    const newContents = arrayMove(contents, oldIndex, newIndex).map(
      (content, index) => ({
        ...content,
        order: index + 1, // อัพเดตเลขลำดับให้ตรงกับตำแหน่งใหม่
      })
    );

    setContents(newContents);
    setHasUnsavedChanges(true); // แสดงว่ามีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
  };

  // Handle drag cancel
  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Create or update content
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      let res;
      if (editing) {
        res = await fetch(`/api/admin/contents/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      } else {
        res = await fetch(`/api/admin/contents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, chapterId }),
        });
      }
      const data = await res.json();
      if (data.success) {
        message.success(editing ? "แก้ไขเนื้อหาสำเร็จ" : "สร้างเนื้อหาสำเร็จ");
        setModalOpen(false);
        setEditing(null);
        form.resetFields();
        fetchContents();
      } else {
        message.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (e) {
      // validation error
    }
  };

  // Delete content
  const handleDelete = async (id) => {
    Modal.confirm({
      title: "ยืนยันการลบเนื้อหา?",
      onOk: async () => {
        const res = await fetch(`/api/admin/contents/${id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.success) {
          message.success("ลบเนื้อหาสำเร็จ");
          fetchContents();
        } else {
          message.error(data.error || "เกิดข้อผิดพลาด");
        }
      },
    });
  };

  // Open modal for create/edit
  const openModal = (record) => {
    setEditing(record || null);
    setModalOpen(true);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
      // ตั้งค่า order เป็นลำดับถัดไป
      const nextOrder =
        contents.length > 0 ? Math.max(...contents.map((c) => c.order)) + 1 : 1;
      form.setFieldsValue({ order: nextOrder });
    }
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case "VIDEO":
        return <PlayCircleOutlined style={{ color: "#ff4d4f" }} />;
      case "PDF":
        return <FilePdfOutlined style={{ color: "#fa541c" }} />;
      case "LINK":
        return <LinkOutlined style={{ color: "#1890ff" }} />;
      case "QUIZ":
        return <QuestionCircleOutlined style={{ color: "#52c41a" }} />;
      case "ASSIGNMENT":
        return <FileOutlined style={{ color: "#722ed1" }} />;
      default:
        return <FileTextOutlined style={{ color: "#8c8c8c" }} />;
    }
  };

  const getContentTypeText = (type) => {
    switch (type) {
      case "VIDEO":
        return "วิดีโอ";
      case "PDF":
        return "PDF";
      case "LINK":
        return "ลิงก์";
      case "QUIZ":
        return "Quiz";
      case "ASSIGNMENT":
        return "Assignment";
      default:
        return type;
    }
  };

  const getContentTypeColor = (type) => {
    switch (type) {
      case "VIDEO":
        return "red";
      case "PDF":
        return "orange";
      case "LINK":
        return "blue";
      case "QUIZ":
        return "green";
      case "ASSIGNMENT":
        return "purple";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "",
      key: "sort",
      render: () => null, // จะถูกแทนที่ด้วย DragHandle ใน SortableRow
      width: 80,
      align: "center",
    },
    {
      title: "ชื่อเนื้อหา",
      dataIndex: "title",
      key: "title",
      render: (title) => (
        <Space>
          <FileTextOutlined style={{ color: "#1890ff" }} />
          <Text strong>{title}</Text>
        </Space>
      ),
      width: 250,
    },
    {
      title: "ประเภท",
      dataIndex: "contentType",
      key: "contentType",
      render: (type) => (
        <Space>
          {getContentTypeIcon(type)}
          <Tag color={getContentTypeColor(type)}>
            {getContentTypeText(type)}
          </Tag>
        </Space>
      ),
      width: 150,
    },
    {
      title: "URL/ไฟล์",
      dataIndex: "contentUrl",
      key: "contentUrl",
      render: (url) => (
        <Text
          style={{
            maxWidth: "200px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "block",
          }}
          title={url}
        >
          {url}
        </Text>
      ),
      width: 220,
    },
    {
      title: "ลำดับ",
      dataIndex: "order",
      key: "order",
      render: (order) => (
        <Space>
          <OrderedListOutlined style={{ color: "#8c8c8c" }} />
          <Tag color="blue">{order}</Tag>
        </Space>
      ),
      width: 120,
    },
    {
      title: "การจัดการ",
      key: "actions",
      render: (_, record) => (
        <Space size={8} wrap>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => openModal(record)}
            style={{ borderRadius: "6px" }}
          >
            แก้ไข
          </Button>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(record.id)}
            style={{ borderRadius: "6px" }}
          >
            ลบ
          </Button>
        </Space>
      ),
      width: 180,
      fixed: "right",
    },
  ];

  // หา item ที่กำลังถูกลาก
  const activeItem = contents.find((item) => item.id === activeId);

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Card style={{ marginBottom: "24px" }}>
        <Space direction="vertical" size={4}>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              style={{ borderRadius: "6px" }}
            >
              กลับ
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              <FileTextOutlined style={{ marginRight: "8px" }} />
              จัดการเนื้อหา
            </Title>
          </Space>
          <Text type="secondary">สร้างและจัดการเนื้อหาใน Chapter</Text>
        </Space>
      </Card>

      <Card>
        <div style={{ marginBottom: "16px" }}>
          <Space wrap>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal(null)}
              style={{ borderRadius: "6px" }}
            >
              สร้างเนื้อหาใหม่
            </Button>

            {/* ปุ่มบันทึกและยกเลิกการเปลี่ยนแปลงลำดับ */}
            {hasUnsavedChanges && (
              <>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={saveOrderChanges}
                  loading={savingOrder}
                  style={{
                    borderRadius: "6px",
                    backgroundColor: "#52c41a",
                    borderColor: "#52c41a",
                  }}
                >
                  บันทึกการเปลี่ยนแปลงลำดับ
                </Button>
                <Button
                  icon={<UndoOutlined />}
                  onClick={cancelOrderChanges}
                  style={{ borderRadius: "6px" }}
                >
                  ยกเลิก
                </Button>
              </>
            )}

            <Button
              icon={<ReloadOutlined />}
              onClick={resetOrder}
              disabled={initialOrder.length === 0 || hasUnsavedChanges}
              style={{ borderRadius: "6px" }}
              title="รีเซ็ตลำดับกลับไปเป็นค่าเริ่มต้น"
            >
              รีเซ็ตลำดับ
            </Button>
          </Space>

          <div style={{ marginTop: "12px" }}>
            <div
              style={{
                padding: "8px 12px",
                backgroundColor: hasUnsavedChanges ? "#fff2e8" : "#fff7e6",
                border: `1px solid ${
                  hasUnsavedChanges ? "#ffbb96" : "#ffd591"
                }`,
                borderRadius: "6px",
                fontSize: "14px",
                color: hasUnsavedChanges ? "#d4380d" : "#d46b08",
              }}
            >
              {hasUnsavedChanges ? (
                <>
                  <WarningFilled />{" "}
                  <strong>มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก!</strong> กรุณาคลิก
                  บันทึกการเปลี่ยนแปลงลำดับ เพื่อยืนยัน
                </>
              ) : (
                <>
                  🖱️ <strong>วิธีใช้:</strong> คลิกและลากที่กล่องสีฟ้า
                  เพื่อเรียงลำดับเนื้อหา (ลากอย่างน้อย 8px)
                </>
              )}
            </div>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={contents.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <Table
              columns={columns}
              dataSource={contents}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1000 }}
              pagination={false}
              size="middle"
              components={{
                body: {
                  row: SortableRow,
                },
              }}
            />
          </SortableContext>

          <DragOverlay
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: {
                  active: {
                    opacity: "0.5",
                  },
                },
              }),
            }}
          >
            {activeId ? <DragOverlayRow item={activeItem} /> : null}
          </DragOverlay>
        </DndContext>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={
          <Space>
            {editing ? <EditOutlined /> : <PlusOutlined />}
            <Text strong>{editing ? "แก้ไขเนื้อหา" : "สร้างเนื้อหาใหม่"}</Text>
          </Space>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleOk}
          preserve={false}
        >
          <Form.Item
            name="title"
            label="ชื่อเนื้อหา"
            rules={[{ required: true, message: "กรุณากรอกชื่อเนื้อหา" }]}
          >
            <Input placeholder="ใส่ชื่อเนื้อหา" />
          </Form.Item>

          <Form.Item
            name="contentType"
            label="ประเภท"
            rules={[{ required: true, message: "กรุณาเลือกประเภทเนื้อหา" }]}
          >
            <Select placeholder="เลือกประเภทเนื้อหา">
              <Option value="VIDEO">
                <Space>
                  <PlayCircleOutlined style={{ color: "#ff4d4f" }} />
                  วิดีโอ
                </Space>
              </Option>
              <Option value="PDF">
                <Space>
                  <FilePdfOutlined style={{ color: "#fa541c" }} />
                  PDF
                </Space>
              </Option>
              <Option value="LINK">
                <Space>
                  <LinkOutlined style={{ color: "#1890ff" }} />
                  ลิงก์
                </Space>
              </Option>
              <Option value="QUIZ">
                <Space>
                  <QuestionCircleOutlined style={{ color: "#52c41a" }} />
                  Quiz
                </Space>
              </Option>
              <Option value="ASSIGNMENT">
                <Space>
                  <FileOutlined style={{ color: "#722ed1" }} />
                  Assignment
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="contentUrl"
            label="URL/ไฟล์"
            rules={[{ required: true, message: "กรุณากรอก URL หรือไฟล์" }]}
          >
            <Input placeholder="ใส่ URL หรือ path ของไฟล์" />
          </Form.Item>

          <Form.Item
            name="order"
            label="ลำดับ"
            rules={[
              { required: true, message: "กรุณากรอกลำดับ" },
              { type: "number", min: 1, message: "ลำดับต้องมากกว่า 0" },
            ]}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="ลำดับของเนื้อหา"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={editing ? <EditOutlined /> : <PlusOutlined />}
                style={{ borderRadius: "6px" }}
              >
                {editing ? "อัพเดท" : "สร้าง"}
              </Button>
              <Button
                onClick={() => {
                  setModalOpen(false);
                  setEditing(null);
                  form.resetFields();
                }}
                style={{ borderRadius: "6px" }}
              >
                ยกเลิก
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
