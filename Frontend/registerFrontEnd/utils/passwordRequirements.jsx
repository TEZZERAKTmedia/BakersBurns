export const checkPasswordRequirements = (password) => {
    const length = password.length >= 8;
    const upperLowerCase = /(?=.*[a-z])(?=.*[A-Z])/.test(password);
    const specialChar = /(?=.*[@$!%*?&])/.test(password);
    const digit = /(?=.*\d)/.test(password);
  
    return {
      length,
      upperLowerCase,
      specialChar,
      digit
    };
  };
  