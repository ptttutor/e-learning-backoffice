"use client";
import React, { useState } from "react";
import { Modal, Spin, Alert } from "antd";
import { FileOutlined } from "@ant-design/icons";
import Image from "next/image";

export default function FileViewerModal({ open, file, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!file) return null;

  const fileType = file.fileType || file.fileName.split('.').pop().toLowerCase();
  const fileName = file.fileName;

  const renderViewer = () => {
    // PDF Files
    if (fileType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
      return (
        <iframe
          src={`https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(file.filePath)}`}
          width="100%"
          height="600px"
          style={{ border: 'none' }}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
        />
      );
    }
    
    // Word Documents
    if (fileType.includes('word') || fileType.includes('document') || 
        fileName.toLowerCase().endsWith('.doc') || 
        fileName.toLowerCase().endsWith('.docx')) {
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.filePath)}`}
          width="100%"
          height="600px"
          style={{ border: 'none' }}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
        />
      );
    }
    
    // Images
    if (fileType.includes('image') || 
        ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileName.split('.').pop().toLowerCase())) {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Image
            src={file.filePath}
            alt={fileName}
            width={800}
            height={600}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '600px',
              objectFit: 'contain'
            }}
            onLoad={() => setLoading(false)}
            onError={() => {
              setError(true);
              setLoading(false);
            }}
          />
        </div>
      );
    }
    
    // Other files - fallback to Google Viewer
    return (
      <iframe
        src={`https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(file.filePath)}`}
        width="100%"
        height="600px"
        style={{ border: 'none' }}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
      />
    );
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileOutlined />
          <span>{fileName}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width="90vw"
      style={{ top: 20 }}
      // bodyStyle={{ padding: 0 }}
    >
      {loading && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px' 
        }}>
          <Spin size="large" />
        </div>
      )}
      
      {error && !loading && (
        <div style={{ padding: '20px' }}>
          <Alert
            message="ไม่สามารถแสดงไฟล์ได้"
            description={
              <div>
                <p>ไฟล์นี้ไม่สามารถแสดงในเบราว์เซอร์ได้ กรุณา</p>
                <a 
                  href={file.filePath} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'underline' }}
                >
                  คลิกที่นี่เพื่อดาวน์โหลดไฟล์
                </a>
              </div>
            }
            type="warning"
            showIcon
          />
        </div>
      )}
      
      {!error && renderViewer()}
    </Modal>
  );
}
