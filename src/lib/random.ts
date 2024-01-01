function genRandomString(length: number) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charLength = chars.length;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
}

export default genRandomString;
