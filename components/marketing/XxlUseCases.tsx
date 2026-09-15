import { FEATURED_USE_CASES } from "@/lib/use-cases";
import { UseCaseSlider } from "./UseCaseSlider";

/**
 * Invulmogelijkheden voor de XXL-unit op /xxl: één beeld tegelijk, met
 * swipen, pijlen en bolletjes. Zelfde slider als de doorklik per
 * verdieping op de homepage.
 */
export function XxlUseCases() {
  return (
    <div className="mt-8">
      <UseCaseSlider items={FEATURED_USE_CASES} />
    </div>
  );
}
