import { NextResponse } from 'next/server';
import { getScheduler } from '@/services/init';

export async function POST(request: Request) {
  try {
    // 验证管理员API密钥
    const authHeader = request.headers.get('Authorization');
    const apiKey = authHeader?.replace('Bearer ', '');

    if (!process.env.ADMIN_API_KEY || apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    // 获取调度器并触发同步
    const scheduler = getScheduler();
    await scheduler.syncAll();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('手动同步失败:', error);
    return NextResponse.json(
      { error: '同步失败' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: '不支持的请求方法' },
    { status: 405 }
  );
} 