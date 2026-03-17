import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRef } from "react";
import { useClickOutside } from "../hook/use-click-outside";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useClickOutside", () => {
  // Clicking outside the ref element should invoke the handler.
  it("calls handler when clicking outside the referenced element", () => {
    const handler = vi.fn();
    const outerDiv = document.createElement("div");
    const innerDiv = document.createElement("div");
    document.body.appendChild(outerDiv);
    document.body.appendChild(innerDiv);

    const ref = { current: innerDiv };

    renderHook(() => useClickOutside(ref, handler));

    // Simulate a mousedown on outerDiv (outside ref)
    const event = new MouseEvent("mousedown", { bubbles: true });
    Object.defineProperty(event, "target", { value: outerDiv, writable: false });
    document.dispatchEvent(event);

    expect(handler).toHaveBeenCalledTimes(1);

    document.body.removeChild(outerDiv);
    document.body.removeChild(innerDiv);
  });

  // Clicking inside the ref element should NOT invoke the handler.
  it("does not call handler when clicking inside the referenced element", () => {
    const handler = vi.fn();
    const innerDiv = document.createElement("div");
    const childSpan = document.createElement("span");
    innerDiv.appendChild(childSpan);
    document.body.appendChild(innerDiv);

    const ref = { current: innerDiv };

    renderHook(() => useClickOutside(ref, handler));

    // Simulate mousedown on childSpan (inside ref)
    const event = new MouseEvent("mousedown", { bubbles: true });
    Object.defineProperty(event, "target", { value: childSpan, writable: false });
    // We use innerDiv.contains to simulate the check — dispatch on document with
    // a target that innerDiv contains
    // Directly invoke the listener with mocked event so contains returns true
    const mockEvent = { target: childSpan };
    // Since we can't directly call the internal listener, test via DOM events:
    childSpan.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(innerDiv);
  });

  // When ref.current is null the handler should not be called (prevents errors on unmounted components).
  it("does not call handler when ref.current is null", () => {
    const handler = vi.fn();
    const ref = { current: null };

    renderHook(() => useClickOutside(ref, handler));

    const outerDiv = document.createElement("div");
    document.body.appendChild(outerDiv);
    outerDiv.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(outerDiv);
  });

  // On unmount the event listener should be removed — clicking outside after unmount should not call handler.
  it("removes the event listener on unmount", () => {
    const handler = vi.fn();
    const innerDiv = document.createElement("div");
    const outerDiv = document.createElement("div");
    document.body.appendChild(innerDiv);
    document.body.appendChild(outerDiv);
    const ref = { current: innerDiv };

    const { unmount } = renderHook(() => useClickOutside(ref, handler));
    unmount();

    outerDiv.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(innerDiv);
    document.body.removeChild(outerDiv);
  });

  // The hook registers a mousedown listener on the document.
  it("adds mousedown listener to document", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    const handler = vi.fn();
    const ref = { current: document.createElement("div") };

    renderHook(() => useClickOutside(ref, handler));

    expect(addSpy).toHaveBeenCalledWith("mousedown", expect.any(Function));
    addSpy.mockRestore();
  });
});
