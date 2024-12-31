import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getScheduler, initializeServices } from '@/services/init';

const prisma = new PrismaClient();

/**
 * 管理员同步数据的API处理函数
 * @param req - API请求对象，包含用户ID或syncType
 * @param res - API响应对象
 * @returns 同步操作的结果
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    // 确保服务已初始化
    initializeServices();
    
    const { userId, syncType } = req.body;

    // 全量同步
    if (syncType === 'all') {
      const scheduler = getScheduler();
      const result = await scheduler.syncAll();
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: '部分用户同步失败',
          details: {
            totalUsers: result.totalUsers,
            successCount: result.successCount,
            failedUsers: result.failedUsers
          }
        });
      }

      return res.status(200).json({ 
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
      return res.status(400).json({ error: '缺少用户ID' });
    }

    // 验证用户存在
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 执行同步
    const scheduler = getScheduler();
    const syncService = scheduler.getSyncService();
    const cid = await syncService.syncToIPFS(userId);

    return res.status(200).json({ 
      success: true,
      cid 
    });
  } catch (error) {
    console.error('同步失败:', error);
    return res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : '同步失败'
    });
  } finally {
    await prisma.$disconnect();
  }
} 