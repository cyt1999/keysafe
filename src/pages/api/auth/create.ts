import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { generatePixelAvatar, svgToBase64 } from '@/utils/avatarGenerator';

const prisma = new PrismaClient();

/**
 * 创建新用户的API处理函数
 * @param req - API请求对象，包含用户的钱包地址和主密钥哈希
 * @param res - API响应对象
 * @returns 创建的用户信息
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const { 
      walletAddress,
      masterKeyHash,  // 主密钥哈希
      salt           // PBKDF2 盐值
    } = req.body;

    // 检查参数
    if (!walletAddress || !masterKeyHash || !salt) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({ error: '用户已存在' });
    }

    // 生成用户头像
    const avatarSvg = generatePixelAvatar();
    const avatarBase64 = svgToBase64(avatarSvg);

    // 创建新用户
    const user = await prisma.user.create({
      data: {
        walletAddress: walletAddress.toLowerCase(),
        masterKeyHash,
        salt,
        avatar: avatarBase64,
        preferences: {},
        lastLoginAt: new Date()
      }
    });

    return res.status(200).json({ 
      success: true,
      avatar: avatarBase64 
    });
  } catch (error) {
    console.error('创建用户失败:', error);
    return res.status(500).json({ error: '创建用户失败' });
  } finally {
    await prisma.$disconnect();
  }
} 