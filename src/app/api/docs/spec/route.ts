import { NextResponse } from "next/server";
import { openApiSpec } from "../../../../modules/docs/swagger.config";

export async function GET() {
  return NextResponse.json(openApiSpec);
}
