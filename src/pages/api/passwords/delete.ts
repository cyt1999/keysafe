import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 删除密码条目的API处理函数
 * @param req - API请求对象，包含要删除的密码ID和用户地址
 * @param res - API响应对象
 * @returns 删除操作的结果
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只允许DELETE请求
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const { id, address } = req.query;

    if (!id || !address || typeof id !== 'string' || typeof address !== 'string') {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    // 验证用户存在
    const user = await prisma.user.findUnique({
      where: { walletAddress: address.toLowerCase() }
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 验证密码条目存在且属于该用户
    const existingEntry = await prisma.passwordEntry.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!existingEntry) {
      return res.status(404).json({ error: '密码条目不存在或无权访问' });
    }

    // 删除密码条目
    await prisma.passwordEntry.delete({
      where: { id }
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('删除密码条目失败:', error);
    return res.status(500).json({ error: '删除密码条目失败' });
  } finally {
    await prisma.$disconnect();
  }
} 