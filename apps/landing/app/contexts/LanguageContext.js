import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
import { t as translate } from '~/utils/i18n';
const LanguageContext = createContext({
    t: (key) => key,
    lang: 'en',
    setLang: () => { },
});
export function LanguageProvider({ children }) {
    const [lang, setLang] = useState('bn');
    const t = (key, options) => translate(key, lang, options);
    return (_jsx(LanguageContext.Provider, { value: { t, lang, setLang }, children: children }));
}
export function useTranslation() {
    return useContext(LanguageContext);
}
// Helper hook for price formatting
export function useFormatPrice() {
    const { lang } = useTranslation();
    return (amount, currency = 'BDT') => {
        if (lang === 'bn') {
            return `৳${amount.toLocaleString('bn-BD')}`;
        }
        return `${currency} ${amount.toLocaleString('en-US')}`;
    };
}
