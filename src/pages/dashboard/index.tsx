'use client';

import Head from 'next/head';
import { PasswordManager } from '@/components/specific/password/PasswordManager';

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>密码管理 | KeySafe</title>
      </Head>
      <PasswordManager />
    </>
  );
}
