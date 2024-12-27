'use client';

import React from 'react';
import { Avatar } from 'antd';

interface WebsiteIconProps {
  name: string;
  size?: number;
}

// 生成网站名称的缩写
const getAbbreviation = (name: string): string => {
  // 移除域名后缀和协议
  const cleanName = name.replace(/^(https?:\/\/)?(www\.)?/, '').split('.')[0];
  
  // 特殊网站的缩写处理
  const specialCases: Record<string, string> = {
    'google': 'G',
    'github': 'GH',
    'facebook': 'FB',
    'twitter': 'X',
    'linkedin': 'IN',
    'microsoft': 'MS',
    'amazon': 'AZ',
  };

  const lowerName = cleanName.toLowerCase();
  if (specialCases[lowerName]) {
    return specialCases[lowerName];
  }

  // 一般情况：取首字母，如果有空格则取第二个单词的首字母
  const words = cleanName.split(/[\s-_]+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  
  // 单个单词：如果长度大于1，取前两个字母，否则取第一个字母
  return words[0].length > 1 
    ? words[0].slice(0, 2).toUpperCase() 
    : words[0][0].toUpperCase();
};

// 生成背景色
const generateBackgroundColor = (name: string): string => {
  // 预定义的柔和颜色
  const colors = [
    '#7C4DFF', // 紫色
    '#2196F3', // 蓝色
    '#00BCD4', // 青色
    '#009688', // 蓝绿色
    '#4CAF50', // 绿色
    '#8BC34A', // 浅绿色
    '#FFC107', // 琥珀色
    '#FF9800', // 橙色
    '#FF5722', // 深橙色
    '#795548', // 棕色
    '#607D8B', // 蓝灰色
    '#E91E63', // 粉色
  ];

  // 使用网站名称生成一个稳定的索引
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // 确保索引在颜色数组范围内
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export function WebsiteIcon({ name, size = 32 }: WebsiteIconProps) {
  const abbreviation = getAbbreviation(name);
  const backgroundColor = generateBackgroundColor(name);

  return (
    <Avatar
      size={size}
      style={{
        backgroundColor,
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: size * 0.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {abbreviation}
    </Avatar>
  );
} 