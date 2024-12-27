'use client';

import Head from 'next/head';
import CreatePassword from '@/components/specific/auth/CreatePassword';

export default function CreateAccount() {
  return (
    <>
      <Head>
        <title>创建账户 | KeySafe</title>
      </Head>
      <CreatePassword />
    </>
  );
} 