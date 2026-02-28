"use client";

import ProtectedRoute from '@/components/ProtectedRoute';

export default function AgriculteurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['agriculteur']}>
      {children}
    </ProtectedRoute>
  );
}
