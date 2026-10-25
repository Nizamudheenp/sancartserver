/**
 * Formats structured shipping address for HTML email templates.
 */
function formatEmailAddress(address) {
  if (!address) return 'Not provided';

  const parts = [];
  if (address.fullName) parts.push(`<strong>${address.fullName}</strong>`);
  if (address.phone) parts.push(`Phone: +91 ${address.phone}`);

  const streetLine = [address.street, address.landmark].filter(Boolean).join(', ');
  if (streetLine) parts.push(streetLine);

  const cityStatePin = [address.city, address.state].filter(Boolean).join(', ') + 
    (address.pincode ? ` - ${address.pincode}` : '');
  if (cityStatePin.trim()) parts.push(cityStatePin);

  return parts.join('<br/>');
}

module.exports = { formatEmailAddress };
