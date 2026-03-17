import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useImageUpload } from "../hook/use-image-upload";

// Mock the uploadFiles API so no real XHR is made.
vi.mock("../api/upload", () => ({
  uploadFiles: vi.fn(),
}));

// Mock fileKey utility.
vi.mock("../utils/fileKey", () => ({
  fileKey: vi.fn((f) => `${f.name}-${f.size}`),
}));

import { uploadFiles } from "../api/upload";

const makeFile = (name, size = 100) => {
  const f = new File(["x".repeat(size)], name, { type: "image/png" });
  Object.defineProperty(f, "size", { value: size });
  return f;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useImageUpload", () => {
  // The hook should expose the expected API surface.
  it("exposes imageInputHandler, isUploading, uploadProgress, uploadError, clearUploadError", () => {
    const { result } = renderHook(() => useImageUpload(vi.fn()));
    expect(typeof result.current.imageInputHandler).toBe("function");
    expect(result.current.isUploading).toBe(false);
    expect(result.current.uploadProgress).toBeNull();
    expect(result.current.uploadError).toBeNull();
    expect(typeof result.current.clearUploadError).toBe("function");
  });

  // When called with no new files (all already uploaded), onInputCallback fires immediately.
  it("calls onInputCallback immediately when no new files are present", async () => {
    const onInput = vi.fn();
    const { result } = renderHook(() => useImageUpload(onInput));

    await act(async () => {
      await result.current.imageInputHandler("photos", [], true);
    });

    expect(onInput).toHaveBeenCalledWith("photos", [], false);
  });

  // When new files are provided, uploadFiles is called.
  it("calls uploadFiles with new files", async () => {
    uploadFiles.mockResolvedValueOnce({ paths: ["/uploads/img1.png"] });
    const onInput = vi.fn();
    const { result } = renderHook(() => useImageUpload(onInput));

    const file = makeFile("photo.png");

    await act(async () => {
      await result.current.imageInputHandler("photos", [file], true);
    });

    expect(uploadFiles).toHaveBeenCalledTimes(1);
  });

  // After successful upload, isUploading should return to false.
  it("isUploading returns to false after successful upload", async () => {
    uploadFiles.mockResolvedValueOnce({ paths: ["/uploads/img1.png"] });
    const { result } = renderHook(() => useImageUpload(vi.fn()));

    const file = makeFile("photo.png");

    await act(async () => {
      await result.current.imageInputHandler("photos", [file], true);
    });

    expect(result.current.isUploading).toBe(false);
  });

  // When uploadFiles rejects, uploadError should be set.
  it("sets uploadError when uploadFiles rejects", async () => {
    uploadFiles.mockRejectedValueOnce(new Error("Network error"));
    const onInput = vi.fn();
    const { result } = renderHook(() => useImageUpload(onInput));

    const file = makeFile("photo.png");

    await act(async () => {
      await result.current.imageInputHandler("photos", [file], true);
    });

    expect(result.current.uploadError).toBe("Network error");
  });

  // clearUploadError should reset uploadError back to null.
  it("clearUploadError resets uploadError to null", async () => {
    uploadFiles.mockRejectedValueOnce(new Error("Fail"));
    const { result } = renderHook(() => useImageUpload(vi.fn()));

    await act(async () => {
      await result.current.imageInputHandler("photos", [makeFile("f.png")], true);
    });

    expect(result.current.uploadError).toBeTruthy();

    act(() => {
      result.current.clearUploadError();
    });

    expect(result.current.uploadError).toBeNull();
  });

  // onInputCallback receives the uploaded path after a successful upload.
  it("onInputCallback is called with uploaded paths on success", async () => {
    uploadFiles.mockResolvedValueOnce({ paths: ["/uploads/a.png"] });
    const onInput = vi.fn();
    const { result } = renderHook(() => useImageUpload(onInput));

    const file = makeFile("a.png");

    await act(async () => {
      await result.current.imageInputHandler("photos", [file], true);
    });

    expect(onInput).toHaveBeenCalledWith("photos", ["/uploads/a.png"], true);
  });
});
