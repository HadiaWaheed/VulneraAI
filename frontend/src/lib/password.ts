/**
 * Shared client-side password policy.
 * Must mirror the backend checks in backend/auth.py so the UI rejects
 * weak passwords before a round-trip to the server.
 */
export const MIN_PASSWORD_LENGTH = 8;

const COMMON_PASSWORDS = new Set([
  "password",
  "passw0rd",
  "12345678",
  "123456789",
  "1234567890",
  "qwertyui",
  "qwerty123",
  "iloveyou",
  "welcome1",
  "admin123",
  "letmein1",
  "abc12345",
  "password1",
  "sunshine",
  "princess",
  "football",
  "monkey123",
  "dragon123",
  "trustno1",
  "superman",
  "starwars",
  "whatever",
  "zaq12wsx",
  "qazwsxed",
  "1q2w3e4r",
  "1qaz2wsx",
  "baseball",
  "michael1",
  "shadow123",
  "ashley123",
  "jordan23",
  "hunter02",
  "harley123",
  "ranger123",
  "buster123",
  "thomas123",
  "robert123",
  "soccer123",
  "batman123",
  "test1234",
  "summer2024",
  "winter2024",
  "spring2024",
  "autumn2024",
  "changeme",
  "letmein123",
  "welcome123",
  "admin1234",
  "root1234",
  "user1234",
  "demo1234",
  "vulneraai",
  "vulneraai1",
  "polyguard",
  "polyguard1",
]);

/**
 * Returns an error message when the password fails the policy,
 * or `null` when the password is acceptable.
 */
export function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include an uppercase letter.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must include a lowercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must include a number.";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must include a symbol.";
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return "This password is too common. Please choose another.";
  }
  return null;
}
