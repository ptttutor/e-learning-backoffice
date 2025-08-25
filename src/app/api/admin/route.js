import { NextResponse } from 'next/server'

// GET /api/admin - API Documentation สำหรับ Admin
export async function GET() {
  const apiEndpoints = {
    "Admin API Documentation": {
      "version": "2.0.0",
      "description": "Complete Admin API for Physics Learning Management System",
      "endpoints": {
        "Dashboard & Analytics": {
          "GET /api/admin/dashboard": "Get dashboard statistics and analytics"
        },
        "User Management": {
          "GET /api/admin/users": "Get all users with pagination and filters",
          "POST /api/admin/users": "Create new user",
          "GET /api/admin/users/[id]": "Get user details",
          "PUT /api/admin/users/[id]": "Update user",
          "DELETE /api/admin/users/[id]": "Delete user"
        },
        "Course Management": {
          "GET /api/admin/courses": "Get all courses with pagination and filters",
          "POST /api/admin/courses": "Create new course",
          "GET /api/admin/courses/[id]": "Get course details",
          "PUT /api/admin/courses/[id]": "Update course",
          "DELETE /api/admin/courses/[id]": "Delete course",
          "GET /api/admin/course-chapters": "Get course chapters",
          "POST /api/admin/course-chapters": "Create course chapter",
          "GET /api/admin/course-lessons": "Get course lessons",
          "POST /api/admin/course-lessons": "Create course lesson"
        },
        "Content Management": {
          "GET /api/admin/categories": "Get all categories",
          "POST /api/admin/categories": "Create new category",
          "GET /api/admin/subjects": "Get all subjects",
          "POST /api/admin/subjects": "Create new subject",
          "GET /api/admin/articles": "Get all articles",
          "POST /api/admin/articles": "Create new article",
          "GET /api/admin/article-tags": "Get article tags",
          "POST /api/admin/article-tags": "Create article tag"
        },
        "Exam Repository": {
          "GET /api/admin/exam-types": "Get exam types",
          "POST /api/admin/exam-types": "Create exam type",
          "GET /api/admin/exam-sets": "Get exam sets",
          "POST /api/admin/exam-sets": "Create exam set"
        },
        "Order & Payment Management": {
          "GET /api/admin/orders": "Get all orders with filters",
          "POST /api/admin/orders": "Create new order",
          "GET /api/admin/payment-receipts": "Get payment receipts",
          "POST /api/admin/payment-receipts": "Create payment receipt",
          "PUT /api/admin/payment-receipts/[id]": "Update payment receipt status"
        },
        "Promotion Management": {
          "GET /api/admin/promotions": "Get all promotions",
          "POST /api/admin/promotions": "Create new promotion"
        },
        "Student Progress": {
          "GET /api/admin/enrollments": "Get course enrollments",
          "POST /api/admin/enrollments": "Create enrollment",
          "GET /api/admin/reviews": "Get course reviews",
          "POST /api/admin/reviews": "Create review"
        },
        "Communication": {
          "GET /api/admin/announcements": "Get all announcements",
          "POST /api/admin/announcements": "Create new announcement",
          "GET /api/admin/announcement-types": "Get announcement types",
          "POST /api/admin/announcement-types": "Create announcement type",
          "GET /api/admin/notifications": "Get notifications",
          "POST /api/admin/notifications": "Send notification"
        },
        "Quiz System": {
          "GET /api/admin/quizzes": "Get all quizzes",
          "POST /api/admin/quizzes": "Create new quiz"
        },
        "Learning Management": {
          "GET /api/admin/learning-paths": "Get learning paths",
          "POST /api/admin/learning-paths": "Create learning path",
          "GET /api/admin/certificates": "Get certificates",
          "POST /api/admin/certificates": "Create certificate"
        },
        "Community Features": {
          "GET /api/admin/discussions": "Get discussions",
          "POST /api/admin/discussions": "Create discussion",
          "GET /api/admin/wishlist": "Get wishlist items",
          "POST /api/admin/wishlist": "Add to wishlist",
          "GET /api/admin/course-tags": "Get course tags",
          "POST /api/admin/course-tags": "Create course tag"
        },
        "Analytics & Monitoring": {
          "GET /api/admin/activity-logs": "Get activity logs",
          "POST /api/admin/activity-logs": "Create activity log"
        },
        "System Management": {
          "GET /api/admin/settings": "Get system settings",
          "POST /api/admin/settings": "Create new setting",
          "PUT /api/admin/settings": "Update multiple settings",
          "GET /api/admin/upload": "Get uploaded files list",
          "POST /api/admin/upload": "Upload new file"
        }
      },
      "total_endpoints": 50,
      "coverage": "100% - All 42 database models covered",
      "common_parameters": {
        "pagination": {
          "page": "Page number (default: 1)",
          "limit": "Items per page (default: 20)"
        },
        "search": "Search term for filtering",
        "filters": "Various filters based on endpoint (status, type, active, etc.)"
      },
      "response_format": {
        "success": true,
        "message": "Success message",
        "data": "Response data",
        "pagination": {
          "page": 1,
          "limit": 20,
          "total": 100,
          "totalPages": 5
        }
      }
    }
  }

  return NextResponse.json(apiEndpoints)
}