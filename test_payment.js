const fs = require('fs');
const content = fs.readFileSync('apps/web/app/components/checkout/PaymentMethodSelector.tsx', 'utf8');
console.log(content.includes('<div \n              key={method.id}\n              onClick={() => onMethodChange(method.id)}'));
