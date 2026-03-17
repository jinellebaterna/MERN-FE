import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import CountryGallery from "../components/user-countries/country-gallery";

// Stub ImageUpload to avoid file-input complexity.
vi.mock("../components/shared/imageUpload/imageUpload", () => ({
  default: ({ id }) => <input data-testid={`image-upload-${id}`} type="file" />,
}));

beforeEach(() => vi.clearAllMocks());

const baseProps = {
  imageUploadKey: 0,
  imageInputHandler: vi.fn(),
  uploadingKeys: [],
  uploadProgress: null,
  uploadError: null,
  clearUploadError: vi.fn(),
  onRemoveImage: vi.fn(),
};

describe("CountryGallery", () => {
  // When no images exist, the placeholder text should be shown.
  it("shows no-photos message when images array is empty", () => {
    render(
      <CountryGallery
        country={{ code: "FR", name: "France", images: [] }}
        canEdit={false}
        {...baseProps}
      />
    );
    expect(screen.getByText("No photos yet.")).toBeInTheDocument();
  });

  // Existing images are rendered as <img> elements.
  it("renders images when present", () => {
    render(
      <CountryGallery
        country={{ code: "FR", name: "France", images: ["photo1.jpg", "photo2.jpg"] }}
        canEdit={false}
        {...baseProps}
      />
    );
    const imgs = screen.getAllByRole("img");
    expect(imgs).toHaveLength(2);
  });

  // When canEdit is true, the Add Photos section and upload widget appear.
  it("shows upload section when canEdit is true", () => {
    render(
      <CountryGallery
        country={{ code: "FR", name: "France", images: [] }}
        canEdit={true}
        {...baseProps}
      />
    );
    expect(screen.getByText("Add Photos")).toBeInTheDocument();
    expect(screen.getByTestId("image-upload-country-images")).toBeInTheDocument();
  });

  // When canEdit is false, the Add Photos section should not render.
  it("hides upload section when canEdit is false", () => {
    render(
      <CountryGallery
        country={{ code: "FR", name: "France", images: [] }}
        canEdit={false}
        {...baseProps}
      />
    );
    expect(screen.queryByText("Add Photos")).not.toBeInTheDocument();
  });

  // Remove buttons appear on each photo when canEdit is true.
  it("renders remove buttons for each image when canEdit is true", () => {
    render(
      <CountryGallery
        country={{ code: "FR", name: "France", images: ["a.jpg", "b.jpg"] }}
        canEdit={true}
        {...baseProps}
      />
    );
    const removeBtns = document.querySelectorAll(".country-modal__remove-photo");
    expect(removeBtns).toHaveLength(2);
  });

  // Upload error message is shown when uploadError is provided.
  it("shows upload error message when uploadError is set", () => {
    render(
      <CountryGallery
        country={{ code: "FR", name: "France", images: [] }}
        canEdit={true}
        {...baseProps}
        uploadError="Upload failed"
      />
    );
    expect(screen.getByText("Upload failed")).toBeInTheDocument();
  });

  // Upload progress bar is shown when uploadProgress is a number.
  it("shows progress bar when uploadProgress is set", () => {
    render(
      <CountryGallery
        country={{ code: "FR", name: "France", images: [] }}
        canEdit={true}
        {...baseProps}
        uploadProgress={45}
      />
    );
    expect(screen.getByText(/Uploading\.\.\. 45%/)).toBeInTheDocument();
  });
});
