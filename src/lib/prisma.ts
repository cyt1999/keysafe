import { PrismaClient } from '@prisma/client';

/**
 * 创建 PrismaClient 单例的工厂函数
 * 通过函数形式可以更好地控制实例化过程和配置项
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    // 根据环境配置日志级别
    // development 环境下输出 query/error/warn 日志
    // 生产环境只输出 error 日志
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

/**
 * 扩展全局类型定义
 * 声明 prisma 变量的类型，确保类型安全
 * ReturnType 用于获取 prismaClientSingleton 函数返回值的类型
 */
declare global {
  // 在全局声明中，我们必须使用 var
  // 因为 let 和 const 是块级作用域，不能用于全局声明
  // 所以这里需要禁用 ESLint 规则
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

/**
 * 创建或复用 PrismaClient 实例
 * 使用 ?? 空值合并运算符，如果 globalThis.prisma 为 undefined，则创建新实例
 * 这样确保在整个应用中只创建一个 PrismaClient 实例
 */
const prisma = globalThis.prisma ?? prismaClientSingleton();

/**
 * 在开发环境中将 prisma 实例保存到 globalThis
 * 这样在热重载时可以重用同一个实例，避免创建多个连接
 * 生产环境不需要这个处理，因为不会有热重载
 */
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

// 导出 prisma 实例供应用使用
export { prisma }; 
