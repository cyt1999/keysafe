import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 验证用户的API处理函数
 * @param req - API请求对象，包含用户的钱包地址
 * @param res - API响应对象
 * @returns 用户的验证信息
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const { address } = req.query;

    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: '缺少钱包地址' });
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { walletAddress: address.toLowerCase() },
      select: {
        id: true,
        masterKeyHash: true,
        salt: true,
        avatar: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    return res.status(200).json({
      masterKeyHash: user.masterKeyHash,
      salt: user.salt,
      avatar: user.avatar
    });
  } catch (error) {
    console.error('验证用户失败:', error);
    return res.status(500).json({ error: '验证用户失败' });
  } finally {
    await prisma.$disconnect();
  }
} 