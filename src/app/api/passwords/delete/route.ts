import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

/**
 * 删除密码条目的API处理函数
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const address = searchParams.get('address');

    if (!id || !address) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 验证用户存在
    const user = await prisma.user.findUnique({
      where: { walletAddress: address.toLowerCase() }
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

    // 删除密码条目
    await prisma.passwordEntry.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除密码条目失败:', error);
    return NextResponse.json({ error: '删除密码条目失败' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 