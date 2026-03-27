import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const count = await prisma.booking.count();
    return NextResponse.json({ 
      success: true, 
      message: 'DB connected!', 
      bookingsCount: count,
      dbUrl: process.env.DATABASE_URL?.substring(0, 40) + '...'
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code,
      meta: error.meta
    }, { status: 500 });
  }
}
