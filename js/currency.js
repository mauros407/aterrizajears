(function () {
    const currencyLocales = {
        ARS: 'es-AR',
        BOB: 'es-BO',
        EUR: 'es-ES',
        USD: 'en-US',
    };

    let selectedCurrency = window.KeysArsSite?.defaultCurrency || 'USD';

    function formatMoney(amount, currencyCode) {
        if (amount === null || amount === undefined || amount === '') return null;

        const currency = currencyCode || selectedCurrency;
        const locale = currencyLocales[currency] || 'es-AR';
        const value = Number(amount);
        const maximumFractionDigits = currency === 'USD' || currency === 'EUR' ? 2 : 0;

        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            maximumFractionDigits,
        }).format(value);
    }

    function convertFromBase(amount, targetCurrency) {
        if (amount === null || amount === undefined || amount === '') return null;

        const site = window.KeysArsSite || {};
        const baseCurrency = site.baseCurrency || 'USD';
        const currency = targetCurrency || selectedCurrency;

        if (currency === baseCurrency) return Number(amount);

        const rate = site.exchangeRates?.[currency];
        if (!rate) {
            console.warn(`No hay tasa configurada para convertir ${baseCurrency} a ${currency}.`);
            return Number(amount);
        }

        return Number(amount) * Number(rate);
    }

    function formatFromBase(amount, targetCurrency) {
        const currency = targetCurrency || selectedCurrency;
        return formatMoney(convertFromBase(amount, currency), currency);
    }

    function getSelectedCurrency() {
        return selectedCurrency;
    }

    function setSelectedCurrency(currencyCode) {
        const enabledCurrencies = window.KeysArsSite?.enabledCurrencies || ['USD'];
        if (!enabledCurrencies.includes(currencyCode)) return selectedCurrency;

        selectedCurrency = currencyCode;
        localStorage.setItem('selectedCurrency', currencyCode);
        return selectedCurrency;
    }

    function restoreSelectedCurrency() {
        const savedCurrency = localStorage.getItem('selectedCurrency');
        if (savedCurrency) {
            setSelectedCurrency(savedCurrency);
        }

        return selectedCurrency;
    }

    window.CurrencyTools = {
        convertFromBase,
        formatFromBase,
        formatMoney,
        getSelectedCurrency,
        restoreSelectedCurrency,
        setSelectedCurrency,
    };
})();
