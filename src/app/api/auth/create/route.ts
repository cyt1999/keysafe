import { PrismaClient } from '@prisma/client';
import { generatePixelAvatar, svgToBase64 } from '@/utils/avatarGenerator';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

/**
 * 创建新用户的API处理函数
 */
export async function POST(request: Request) {
  try {
    const { 
      walletAddress,
      masterKeyHash,
      salt
    } = await request.json();

    // 检查参数
    if (!walletAddress || !masterKeyHash || !salt) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json({ error: '用户已存在' }, { status: 409 });
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
      id: user.id,
      address: user.walletAddress,
      avatar: user.avatar,
      nickname: user.nickname
    });
  } catch (error) {
    console.error('创建用户失败:', error);
    return NextResponse.json({ error: '创建用户失败' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 