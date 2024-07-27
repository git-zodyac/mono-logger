import { COLORS } from "./colors";

function genHash() {
  const ts = Math.floor(new Date().getTime() * Math.random() * 100000);
  return ts.toString(16).substring(8);
}

test("Should be defined", () => {
  expect(COLORS).toBeDefined();
});

test("Verbose should contain input string", () => {
  const hash = genHash();
  const res = COLORS.debug(hash);

  expect(res).toMatch(new RegExp(hash, "g"));
});

test("Verbose should contain input string", () => {
  const hash = genHash();
  const res = COLORS.verbose(hash);

  expect(res).toMatch(new RegExp(hash, "g"));
});

test("Info should contain input string", () => {
  const hash = genHash();
  const res = COLORS.info(hash);

  expect(res).toMatch(new RegExp(hash, "g"));
});

test("Warn should contain input string", () => {
  const hash = genHash();
  const res = COLORS.warn(hash);

  expect(res).toMatch(new RegExp(hash, "g"));
});

test("Error should contain input string", () => {
  const hash = genHash();
  const res = COLORS.error(hash);

  expect(res).toMatch(new RegExp(hash, "g"));
});

test("Fatal should contain input string", () => {
  const hash = genHash();
  const res = COLORS.fatal(hash);

  expect(res).toMatch(new RegExp(hash, "g"));
});
