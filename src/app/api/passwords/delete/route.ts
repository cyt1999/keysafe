import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const walletAddress = searchParams.get('address');

    if (!id || !walletAddress) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 验证密码条目所有权
    const existingEntry = await prisma.passwordEntry.findFirst({
      where: {
        id,
        user: {
          walletAddress: walletAddress.toLowerCase()
        }
      }
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: '密码条目不存在或无权访问' },
        { status: 404 }
      );
    }

    // 删除密码条目
    await prisma.passwordEntry.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除密码条目失败:', error);
    return NextResponse.json(
      { error: '删除密���条目失败' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 