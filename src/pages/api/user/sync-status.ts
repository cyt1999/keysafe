import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { SessionUtils } from '@/utils/sessionUtils';

const prisma = new PrismaClient();

/**
 * 获取用户IPFS同步状态的API处理函数
 * 
 * @param req - Next.js API请求对象
 * @param res - Next.js API响应对象
 * @returns 返回用户的同步状态信息
 * 
 * 响应格式:
 * {
 *   lastSyncedCid: string | null,  // 最后同步的IPFS CID
 *   lastSyncedAt: string,          // 最后同步时间
 *   syncStatus: string             // 同步状态（PENDING/SYNCING/COMPLETED/FAILED）
 * }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {

    // 查询数据库获取用户的同步状态
    const user = await prisma.user.findUnique({
      where: {
        walletAddress: SessionUtils.getWalletAddress()
      }
    });
    const syncStatus = await prisma.passwordSync.findUnique({
      where: {
        walletAddress: SessionUtils.getWalletAddress()
      },
      select: {
        lastSyncedCid: true,
        lastSyncedAt: true,
        syncStatus: true
      }
    });

    // 如果没有找到同步记录，返回默认状态
    if (!syncStatus) {
      return res.status(200).json({
        lastSyncedCid: null,
        lastSyncedAt: null,
        syncStatus: 'PENDING'
      });
    }

    // 返回同步状态信息
    return res.status(200).json(syncStatus);
  } catch (error) {
    // 错误处理
    console.error('Error fetching sync status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 