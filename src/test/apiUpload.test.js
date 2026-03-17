import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { uploadFiles } from "../api/upload";

// uploadFiles uses XMLHttpRequest internally.
// We create a mock XHR class so `new XMLHttpRequest()` returns a controllable object.

let xhrMock;

function MockXMLHttpRequest() {
  xhrMock = this;
  this.upload = { onprogress: null };
  this.onload = null;
  this.onerror = null;
  this.open = vi.fn();
  this.send = vi.fn();
  this.status = 200;
  this.responseText = JSON.stringify({ paths: ["/uploads/img.png"] });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("XMLHttpRequest", MockXMLHttpRequest);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("uploadFiles", () => {
  // uploadFiles should call xhr.open with POST and the correct upload URL.
  it("opens POST request to /api/uploads endpoint", () => {
    uploadFiles([new File(["x"], "a.png")]);
    expect(xhrMock.open).toHaveBeenCalledWith(
      "POST",
      expect.stringContaining("/api/uploads")
    );
  });

  // uploadFiles should call xhr.send with a FormData object.
  it("sends FormData containing the files", () => {
    uploadFiles([new File(["x"], "a.png")]);
    const sentArg = xhrMock.send.mock.calls[0][0];
    expect(sentArg).toBeInstanceOf(FormData);
  });

  // On successful response (status 200) it resolves with parsed JSON.
  it("resolves with parsed JSON on status 200", async () => {
    const promise = uploadFiles([new File(["x"], "a.png")]);
    xhrMock.status = 200;
    xhrMock.responseText = JSON.stringify({ paths: ["/uploads/img.png"] });
    xhrMock.onload();
    const result = await promise;
    expect(result).toEqual({ paths: ["/uploads/img.png"] });
  });

  // On 401 response, uploadFiles should reject with "UNAUTHORIZED".
  it("rejects with UNAUTHORIZED on 401 status", async () => {
    const promise = uploadFiles([new File(["x"], "a.png")]);
    xhrMock.status = 401;
    xhrMock.onload();
    await expect(promise).rejects.toThrow("UNAUTHORIZED");
  });

  // On a non-2xx status code, it rejects with the server error message.
  it("rejects with server error message on non-2xx status", async () => {
    const promise = uploadFiles([new File(["x"], "a.png")]);
    xhrMock.status = 500;
    xhrMock.responseText = JSON.stringify({ message: "Internal Server Error" });
    xhrMock.onload();
    await expect(promise).rejects.toThrow("Internal Server Error");
  });

  // When responseText is not valid JSON for an error response, rejects with "Upload failed".
  it("rejects with Upload failed when error response is not valid JSON", async () => {
    const promise = uploadFiles([new File(["x"], "a.png")]);
    xhrMock.status = 500;
    xhrMock.responseText = "not json";
    xhrMock.onload();
    await expect(promise).rejects.toThrow("Upload failed");
  });

  // Network errors (xhr.onerror) should reject with "Upload failed".
  it("rejects with Upload failed on XHR network error", async () => {
    const promise = uploadFiles([new File(["x"], "a.png")]);
    xhrMock.onerror();
    await expect(promise).rejects.toThrow("Upload failed");
  });

  // When an onProgress callback is provided it should be attached to xhr.upload.onprogress.
  it("attaches onprogress handler when onProgress callback is provided", () => {
    const onProgress = vi.fn();
    uploadFiles([new File(["x"], "a.png")], onProgress);
    expect(xhrMock.upload.onprogress).toBeTypeOf("function");
  });

  // The onProgress callback receives a fraction (0–1) computed from e.loaded / e.total.
  it("calls onProgress with loaded/total fraction", () => {
    const onProgress = vi.fn();
    uploadFiles([new File(["x"], "a.png")], onProgress);
    xhrMock.upload.onprogress({ lengthComputable: true, loaded: 50, total: 100 });
    expect(onProgress).toHaveBeenCalledWith(0.5);
  });

  // When onProgress is not provided the upload.onprogress property should remain null.
  it("does not attach onprogress when no callback is provided", () => {
    uploadFiles([new File(["x"], "a.png")]);
    expect(xhrMock.upload.onprogress).toBeNull();
  });

  // Multiple files should all be appended to the FormData.
  it("appends multiple files to FormData", () => {
    const appendSpy = vi.fn();
    const OriginalFormData = globalThis.FormData;
    vi.stubGlobal("FormData", function () {
      this.append = appendSpy;
    });

    uploadFiles([new File(["a"], "a.png"), new File(["b"], "b.png")]);
    expect(appendSpy).toHaveBeenCalledTimes(2);

    vi.stubGlobal("FormData", OriginalFormData);
  });
});
