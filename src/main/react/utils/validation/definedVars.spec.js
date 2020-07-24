import { isDefined, isUndefined, isEmptyObject } from "./definedVars";

describe("isUndefined() util function", () => {
  it("should validate undefined parameters and return true", () => {
    expect(isUndefined(undefined)).toBeDefined();
    expect(isUndefined(undefined)).toBeTruthy();
  });

  it("should validate defined paramters and return false", () => {
    expect(isUndefined(0)).toBeFalsy();
    expect(isUndefined(1)).toBeFalsy();
    expect(isUndefined(NaN)).toBeFalsy();
    expect(isUndefined("")).toBeFalsy();
    expect(isUndefined(String(1))).toBeFalsy();
    expect(isUndefined(true)).toBeFalsy();
    expect(isUndefined(false)).toBeFalsy();
    expect(isUndefined({})).toBeFalsy();
    expect(isUndefined([])).toBeFalsy();
    expect(isUndefined(Array(1, 2, 3))).toBeFalsy(); // eslint-disable-line no-array-constructor
    expect(isUndefined(null)).toBeFalsy();
  });
});

describe("isDefined() util function", () => {
  it("should validate passed parameters as truthy", () => {
    expect(isDefined(0)).toBeTruthy();
    expect(isDefined(1)).toBeTruthy();
    expect(isDefined(NaN)).toBeTruthy();
    expect(isDefined("")).toBeTruthy();
    expect(isDefined(String(1))).toBeTruthy();
    expect(isDefined(true)).toBeTruthy();
    expect(isDefined(false)).toBeTruthy();
    expect(isDefined({})).toBeTruthy();
    expect(isDefined([])).toBeTruthy();
    expect(isDefined(Array(1, 2, 3))).toBeTruthy(); // eslint-disable-line no-array-constructor
    expect(isDefined(null)).toBeDefined();
    expect(isDefined(null)).toBeTruthy();
  });

  it("should validate passed parameters as false", () => {
    expect(isDefined(undefined)).toBeDefined();
    expect(isDefined(undefined)).toBeFalsy();
  });
});

describe("isEmptyObject() util function", () => {
  it("should evaluate an empty object as truthy", () => {
    expect(isEmptyObject({})).toBeDefined();
    expect(isEmptyObject({})).toBeTruthy();
  });

  it("should evaluate an non-epmty object as falsy", () => {
    expect(isEmptyObject({ item: 3 })).toBeDefined();
    expect(isEmptyObject({ item: 3 })).toBeFalsy();
  });

  it("should throw an TypeError if no object is passed as parameter", () => {
    expect(() => isEmptyObject(13)).toThrow(TypeError);
  });
});
