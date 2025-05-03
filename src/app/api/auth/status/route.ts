/* eslint-disable @typescript-eslint/no-explicit-any */
import { decodedAuthToken } from "@/common/utils/auth";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const payload = await decodedAuthToken() as any;

    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid token payload');
    }

    const responseData = {
      isAuthenticated: true,
      userId: payload.sub,
      username: payload.username,
      expiresSoon: payload.exp
        ? (payload.exp * 1000 - Date.now()) < (15 * 60 * 1000)
        : false
    };

    return NextResponse.json({
      success: true,
      data: responseData
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