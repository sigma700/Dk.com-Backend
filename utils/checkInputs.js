//function for checking password complexity

export const checkPass = (res, password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasMinLength = password.length >= 7;

  if (!hasUpperCase || !hasDigit || !hasMinLength) {
    res.status(400).json({
      success: false,
      message: "Password is too weak !",
    });
    console.error("Make sure that all the conditions are met !");
    //to allow display of the problem appropriately in the frotend
    throw new Error("Please make sure that the conditions are met !");
  }
};
