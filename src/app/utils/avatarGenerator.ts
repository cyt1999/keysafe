/**
 * 生成随机的像素风格头像
 * 返回SVG字符串
 */

// 预设的配色方案
const colorSchemes = [
  // 森林系
  ['#2D5A27', '#4A8538', '#87B37A', '#C1D5B0'],
  // 海洋系
  ['#1B3B6F', '#065A82', '#1C7293', '#9EB3C2'],
  // 日落系
  ['#FF7B54', '#FFB26B', '#FFD56B', '#939B62'],
  // 薄荷系
  ['#40514E', '#2F89B3', '#4FB3A3', '#E4F9F5'],
  // 樱花系
  ['#FF69B4', '#FFB6C1', '#FFC0CB', '#FFF0F5'],
  // 紫罗兰系
  ['#4A266A', '#7251B5', '#9B72CF', '#C8B1E4'],
  // 秋叶系
  ['#8B4513', '#CD853F', '#DEB887', '#F5DEB3'],
];

// 随机选择一个配色方案
function getRandomColorScheme(): string[] {
  return colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
}

// 生成随机数但保持一定的图案规律
function generatePattern(size: number): number[][] {
  const pattern: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));
  const colors = [0, 1, 2, 3]; // 对应配色方案的索引

  // 生成左半边的随机图案
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < Math.ceil(size/2); x++) {
      // 增加一些规律性：相邻像素有40%的概率使用相同颜色
      if (x > 0 && Math.random() < 0.4) {
        pattern[y][x] = pattern[y][x-1];
      } else if (y > 0 && Math.random() < 0.4) {
        pattern[y][x] = pattern[y-1][x];
      } else {
        pattern[y][x] = colors[Math.floor(Math.random() * colors.length)];
      }
    }
  }

  // 镜像复制右半边
  for (let y = 0; y < size; y++) {
    for (let x = Math.ceil(size/2); x < size; x++) {
      pattern[y][x] = pattern[y][size - x - 1];
    }
  }

  return pattern;
}

// 生成SVG字符串
export function generatePixelAvatar(size: number = 8): string {
  const colors = getRandomColorScheme();
  const pattern = generatePattern(size);

  let svgContent = `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">`;

  // 绘制像素
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const color = colors[pattern[y][x]];
      svgContent += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`;
    }
  }

  svgContent += '</svg>';
  return svgContent;
}

// Base64编码（如果需要直接在img标签中使用）
export function svgToBase64(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
} 