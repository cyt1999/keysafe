import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getScheduler } from '@/services/init';

const prisma = new PrismaClient();

/**
 * 管理员同步数据的API处理函数
 * @param req - API请求对象，包含用户ID
 * @param res - API响应对象
 * @returns 同步操作的结果
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const { userId } = req.body;

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
    const cid = await scheduler.syncService.syncToIPFS(userId);

    return res.status(200).json({ 
      success: true,
      cid 
    });
  } catch (error) {
    console.error('同步失败:', error);
    return res.status(500).json({ error: '同步失败' });
  } finally {
    await prisma.$disconnect();
  }
} 