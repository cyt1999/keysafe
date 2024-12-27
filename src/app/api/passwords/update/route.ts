import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { EncryptedData } from '@/utils/types';

const prisma = new PrismaClient();

export async function PUT(request: Request) {
  try {
    const { id, encryptedData, walletAddress } = await request.json();

    if (!id || !encryptedData || !walletAddress) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 验证加密数据格式
    const { ciphertext, iv, tag } = encryptedData as EncryptedData;
    if (!ciphertext || !iv) {
      return NextResponse.json(
        { error: '加密数据格式错误' },
        { status: 400 }
      );
    }

    // 验证密码条目所有权
    const existingEntry = await prisma.passwordEntry.findFirst({
      where: {
        id,
        user: {
          walletAddress: walletAddress.toLowerCase()
        }
      }
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: '密码条目不存在或无权访问' },
        { status: 404 }
      );
    }

    // 更新密码条目
    const updatedEntry = await prisma.passwordEntry.update({
      where: { id },
      data: {
        encryptedData: JSON.stringify(encryptedData),
        version: { increment: 1 }
      }
    });

    return NextResponse.json({
      id: updatedEntry.id,
      updatedAt: updatedEntry.updatedAt
    });
  } catch (error) {
    console.error('更新密码条目失败:', error);
    return NextResponse.json(
      { error: '更新密码条目失败' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 