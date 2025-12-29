// src/components/RelationExplainer.tsx
"use client";

import { useState } from "react";

type RelationExplanation = {
  [key: string]: (person1: string, person2: string) => string;
};

const explanations: RelationExplanation = {
  "sibling": (p1, p2) => `${p1} and ${p2} share at least one parent in common.`,
  "1st cousin": (p1, p2) => `${p1} and ${p2} share a set of grandparents. ${p1}'s parent and ${p2}'s parent are siblings.`,
  "2nd cousin": (p1, p2) => `${p1} and ${p2} share a set of great-grandparents. ${p1}'s grandparent and ${p2}'s grandparent are siblings.`,
  "3rd cousin": (p1, p2) => `${p1} and ${p2} share a set of great-great-grandparents. ${p1}'s great-grandparent and ${p2}'s great-grandparent are siblings.`,
  "4th cousin": (p1, p2) => `${p1} and ${p2} share a set of great-great-great-grandparents.`,
  "once removed": (p1, p2) => `"Once removed" means there is a one-generation difference between ${p1} and ${p2}. For example, a first cousin once removed is someone one generation above or below you - they share grandparents as their closest common ancestors, but are in a different generational step. This could be ${p1}'s parent's first cousin, or ${p1}'s first cousin's child.`,
  "twice removed": (p1, p2) => `"Twice removed" means there is a two-generation difference between ${p1} and ${p2}. For example, ${p1}'s first cousin twice removed could be ${p1}'s grandparent's first cousin, or ${p1}'s first cousin's grandchild.`,
  "parent": (p1, p2) => `One person is the direct biological or adoptive parent of the other.`,
  "grandparent": (p1, p2) => `One person is the parent of the other person's parent (two generations apart).`,
  "great-grandparent": (p1, p2) => `One person is the parent of the other person's grandparent (three generations apart). Each additional "great" adds one more generation.`,
  "spouse": (p1, p2) => `${p1} and ${p2} are married to each other.`,
  "in-law": (p1, p2) => `${p1} and ${p2} are relatives by marriage rather than blood.`,
};

function getExplanation(relation: string, person1: string, person2: string): string | null {
  const lower = relation.toLowerCase();
  
  // Check for "removed" patterns FIRST (more specific)
  if (lower.includes("once removed")) {
    return explanations["once removed"](person1, person2);
  }
  if (lower.includes("twice removed")) {
    return explanations["twice removed"](person1, person2);
  }
  
  // Then check for other patterns
  for (const [key, explanationFn] of Object.entries(explanations)) {
    if (key === "once removed" || key === "twice removed") continue; // Already handled above
    if (lower.includes(key)) {
      return explanationFn(person1, person2);
    }
  }
  
  return null;
}

export default function RelationExplainer({ 
  relation, 
  person1Name, 
  person2Name 
}: { 
  relation: string;
  person1Name: string;
  person2Name: string;
}) {
  const [showExplanation, setShowExplanation] = useState(false);
  const explanation = getExplanation(relation, person1Name, person2Name);

  if (!explanation) return null;

  return (
    <div>
      <button
        onClick={() => setShowExplanation(!showExplanation)}
        className="text-sm text-blue-700 hover:underline"
      >
        {showExplanation ? "Hide explanation" : "Explain this relation"}
      </button>
      
      {showExplanation && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
          {explanation}
        </div>
      )}
    </div>
  );
}