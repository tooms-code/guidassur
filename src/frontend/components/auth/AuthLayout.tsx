interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-[400px] bg-white border border-gray-200 rounded-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
