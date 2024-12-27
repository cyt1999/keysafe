import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('address');

    if (!walletAddress) {
      return NextResponse.json(
        { error: '缺少钱包地址' },
        { status: 400 }
      );
    }

    // 获取用户
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 获取用户的所有密码条目
    const passwordEntries = await prisma.passwordEntry.findMany({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        encryptedData: true,
        version: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // 转换为前端需要的格式
    const formattedEntries = passwordEntries.map((entry: any) => ({
      ...entry,
      encryptedData: JSON.parse(entry.encryptedData)
    }));

    return NextResponse.json(formattedEntries);
  } catch (error) {
    console.error('获取密码列表失败:', error);
    return NextResponse.json(
      { error: '获取密码列表失败' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 