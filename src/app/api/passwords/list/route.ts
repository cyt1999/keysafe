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

    // 获取用户的所有密码条目
    const passwordEntries = await prisma.passwordEntry.findMany({
      where: {
        user: {
          walletAddress: walletAddress.toLowerCase()
        }
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

    // 将 encryptedData 从 JSON 字符串转换为对象
    const formattedEntries = passwordEntries.map(entry => ({
      ...entry,
      encryptedData: JSON.parse(entry.encryptedData)
    }));

    return NextResponse.json(formattedEntries);
  } catch (error) {
    console.error('获���密码列表失败:', error);
    return NextResponse.json(
      { error: '获取密码列表失败' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 