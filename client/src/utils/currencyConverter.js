// Exchange rate: 1 USD = 281 PKR
export const PKR_TO_USD_RATE = 281;

export const convertPKRtoUSD = (pkrAmount) => {
  const usdAmount = pkrAmount / PKR_TO_USD_RATE;
  return usdAmount.toFixed(2);
};

export const formatPKR = (amount) => {
  return `PKR ${amount.toLocaleString()}`;
};

export const formatUSD = (amount) => {
  return `$${Number(amount).toFixed(2)}`;
};

export const formatPriceWithConversion = (pkrAmount) => {
  const usdAmount = convertPKRtoUSD(pkrAmount);
  return `${formatPKR(pkrAmount)} (${formatUSD(usdAmount)})`;
}; 