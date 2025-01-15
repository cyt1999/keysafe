import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

/**
 * 获取用户IPFS同步状态的API处理函数
 */
export async function GET(request: Request) {
  try {
    // 从请求头中获取用户ID
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 查询数据库获取用户的同步状态
    const syncStatus = await prisma.passwordSync.findUnique({
      where: {
        userId: userId
      },
      select: {
        lastSyncedCid: true,
        lastSyncedAt: true,
        syncStatus: true
      }
    });

    // 如果没有找到同步记录，返回默认状态
    if (!syncStatus) {
      return NextResponse.json({
        lastSyncedCid: null,
        lastSyncedAt: null,
        syncStatus: 'PENDING'
      });
    }

    // 返回同步状态信息
    return NextResponse.json(syncStatus);
  } catch (error) {
    console.error('Error fetching sync status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 