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
  FileTextOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  FilePdfOutlined,
  LinkOutlined,
  QuestionCircleOutlined,
  FileOutlined,
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
        <Tag color="blue">{item.contentType}</Tag>
      </div>
    </div>
  </div>
);

export default function ContentTable({
  contents, // filtered contents for display
  allContents, // all contents for drag & drop
  loading,
  activeId,
  sensors,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragCancel,
  disabled = false,
}) {
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
      render: () => null,
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
        </Space>
      ),
      width: 180,
      fixed: "right",
    },
  ];

  const activeItem = allContents.find((item) => item.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <SortableContext
        items={allContents.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <Table
          columns={columns}
          dataSource={allContents || contents}
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
  );
}
