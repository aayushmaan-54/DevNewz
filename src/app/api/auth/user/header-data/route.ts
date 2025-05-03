/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/common/lib/db";
import { decodedAuthToken } from "@/common/utils/auth";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const { userId } = await decodedAuthToken() as any;

    const user = await db.user.findUnique({ 
      where: { id: userId },
      select: {  karma: true, username: true }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User Karma not found",
        data: null,
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "User Karma fetched successfully",
      data: user,
    });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({
        success: false,
        message: err.message,
        data: null
      }, { status: 401 });
    }
    return NextResponse.json({
      success: false,
      message: 'Unknown error occurred',
      data: null
    }, { status: 500 });
  }
}