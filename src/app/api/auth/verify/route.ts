import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * 验证用户的API处理函数
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: '缺少钱包地址' }, { status: 400 });
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { walletAddress: address.toLowerCase() },
      select: {
        id: true,
        masterKeyHash: true,
        salt: true,
        avatar: true,
        nickname: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    return NextResponse.json({
      id: user.id,
      masterKeyHash: user.masterKeyHash,
      salt: user.salt,
      avatar: user.avatar,
      nickname: user.nickname
    });
  } catch (error) {
    console.error('验证用户失败:', error);
    return NextResponse.json({ error: '验证用户失败' }, { status: 500 });
  }
}