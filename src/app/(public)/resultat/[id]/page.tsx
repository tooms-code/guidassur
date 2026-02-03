"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { AnalysisResults } from "@/frontend/components/analysis/AnalysisResults";
import { AnalysisLoading } from "@/frontend/components/analysis/AnalysisLoading";
import { useFreeAnalysis, useUnlockAnalysis } from "@/frontend/hooks/useAnalysis";
import { useAuth } from "@/frontend/hooks/useAuth";
import { FullAnalysisResponseDto } from "@/backend/application/dtos/analysis.dto";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ResultatPage({ params }: PageProps) {
  const { id } = use(params);
  const [showLoading, setShowLoading] = useState(true);
  const [unlockedAnalysis, setUnlockedAnalysis] = useState<FullAnalysisResponseDto | null>(null);
  const { data: analysis, isLoading, error } = useFreeAnalysis(id);
  const { user, isLoading: authLoading } = useAuth();
  const unlockMutation = useUnlockAnalysis();

  // Simulate minimum loading time for animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Show loading animation
  if (isLoading || showLoading) {
    return <AnalysisLoading />;
  }

  // Show error
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Analyse introuvable
          </h1>
          <p className="text-gray-500 mb-6">
            Cette analyse n&apos;existe pas ou a expiré.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  const handleUnlock = async () => {
    try {
      const result = await unlockMutation.mutateAsync(id);
      setUnlockedAnalysis(result);
    } catch (err) {
      console.error("Failed to unlock:", err);
    }
  };

  // Show results
  if (!analysis) {
    return null;
  }

  return (
    <AnalysisResults
      analysis={unlockedAnalysis ?? analysis}
      unlockedInsights={unlockedAnalysis?.unlockedInsights}
      isAuthenticated={!authLoading && !!user}
      userCredits={user?.credits ?? 0}
      onUnlock={handleUnlock}
      isUnlocking={unlockMutation.isPending}
    />
  );
}
