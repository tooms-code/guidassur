"use client";

import { QuestionDto } from "@/backend/application/dtos/questionnaire.dto";
import { SingleChoice } from "./questions/SingleChoice";
import { MultiChoice } from "./questions/MultiChoice";
import { NumberInput } from "./questions/NumberInput";
import { TextInput } from "./questions/TextInput";
import { YesNo } from "./questions/YesNo";
import { Consent } from "./questions/Consent";

interface QuestionRendererProps {
  question: QuestionDto;
  onAnswer: (answer: unknown) => void;
}

export function QuestionRenderer({ question, onAnswer }: QuestionRendererProps) {
  switch (question.type) {
    case "single-choice":
      return (
        <SingleChoice
          question={question}
          onAnswer={(answer) => onAnswer(answer)}
        />
      );

    case "multi-choice":
      return (
        <MultiChoice
          question={question}
          onAnswer={(answer) => onAnswer(answer)}
        />
      );

    case "number":
      return (
        <NumberInput
          question={question}
          onAnswer={(answer) => onAnswer(answer)}
        />
      );

    case "text":
      return (
        <TextInput
          question={question}
          onAnswer={(answer) => onAnswer(answer)}
        />
      );

    case "yes-no":
      return (
        <YesNo
          question={question}
          onAnswer={(answer) => onAnswer(answer)}
        />
      );

    case "yes-no-followup":
      // For now, treat as yes-no (followup can be added later)
      return (
        <YesNo
          question={question}
          onAnswer={(answer) => onAnswer(answer)}
        />
      );

    case "consent":
      return (
        <Consent
          question={question}
          onAnswer={(answer) => onAnswer(answer)}
        />
      );

    default:
      return (
        <div className="text-center text-gray-500">
          Type de question non supporté
        </div>
      );
  }
}
