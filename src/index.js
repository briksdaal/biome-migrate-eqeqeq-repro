export function f(a, b, x) {
  if (typeof a == "object" && typeof b == "object") return 1;
  if (x == null) return 2;
  return 3;
}
