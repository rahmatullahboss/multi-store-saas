import type { StoreTemplateProps } from '~/templates/store-registry';
import { LiveOzzylPremiumHomepage } from './LiveHomepage';

export { OzzylPremiumProductCard } from './LiveHomepage';

export function OzzylPremiumTemplate(props: StoreTemplateProps) {
  return <LiveOzzylPremiumHomepage {...props} />;
}

export default OzzylPremiumTemplate;
