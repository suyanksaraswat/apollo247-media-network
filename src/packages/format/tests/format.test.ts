import { formatCount, formatINR, formatMultiple, formatPct } from "../index";

describe("formatINR", () => {
  it("shows crores with one decimal", () => {
    expect(formatINR(25.46e7)).toBe("₹25.5 cr");
  });

  it("drops a trailing .0", () => {
    expect(formatINR(4e7)).toBe("₹4 cr");
  });

  it("shows lakhs", () => {
    expect(formatINR(2_500_000)).toBe("₹25 lakh");
    expect(formatINR(150_000)).toBe("₹1.5 lakh");
  });

  it("groups smaller amounts the Indian way", () => {
    expect(formatINR(8000)).toBe("₹8,000");
    expect(formatINR(99_999.4)).toBe("₹99,999");
  });

  it("puts the minus sign before the rupee symbol", () => {
    expect(formatINR(-2_500_000)).toBe("-₹25 lakh");
  });
});

describe("formatCount", () => {
  it("scales large counts to crores and lakhs", () => {
    expect(formatCount(12_000_000)).toBe("1.2 cr");
    expect(formatCount(450_000)).toBe("4.5 lakh");
  });

  it("groups small counts the Indian way", () => {
    expect(formatCount(12_300)).toBe("12,300");
  });
});

describe("formatPct", () => {
  it("turns a fraction into a percentage with one decimal by default", () => {
    expect(formatPct(0.081)).toBe("8.1%");
  });

  it("accepts a number of decimals", () => {
    expect(formatPct(0.12345, 2)).toBe("12.35%");
    expect(formatPct(0.5, 0)).toBe("50%");
  });
});

describe("formatMultiple", () => {
  it("shows a return multiple", () => {
    expect(formatMultiple(2.4)).toBe("2.4×");
    expect(formatMultiple(2)).toBe("2.0×");
  });
});
