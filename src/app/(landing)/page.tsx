import { Hero } from "@/frontend/components/landing/Hero";
import { InsurancePills } from "@/frontend/components/landing/InsurancePills";
import { HowItWorks } from "@/frontend/components/landing/HowItWorks";
import { Pricing } from "@/frontend/components/landing/Pricing";
import { FAQ } from "@/frontend/components/landing/FAQ";

export default function Home() {
  return (
    <>
      <Hero />
      <InsurancePills />
      <HowItWorks />
      <Pricing />
      <FAQ />
    </>
  );
}
