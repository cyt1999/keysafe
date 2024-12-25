import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: '缺少钱包地址' },
        { status: 400 }
      );
    }

    // 获取用户
    const user = await prisma.user.findUnique({
      where: { walletAddress: address.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 返回验证数据
    return NextResponse.json({
      masterKeyHash: user.masterKeyHash,
      salt: user.salt
    });
  } catch (error) {
    console.error('获取验证数据失败:', error);
    return NextResponse.json(
      { error: '获取验证数据失败' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 