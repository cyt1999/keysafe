import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { encryptedData, walletAddress } = await request.json();

    if (!encryptedData || !walletAddress) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 验证用户存在
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 创建密码条目
    const entry = await prisma.passwordEntry.create({
      data: {
        encryptedData: JSON.stringify(encryptedData),
        version: 1,
        userId: user.id
      }
    });

    return NextResponse.json({
      id: entry.id,
      createdAt: entry.createdAt
    });
  } catch (error) {
    console.error('创建密码条目失败:', error);
    return NextResponse.json(
      { error: '创建密码条目失败' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 