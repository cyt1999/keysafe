import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma 客户端实例
 * 用于数据库操作
 */
const prisma = new PrismaClient();

/**
 * 创建新密码条目的API处理函数
 * 
 * @description
 * 该API用于为指定用户创建新的密码条目。
 * 密码数据在客户端已经过加密，服务器只负责存储加密后的数据。
 * 
 * @param req - API请求对象
 * @param req.body.encryptedData - 加密后的密码数据
 * @param req.body.walletAddress - 用户的钱包地址
 * @param res - API响应对象
 * 
 * @returns 返回创建的密码条目信息：
 * - id: 新创建的密码条目ID
 * - createdAt: 创建时间
 * 
 * @throws
 * - 400: 缺少必要参数
 * - 404: 用户不存在
 * - 500: 服务器内部错误
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const { encryptedData, walletAddress } = req.body;

    // 验证请求参数
    if (!encryptedData || !walletAddress) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    // 验证用户存在
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() }
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 创建新的密码条目
    const entry = await prisma.passwordEntry.create({
      data: {
        encryptedData: JSON.stringify(encryptedData),  // 将加密数据转换为JSON字符串存储
        version: 1,  // 初始版本号
        userId: user.id  // 关联到用户
      }
    });

    // 返回创建成功的结果
    return res.status(200).json({
      id: entry.id,
      createdAt: entry.createdAt
    });
  } catch (error) {
    console.error('创建密码条目失败:', error);
    return res.status(500).json({ error: '创建密码条目失败' });
  } finally {
    // 确保关闭数据库连接
    await prisma.$disconnect();
  }
} 