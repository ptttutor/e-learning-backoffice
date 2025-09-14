"use client";
import React from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  BookOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  OrderedListOutlined,
  HolderOutlined,
} from "@ant-design/icons";
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const { Text } = Typography;

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

// Sortable Row Component
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
        <Tag color="blue">Chapter {item.order}</Tag>
      </div>
    </div>
  </div>
);

export default function ChapterTable({
  chapters,
  allChapters, // สำหรับ drag & drop
  loading,
  activeId,
  sensors,
  onEdit,
  onDelete,
  onManageContent,
  onDragStart,
  onDragEnd,
  onDragCancel,
  disabled = false,
}) {
  const columns = [
    {
      title: "",
      key: "sort",
      render: () => null,
      width: 80,
      align: "center",
    },
    {
      title: "ชื่อ Chapter",
      dataIndex: "title",
      key: "title",
      render: (title) => (
        <Space>
          <BookOutlined style={{ color: "#1890ff" }} />
          <Text strong>{title}</Text>
        </Space>
      ),
      width: 300,
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
            onClick={() => onEdit(record)}
            style={{ borderRadius: "6px" }}
            disabled={disabled}
          >
            แก้ไข
          </Button>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => onDelete(record)}
            style={{ borderRadius: "6px" }}
            disabled={disabled}
          >
            ลบ
          </Button>
          <Button
            icon={<FileTextOutlined />}
            size="small"
            type="link"
            onClick={() => onManageContent(record)}
            style={{ borderRadius: "6px" }}
            disabled={disabled}
          >
            จัดการเนื้อหา
          </Button>
        </Space>
      ),
      width: 280,
      fixed: "right",
    },
  ];

  const activeItem = (allChapters || chapters).find((item) => item.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <SortableContext
        items={(allChapters || chapters).map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <Table
          columns={columns}
          dataSource={allChapters || chapters}
          rowKey="id"
          loading={loading}
          scroll={{ x: 800 }}
          pagination={allChapters ? false : {
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
          }}
          size="middle"
          components={{
            body: {
              row: SortableRow,
            },
          }}
          locale={{
            emptyText: allChapters && allChapters.length > 0 && chapters.length === 0 
              ? "ไม่พบ Chapter ที่ตรงกับเงื่อนไขการค้นหา" 
              : "ยังไม่มี Chapter ในคอร์สนี้",
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
  );
}
