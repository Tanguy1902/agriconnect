"use client";

import ProtectedRoute from '@/components/ProtectedRoute';

export default function CollecteurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['collecteur']}>
      {children}
    </ProtectedRoute>
  );
}
