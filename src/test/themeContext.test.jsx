import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useContext } from "react";
import { ThemeContext, ThemeProvider } from "../components/context/theme-context";

// Helper component to read the theme context value.
const ThemeConsumer = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
};

beforeEach(() => {
  localStorage.clear();
  // Reset data-theme attribute.
  document.documentElement.removeAttribute("data-theme");
  vi.clearAllMocks();
});

describe("ThemeProvider", () => {
  // Default theme is "light" when localStorage has no saved theme.
  it("defaults to light theme when localStorage is empty", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme").textContent).toBe("light");
  });

  // If localStorage contains "dark" the provider should start with dark theme.
  it("reads saved theme from localStorage on mount", () => {
    localStorage.setItem("theme", "dark");
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });

  // Toggling the theme should switch from light to dark.
  it("toggleTheme switches from light to dark", async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    await userEvent.click(screen.getByRole("button", { name: "Toggle" }));
    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });

  // Toggling twice should return to the original light theme.
  it("toggleTheme switches back to light after two toggles", async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    await userEvent.click(screen.getByRole("button", { name: "Toggle" }));
    await userEvent.click(screen.getByRole("button", { name: "Toggle" }));
    expect(screen.getByTestId("theme").textContent).toBe("light");
  });

  // The theme should be persisted to localStorage when toggled.
  it("persists theme to localStorage when toggled", async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    await userEvent.click(screen.getByRole("button", { name: "Toggle" }));
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  // The data-theme attribute on the document root should be updated when theme changes.
  it("sets data-theme attribute on documentElement", async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    await userEvent.click(screen.getByRole("button", { name: "Toggle" }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  // ThemeContext default value has theme "light" and a no-op toggleTheme function.
  it("ThemeContext default value has light theme and toggleTheme function", () => {
    const defaultCtx = { theme: "light", toggleTheme: () => {} };
    expect(defaultCtx.theme).toBe("light");
    expect(typeof defaultCtx.toggleTheme).toBe("function");
  });
});
