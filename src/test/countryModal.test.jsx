import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../components/context/auth-context";

// React Query.
vi.mock("@tanstack/react-query", async (importActual) => {
  const actual = await importActual();
  return {
    ...actual,
    useMutation: vi.fn(() => ({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    })),
    useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() })),
  };
});

// API stubs.
vi.mock("../api/user", () => ({
  updateCountryImages: vi.fn(),
  updateCountry: vi.fn(),
  removeUserCountry: vi.fn(),
  toggleLikeCountry: vi.fn(),
  addCountryComment: vi.fn(),
  deleteCountryComment: vi.fn(),
}));
vi.mock("../api/cities", () => ({
  fetchCitiesForCountry: vi.fn(() => Promise.resolve([])),
}));

// Scroll lock hook stub (no-op).
vi.mock("../hook/use-scroll-lock", () => ({
  default: vi.fn(),
}));

// Image upload hook stub.
vi.mock("../hook/use-image-upload", () => ({
  useImageUpload: vi.fn(() => ({
    imageInputHandler: vi.fn(),
    uploadingKeys: [],
    uploadProgress: null,
    uploadError: null,
    clearUploadError: vi.fn(),
  })),
}));

// Stub sub-components using paths relative to the test file location.
vi.mock("../components/user-countries/country-gallery", () => ({
  default: () => <div data-testid="country-gallery" />,
}));
vi.mock("../components/user-countries/country-cities", () => ({
  default: () => <div data-testid="country-cities" />,
}));
vi.mock("../components/user-countries/country-comments", () => ({
  default: () => <div data-testid="country-comments" />,
}));
vi.mock("../components/shared/starRating/starRating", () => ({
  default: ({ value }) => <span data-testid="star-rating">{value}</span>,
}));

import CountryModal from "../components/user-countries/country-modal";

const mockAuth = {
  isLoggedIn: true,
  userId: "u1",
  token: "tok",
  name: "Alice",
  image: null,
  passportCountry: null,
};

const mockCountry = {
  code: "FR",
  name: "France",
  images: [],
  cities: [],
  comments: [],
  likes: [],
  story: "",
  ratings: {},
};

const onClose = vi.fn();

const wrapper = ({ children }) => (
  <MemoryRouter>
    <AuthContext.Provider value={mockAuth}>{children}</AuthContext.Provider>
  </MemoryRouter>
);

beforeEach(() => vi.clearAllMocks());

describe("CountryModal", () => {
  // The country name must appear in the modal header.
  it("renders the country name", () => {
    render(
      <CountryModal
        country={mockCountry}
        canEdit={true}
        viewedUserId="u1"
        onClose={onClose}
      />,
      { wrapper }
    );
    expect(screen.getByText("France")).toBeInTheDocument();
  });

  // The ratings section must be present.
  it("renders the ratings section", () => {
    render(
      <CountryModal
        country={mockCountry}
        canEdit={true}
        viewedUserId="u1"
        onClose={onClose}
      />,
      { wrapper }
    );
    expect(screen.getByText("My Ratings")).toBeInTheDocument();
  });

  // The gallery, cities, and comments sub-components are rendered.
  it("renders gallery, cities, and comments sub-components", () => {
    render(
      <CountryModal
        country={mockCountry}
        canEdit={true}
        viewedUserId="u1"
        onClose={onClose}
      />,
      { wrapper }
    );
    expect(screen.getByTestId("country-gallery")).toBeInTheDocument();
    expect(screen.getByTestId("country-cities")).toBeInTheDocument();
    expect(screen.getByTestId("country-comments")).toBeInTheDocument();
  });

  // Clicking the close button calls onClose.
  it("calls onClose when close button is clicked", async () => {
    render(
      <CountryModal
        country={mockCountry}
        canEdit={true}
        viewedUserId="u1"
        onClose={onClose}
      />,
      { wrapper }
    );
    await userEvent.click(screen.getByRole("button", { name: "×" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // Save and Remove buttons appear when canEdit is true.
  it("shows Save and Remove Country buttons for owner", () => {
    render(
      <CountryModal
        country={mockCountry}
        canEdit={true}
        viewedUserId="u1"
        onClose={onClose}
      />,
      { wrapper }
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove Country" })
    ).toBeInTheDocument();
  });

  // No edit actions should appear when canEdit is false (viewing another user's country).
  it("hides Save and Remove buttons when not owner", () => {
    render(
      <CountryModal
        country={mockCountry}
        canEdit={false}
        viewedUserId="u2"
        onClose={onClose}
      />,
      { wrapper }
    );
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Remove Country" })
    ).not.toBeInTheDocument();
  });

  // The travel story textarea is visible in edit mode.
  it("shows story textarea in edit mode", () => {
    render(
      <CountryModal
        country={mockCountry}
        canEdit={true}
        viewedUserId="u1"
        onClose={onClose}
      />,
      { wrapper }
    );
    expect(
      screen.getByPlaceholderText("Write about your trip...")
    ).toBeInTheDocument();
  });

  // Clicking the backdrop calls onClose.
  it("calls onClose when backdrop is clicked", async () => {
    render(
      <CountryModal
        country={mockCountry}
        canEdit={true}
        viewedUserId="u1"
        onClose={onClose}
      />,
      { wrapper }
    );
    const backdrop = document.querySelector(".country-modal__backdrop");
    await userEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });
});
