// Login component styling configuration
export const loginStyles = {
  colors: {
    primary: "#1890ff",
    primaryDark: "#1677ff",
    background: "#ffffff",
    text: {
      primary: "#1f2937",
      secondary: "#6b7280",
      muted: "#9ca3af",
      placeholder: "#6c757d"
    },
    border: "#e5e7eb",
    placeholderBg: "#f8f9fa",
    placeholderBorder: "#dee2e6",
    error: "#ff4d4f"
  },
  
  breakpoints: {
    mobile: 768,
    smallMobile: 480,
    tablet: 1024
  },
  
  spacing: {
    desktop: "40px",
    tablet: "20px",
    mobile: "20px",
    smallMobile: "16px"
  },
  
  borderRadius: {
    card: "20px",
    cardMobile: "16px",
    input: "12px",
    placeholder: "20px"
  },
  
  shadows: {
    card: "0 10px 30px rgba(0, 0, 0, 0.1)",
    button: "0 4px 12px rgba(24, 144, 255, 0.3)"
  },
  
  gradients: {
    background: "linear-gradient(135deg, #1890ff 0%, #1677ff 100%)",
    button: "linear-gradient(135deg, #1890ff 0%, #1677ff 100%)"
  },
  
  typography: {
    title: {
      desktop: "28px",
      mobile: "24px"
    },
    text: {
      desktop: "16px",
      mobile: "14px"
    },
    small: {
      desktop: "14px",
      mobile: "12px"
    }
  },
  
  dimensions: {
    rightSection: {
      desktop: "500px",
      tablet: "400px"
    },
    placeholder: {
      desktop: { width: "400px", height: "300px" },
      tablet: { width: "300px", height: "220px" },
      mobile: { width: "250px", height: "180px" },
      smallMobile: { width: "200px", height: "150px" }
    },
    card: {
      desktop: "380px",
      tablet: "320px"
    },
    input: {
      desktop: "48px",
      mobile: "44px"
    },
    button: {
      desktop: "50px",
      mobile: "46px"
    }
  }
};

export default loginStyles;
