import { NextResponse } from "next/server";

export function serializeBigInt<T>(data: T): any {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export class ApiResponse {
  static success<T>(data: T, message?: string, statusCode: number = 200) {
    const time = new Date().toLocaleTimeString("id-ID");
    console.log(`[${time}] ✅ Response ${statusCode}: ${message || "Success"}`);
    const payload = serializeBigInt({
      success: true,
      ...(message ? { message } : {}),
      data,
    });
    return NextResponse.json(payload, { status: statusCode });
  }

  static error(message: string, statusCode: number = 500, errors?: any) {
    const time = new Date().toLocaleTimeString("id-ID");
    console.error(`[${time}] ❌ Response Error ${statusCode}: ${message}`, errors ? JSON.stringify(errors) : "");
    const payload = {
      success: false,
      error: message,
      ...(errors ? { details: errors } : {}),
    };
    return NextResponse.json(payload, { status: statusCode });
  }
}
