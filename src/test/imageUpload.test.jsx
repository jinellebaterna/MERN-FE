import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ImageUpload from "../components/shared/imageUpload/imageUpload";

// Stub FileReader so readAsDataURL resolves synchronously in jsdom.
class MockFileReader {
  readAsDataURL() {
    this.result = "data:image/png;base64,abc";
    this.onload?.();
  }
}
vi.stubGlobal("FileReader", MockFileReader);

const makeFile = (name = "photo.jpg", size = 1024, type = "image/jpeg") => {
  const f = new File(["x".repeat(size)], name, { type });
  Object.defineProperty(f, "size", { value: size });
  return f;
};

const onInput = vi.fn();

beforeEach(() => vi.clearAllMocks());

describe("ImageUpload", () => {
  // Renders the dropzone with instructional text when no files are selected.
  it("renders the dropzone when no files are selected", () => {
    render(<ImageUpload id="upload" onInput={onInput} />);
    expect(screen.getByText(/drag & drop/i)).toBeInTheDocument();
  });

  // Renders 'images' text when multiple prop is set.
  it("shows 'images' in dropzone text when multiple is true", () => {
    render(<ImageUpload id="upload" onInput={onInput} multiple />);
    expect(screen.getByText(/drag & drop images here/i)).toBeInTheDocument();
  });

  // Picking a file (single mode) calls onInput with the file and isValid=true.
  it("calls onInput with the picked file in single mode", () => {
    render(<ImageUpload id="upload" onInput={onInput} />);
    const input = document.querySelector('input[type="file"]');
    const file = makeFile("a.jpg");
    fireEvent.change(input, { target: { files: [file] } });
    expect(onInput).toHaveBeenCalledWith("upload", file, true);
  });

  // Picking files in multiple mode calls onInput with an array.
  it("calls onInput with an array in multiple mode", () => {
    render(<ImageUpload id="upload" onInput={onInput} multiple />);
    const input = document.querySelector('input[type="file"]');
    const file = makeFile("b.jpg");
    fireEvent.change(input, { target: { files: [file] } });
    expect(onInput).toHaveBeenCalledWith("upload", [file], true);
  });

  // A file exceeding 10MB is skipped and a warning is shown.
  it("shows a warning and skips files over 10MB", () => {
    render(<ImageUpload id="upload" onInput={onInput} multiple />);
    const input = document.querySelector('input[type="file"]');
    const bigFile = makeFile("big.jpg", 11 * 1024 * 1024);
    fireEvent.change(input, { target: { files: [bigFile] } });
    expect(screen.getByText(/exceeds 10MB/i)).toBeInTheDocument();
    // onInput called with empty array since all files were skipped.
    expect(onInput).toHaveBeenCalledWith("upload", [], false);
  });

  // A duplicate file (same name+size) shows a warning and is not added again.
  it("shows a duplicate warning when the same file is added twice", () => {
    render(<ImageUpload id="upload" onInput={onInput} multiple />);
    const input = document.querySelector('input[type="file"]');
    const file = makeFile("dup.jpg", 512);
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByText(/already selected/i)).toBeInTheDocument();
  });

  // Dropping non-image files does nothing.
  it("ignores non-image files on drop", () => {
    render(<ImageUpload id="upload" onInput={onInput} />);
    const dropzone = document.querySelector(".image-upload__dropzone");
    const pdfFile = new File(["x"], "doc.pdf", { type: "application/pdf" });
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [pdfFile] },
    });
    expect(onInput).not.toHaveBeenCalled();
  });
});
