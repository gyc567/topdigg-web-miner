import "@testing-library/jest-dom";

// jsdom doesn't implement window.alert; stub globally so component tests don't spam stderr.
if (typeof window !== "undefined") {
  window.alert = () => {};
}
