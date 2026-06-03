import React from "react";
import { Masthead } from "@/components/landing/Masthead";
import { HeroEditorial } from "@/components/landing/HeroEditorial";
import { LiveDemo } from "@/components/landing/LiveDemo";
import { Process } from "@/components/landing/Process";
import { Capabilities } from "@/components/landing/Capabilities";
import { WorkedExample } from "@/components/landing/WorkedExample";
import { TrustSection } from "@/components/landing/TrustSection";
import { ColophonFooter } from "@/components/landing/ColophonFooter";

/**
 * Datagraph landing — an editorial journal for the CSV-to-chat product.
 *
 * The page reads top-to-bottom as a single issue: masthead → hero →
 * specimen → method → faculties → worked example → engineering →
 * colophon. Every section routes back into /app via a precise CTA.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink text-bone overflow-x-hidden">
      <Masthead />
      <main>
        <HeroEditorial />
        <LiveDemo />
        <Process />
        <Capabilities />
        <WorkedExample />
        <TrustSection />
      </main>
      <ColophonFooter />
    </div>
  );
}
