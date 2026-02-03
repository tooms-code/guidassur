"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { QuestionnaireShell } from "@/frontend/components/questionnaire/QuestionnaireShell";
import { InsuranceType } from "@/shared/types/questionnaire";

const validTypes: InsuranceType[] = ["auto", "habitation", "gav", "mutuelle"];

interface PageProps {
  params: Promise<{ type: string }>;
}

export default function QuestionnairePage({ params }: PageProps) {
  const { type } = use(params);

  if (!validTypes.includes(type as InsuranceType)) {
    notFound();
  }

  return <QuestionnaireShell type={type as InsuranceType} />;
}
