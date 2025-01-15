import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * 创建新密码条目的API处理函数
 */
export async function POST(request: Request) {
  try {
    const { encryptedData, walletAddress } = await request.json();

    // 验证请求参数
    if (!encryptedData || !walletAddress) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 验证用户存在
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 创建新的密码条目
    const entry = await prisma.passwordEntry.create({
      data: {
        encryptedData: JSON.stringify(encryptedData),  // 将加密数据转换为JSON字符串存储
        version: 1,  // 初始版本号
        userId: user.id  // 关联到用户
      }
    });

    return NextResponse.json({
      id: entry.id,
      createdAt: entry.createdAt
    });
  } catch (error) {
    console.error('创建密码条目失败:', error);
    return NextResponse.json({ error: '创建密码条目失败' }, { status: 500 });
  }
} 