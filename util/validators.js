const accountIdValidator = (accountId) => {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/g;
  return accountId ? regex.test(accountId) : false;
};

const accountIdAdminValidator = (accountId) => {
  const regex = /^[a-zA-Z0-9]+$/;
  return accountId ? regex.test(accountId) : false;
};

const phoneNoValidator = (phoneNo) => {
  // Remove hyphens from the phone number
  const normalizePhoneNo = phoneNo.replace(/[^\d+]/g, '');

  if (!phoneNo) {
    return false;
  }

  // Allow phone numbers with 9 to 11 digits
  const regex = /^([+]?)([\d]{0,2})[\d]{9,11}$/g;
  return regex.test(normalizePhoneNo);
};

const passwordValidator = (password) => {
  const regex = /^(?=.*[A-Za-z])(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z!@#$%^&*\d]{8,12}$/g;
  return password ? regex.test(password) : false;
};

const emailValidator = (email) => {
  const regex = /^[+.\-_a-zA-Z0-9]+@[\w.\-]+\.[A-Za-z]{2,4}$/g;
  return email ? regex.test(email) : false;
};

const macAddressValidator = (macAddress) => {
  const regex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macAddress ? regex.test(macAddress) : false;
};

const phoneNoTransform = (phoneNo) => {
  if (!phoneNo) {
    return '';
  }
  return phoneNo.replace(/[^0-9a-zA-Z]/g, '');
};

module.exports = {
  accountIdValidator,
  phoneNoValidator,
  passwordValidator,
  emailValidator,
  accountIdAdminValidator,
  macAddressValidator,
  phoneNoTransform,
};
