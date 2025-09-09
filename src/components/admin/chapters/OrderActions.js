"use client";
import React from "react";
import { Button, Space } from "antd";
import {
  SaveOutlined,
  UndoOutlined,
  ReloadOutlined,
  WarningFilled,
  DragOutlined,
} from "@ant-design/icons";

export default function OrderActions({
  hasUnsavedChanges,
  savingOrder,
  initialOrderLength,
  onSaveOrder,
  onCancelOrder,
  onResetOrder,
}) {
  return (
    <div>
      <Space wrap>
        {/* ปุ่มบันทึกและยกเลิกการเปลี่ยนแปลงลำดับ */}
        {hasUnsavedChanges && (
          <>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={onSaveOrder}
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
              onClick={onCancelOrder}
              style={{ borderRadius: "6px" }}
            >
              ยกเลิก
            </Button>
          </>
        )}

        <Button
          icon={<ReloadOutlined />}
          onClick={onResetOrder}
          disabled={initialOrderLength === 0 || hasUnsavedChanges}
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
              <DragOutlined /> <strong>วิธีใช้:</strong> คลิกและลากที่กล่องสีฟ้า
              เพื่อเรียงลำดับ Chapter (ลากอย่างน้อย 8px)
            </>
          )}
        </div>
      </div>
    </div>
  );
}
