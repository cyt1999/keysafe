import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 更新密码条目的API处理函数
 * @param req - API请求对象，包含要更新的密码数据
 * @param res - API响应对象
 * @returns 更新后的密码条目信息
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只允许PUT请求
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const { id, encryptedData, walletAddress } = req.body;

    if (!id || !encryptedData || !walletAddress) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    // 验证用户存在
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() }
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

    // 更新密码条目
    const updatedEntry = await prisma.passwordEntry.update({
      where: { id },
      data: {
        encryptedData: JSON.stringify(encryptedData),
        version: existingEntry.version + 1
      }
    });

    return res.status(200).json({
      id: updatedEntry.id,
      updatedAt: updatedEntry.updatedAt
    });
  } catch (error) {
    console.error('更新密码条目失败:', error);
    return res.status(500).json({ error: '更新密码条目失败' });
  } finally {
    await prisma.$disconnect();
  }
} 