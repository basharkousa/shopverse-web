export function formatMoney(cents) {
    return new Intl.NumberFormat('en-EU', {
        style: 'currency',
        currency: 'EUR',
    }).format(cents / 100);
}