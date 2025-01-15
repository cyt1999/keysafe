import { PrismaClient } from '@prisma/client';
import { getScheduler, initializeServices } from '@/services/init';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

/**
 * 管理员同步数据的API处理函数
 */
export async function POST(request: Request) {
  try {
    const { userId, syncType } = await request.json();

    // 确保服务已初始化
    initializeServices();

    // 全量同步
    if (syncType === 'all') {
      const scheduler = getScheduler();
      const result = await scheduler.syncAll();
      
      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: '部分用户同步失败',
          details: {
            totalUsers: result.totalUsers,
            successCount: result.successCount,
            failedUsers: result.failedUsers
          }
        }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true,
        message: '全量同步已完成',
        details: {
          totalUsers: result.totalUsers,
          successCount: result.successCount
        }
      });
    }
    
    // 单用户同步
    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 });
    }

    // 验证用户存在
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 执行同步
    const scheduler = getScheduler();
    const syncService = scheduler.getSyncService();
    const cid = await syncService.syncToIPFS(userId);

    return NextResponse.json({ 
      success: true,
      cid 
    });
  } catch (error) {
    console.error('同步失败:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : '同步失败'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 