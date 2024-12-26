import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generatePixelAvatar, svgToBase64 } from '@/app/utils/avatarGenerator';

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

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '用户已存在' },
        { status: 409 }
      );
    }

    // 生成用户头像
    const avatarSvg = generatePixelAvatar();
    const avatarBase64 = svgToBase64(avatarSvg);

    // 创建新用户
    const user = await prisma.user.create({
      data: {
        walletAddress: walletAddress.toLowerCase(),
        masterKeyHash,
        salt,
        avatar: avatarBase64,
        preferences: {},
        lastLoginAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      avatar: avatarBase64 
    });
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