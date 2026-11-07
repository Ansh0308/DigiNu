import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import type { ApiResponse } from "@/types/validation";

/**
 * Return a successful JSON API response
 */
export function apiSuccess<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      error: null,
    },
    { status }
  );
}

/**
 * Return an error JSON API response
 */
export function apiError(
  code: string,
  message: string,
  status = 400,
  details?: unknown
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      data: null,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status }
  );
}

/**
 * Common 401 Unauthorized response
 */
export function apiUnauthorized(
  message = "Authentication required to perform this action"
): NextResponse<ApiResponse<null>> {
  return apiError("UNAUTHORIZED", message, 401);
}

/**
 * Common 422 Validation Error response
 */
export function apiValidationError(
  error: ZodError
): NextResponse<ApiResponse<null>> {
  return apiError(
    "VALIDATION_ERROR",
    "Invalid input parameters provided",
    422,
    error.flatten().fieldErrors
  );
}

/**
 * Common 404 Not Found response
 */
export function apiNotFound(
  resource = "Resource"
): NextResponse<ApiResponse<null>> {
  return apiError("NOT_FOUND", `${resource} not found`, 404);
}

