import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
}

export default function Card({ children }: CardProps) {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 hover:shadow-lg transition">
      {children}
    </div>
  );
}