import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Input from "../components/shared/input/input";
import { VALIDATOR_REQUIRE, VALIDATOR_MINLENGTH } from "../utils/validators";

describe("Input", () => {
  // When element="input" the component renders a text input field.
  it("renders an input element when element is input", () => {
    render(
      <Input
        id="test"
        element="input"
        type="text"
        label="Name"
        onInput={vi.fn()}
      />
    );
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  // When element is not "input" (or omitted), a textarea is rendered instead.
  it("renders a textarea when element is not input", () => {
    render(
      <Input
        id="test"
        element="textarea"
        label="Bio"
        onInput={vi.fn()}
      />
    );
    expect(screen.getByLabelText("Bio").tagName).toBe("TEXTAREA");
  });

  // onInput is called on mount via useEffect with the initial id, value, and validity.
  // This allows parent forms to register the field's initial state.
  it("calls onInput on mount with initial values", () => {
    const onInput = vi.fn();
    render(
      <Input
        id="email"
        element="input"
        label="Email"
        initialValue="test@test.com"
        initialValid={true}
        onInput={onInput}
      />
    );
    expect(onInput).toHaveBeenCalledWith("email", "test@test.com", true);
  });

  // The error message is hidden until the field is touched (blurred).
  // This prevents showing errors before the user has interacted with the field.
  it("does not show error message before field is touched", () => {
    render(
      <Input
        id="name"
        element="input"
        label="Name"
        validators={[VALIDATOR_REQUIRE()]}
        errorText="Name is required"
        onInput={vi.fn()}
      />
    );
    expect(screen.queryByText("Name is required")).not.toBeInTheDocument();
  });

  // After the user blurs the field (touch), an invalid field shows the error message.
  it("shows error message when field is touched and invalid", async () => {
    render(
      <Input
        id="name"
        element="input"
        label="Name"
        validators={[VALIDATOR_REQUIRE()]}
        errorText="Name is required"
        onInput={vi.fn()}
      />
    );
    // Tab away from the field to trigger the blur/touch handler
    await userEvent.click(screen.getByLabelText("Name"));
    await userEvent.tab();
    expect(screen.getByText("Name is required")).toBeInTheDocument();
  });

  // After the user types a valid value, the error message disappears.
  it("hides error message when input becomes valid", async () => {
    render(
      <Input
        id="name"
        element="input"
        label="Name"
        validators={[VALIDATOR_MINLENGTH(3)]}
        errorText="Too short"
        onInput={vi.fn()}
      />
    );
    const input = screen.getByLabelText("Name");
    // Touch the field first to show the error
    await userEvent.click(input);
    await userEvent.tab();
    expect(screen.getByText("Too short")).toBeInTheDocument();
    // Now type a valid value — error should disappear
    await userEvent.type(input, "Hello");
    expect(screen.queryByText("Too short")).not.toBeInTheDocument();
  });

  // onInput is called with the updated value and validity as the user types.
  it("calls onInput with updated value when user types", async () => {
    const onInput = vi.fn();
    render(
      <Input
        id="name"
        element="input"
        label="Name"
        validators={[VALIDATOR_REQUIRE()]}
        onInput={onInput}
      />
    );
    await userEvent.type(screen.getByLabelText("Name"), "Hi");
    // onInput is called on every keystroke — last call should have the full value
    const calls = onInput.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toBe("name");  // id
    expect(lastCall[1]).toBe("Hi");    // value
    expect(lastCall[2]).toBe(true);    // isValid (non-empty passes REQUIRE)
  });
});
