import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma 客户端实例
 * 用于数据库操作
 */
const prisma = new PrismaClient();

/**
 * 获取用户密码列表的API处理函数
 * 
 * @description
 * 该API用于获取指定钱包地址用户的所有密码条目。
 * 返回的密码数据是加密的，需要在客户端使用用户的密钥进行解密。
 * 
 * @param req - API请求对象
 * @param req.query.address - 用户的钱包地址
 * @param res - API响应对象
 * 
 * @returns 返回用户的密码列表，每个条目包含：
 * - id: 密码条目的唯一标识
 * - encryptedData: 加密后的密码数据
 * - version: 数据版本号
 * - createdAt: 创建时间
 * - updatedAt: 最后更新时间
 * 
 * @throws
 * - 400: 缺少钱包地址
 * - 404: 用户不存在
 * - 500: 服务器内部错误
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const { address } = req.query;

    // 验证请求参数
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: '缺少钱包地址' });
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { walletAddress: address.toLowerCase() }
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 获取用户的所有密码条目
    const passwordEntries = await prisma.passwordEntry.findMany({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        encryptedData: true,
        version: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'  // 按更新时间降序排序
      }
    });

    // 转换数据格式
    const formattedEntries = passwordEntries.map((entry: any) => ({
      ...entry,
      encryptedData: JSON.parse(entry.encryptedData)  // 解析存储的JSON字符串
    }));

    return res.status(200).json(formattedEntries);
  } catch (error) {
    console.error('获取密码列表失败:', error);
    return res.status(500).json({ error: '获取密码列表失败' });
  } finally {
    // 确保关闭数据库连接
    await prisma.$disconnect();
  }
} 