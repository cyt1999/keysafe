import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

/**
 * 获取用户密码列表的API处理函数
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    // 验证请求参数
    if (!address) {
      return NextResponse.json({ error: '缺少钱包地址' }, { status: 400 });
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { walletAddress: address.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
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
        updatedAt: 'desc'  // 按更新时间降序排序
      }
    });

    // 转换数据格式
    const formattedEntries = passwordEntries.map(entry => ({
      ...entry,
      encryptedData: JSON.parse(entry.encryptedData)  // 解析存储的JSON字符串
    }));

    return NextResponse.json(formattedEntries);
  } catch (error) {
    console.error('获取密码列表失败:', error);
    return NextResponse.json({ error: '获取密码列表失败' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 