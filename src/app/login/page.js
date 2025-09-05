"use client";
import { useState, useEffect, Suspense } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import LoginContainer from "../../components/login/LoginContainer";
import LoginLeftSection from "../../components/login/LoginLeftSection";
import LoginRightSection from "../../components/login/LoginRightSection";

function LoginPageContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const redirectUrl = searchParams.get("redirect");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // ถ้าเป็น admin และมี redirect ไป admin
      if (user.role === 'ADMIN' && redirectUrl && redirectUrl.includes('/admin')) {
        router.push(redirectUrl);
      } else if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push(redirectUrl || "/dashboard");
      }
    }
  }, [isAuthenticated, user, router, redirectUrl]);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError("");

    const result = await login(values.email, values.password);

    if (result.success) {
      // Redirect logic จะถูกจัดการใน useEffect
      // ไม่จำเป็นต้องทำ redirect ที่นี่ เพราะจะทำซ้ำ
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <LoginContainer>
      {({ isMobile, isSmallMobile, isTablet }) => (
        <>
          <LoginLeftSection 
            isMobile={isMobile} 
            isSmallMobile={isSmallMobile} 
          />
          <LoginRightSection 
            error={error}
            setError={setError}
            loading={loading}
            onSubmit={handleSubmit}
            isSmallMobile={isSmallMobile}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        </>
      )}
    </LoginContainer>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
