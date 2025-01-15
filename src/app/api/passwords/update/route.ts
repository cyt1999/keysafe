import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

/**
 * 更新密码条目的API处理函数
 */
export async function PUT(request: Request) {
  try {
    const { id, encryptedData, walletAddress } = await request.json();

    if (!id || !encryptedData || !walletAddress) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 验证用户存在
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 验证密码条目存在且属于该用户
    const existingEntry = await prisma.passwordEntry.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!existingEntry) {
      return NextResponse.json({ error: '密码条目不存在或无权访问' }, { status: 404 });
    }

    // 更新密码条目
    const updatedEntry = await prisma.passwordEntry.update({
      where: { id },
      data: {
        encryptedData: JSON.stringify(encryptedData),
        version: existingEntry.version + 1
      }
    });

    return NextResponse.json({
      id: updatedEntry.id,
      updatedAt: updatedEntry.updatedAt
    });
  } catch (error) {
    console.error('更新密码条目失败:', error);
    return NextResponse.json({ error: '更新密码条目失败' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 