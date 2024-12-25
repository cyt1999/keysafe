import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { 
      walletAddress,
      masterKeyHash,  // 主密钥哈希
      salt           // PBKDF2 盐值
    } = await request.json();

    // 检查参数
    if (!walletAddress || !masterKeyHash || !salt) {
      console.error('Missing parameters:', { walletAddress, masterKeyHash, salt });
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 创建或更新用户
    const user = await prisma.user.upsert({
      where: { 
        walletAddress: walletAddress.toLowerCase() 
      },
      update: {
        masterKeyHash,
        salt,
        lastLoginAt: new Date()
      },
      create: {
        walletAddress: walletAddress.toLowerCase(),
        masterKeyHash,
        salt,
        preferences: {},
        lastLoginAt: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('创建用户失败:', error);
    return NextResponse.json(
      { error: '创建用户失败' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 