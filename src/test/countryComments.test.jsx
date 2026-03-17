import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../components/context/auth-context";
import CountryComments from "../components/user-countries/country-comments";

const mockAuth = {
  isLoggedIn: true,
  userId: "u1",
  token: "tok",
  name: "Alice",
  image: null,
  passportCountry: null,
};

const buildWrapper = (authValue) =>
  function Wrapper({ children }) {
    return (
      <MemoryRouter>
        <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
      </MemoryRouter>
    );
  };

beforeEach(() => vi.clearAllMocks());

const baseCountry = { code: "FR", name: "France", comments: [] };

describe("CountryComments", () => {
  // When there are no comments, the empty message is shown.
  it("shows no-comments message when list is empty", () => {
    render(
      <CountryComments
        country={baseCountry}
        canEdit={true}
        commentInput=""
        setCommentInput={vi.fn()}
        commentMutation={{ mutate: vi.fn(), isPending: false }}
        deleteCommentMutation={{ mutate: vi.fn(), isPending: false }}
      />,
      { wrapper: buildWrapper(mockAuth) }
    );
    expect(screen.getByText("No comments yet.")).toBeInTheDocument();
  });

  // Existing comments are rendered with author name and text.
  it("renders existing comments", () => {
    const country = {
      ...baseCountry,
      comments: [
        {
          id: "c1",
          text: "Great place!",
          user: { _id: "u2", name: "Bob" },
        },
      ],
    };
    render(
      <CountryComments
        country={country}
        canEdit={false}
        commentInput=""
        setCommentInput={vi.fn()}
        commentMutation={{ mutate: vi.fn(), isPending: false }}
        deleteCommentMutation={{ mutate: vi.fn(), isPending: false }}
      />,
      { wrapper: buildWrapper(mockAuth) }
    );
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Great place!")).toBeInTheDocument();
  });

  // Pressing Enter with a non-empty comment input calls the comment mutation.
  it("calls commentMutation on Enter key", async () => {
    const mutate = vi.fn();
    const setCommentInput = vi.fn();
    render(
      <CountryComments
        country={baseCountry}
        canEdit={false}
        commentInput="Hello"
        setCommentInput={setCommentInput}
        commentMutation={{ mutate, isPending: false }}
        deleteCommentMutation={{ mutate: vi.fn(), isPending: false }}
      />,
      { wrapper: buildWrapper(mockAuth) }
    );
    const input = screen.getByPlaceholderText("Add a comment...");
    await userEvent.type(input, "{Enter}");
    expect(mutate).toHaveBeenCalledWith({ code: "FR", text: "Hello" });
  });

  // The comment input is not rendered when the user is not logged in.
  it("hides comment input when not logged in", () => {
    const guestAuth = { ...mockAuth, isLoggedIn: false, userId: null };
    render(
      <CountryComments
        country={baseCountry}
        canEdit={false}
        commentInput=""
        setCommentInput={vi.fn()}
        commentMutation={{ mutate: vi.fn(), isPending: false }}
        deleteCommentMutation={{ mutate: vi.fn(), isPending: false }}
      />,
      { wrapper: buildWrapper(guestAuth) }
    );
    expect(
      screen.queryByPlaceholderText("Add a comment...")
    ).not.toBeInTheDocument();
  });

  // The delete button appears for the comment author's own comments.
  it("shows delete button for own comment", () => {
    const country = {
      ...baseCountry,
      comments: [
        { id: "c1", text: "My comment", user: { _id: "u1", name: "Alice" } },
      ],
    };
    render(
      <CountryComments
        country={country}
        canEdit={false}
        commentInput=""
        setCommentInput={vi.fn()}
        commentMutation={{ mutate: vi.fn(), isPending: false }}
        deleteCommentMutation={{ mutate: vi.fn(), isPending: false }}
      />,
      { wrapper: buildWrapper(mockAuth) }
    );
    expect(document.querySelector(".country-modal__comment-delete")).toBeInTheDocument();
  });

  // The delete button is NOT shown for comments by other users when canEdit is false.
  it("hides delete button for another user's comment (non-owner)", () => {
    const country = {
      ...baseCountry,
      comments: [
        { id: "c2", text: "Other comment", user: { _id: "u99", name: "Other" } },
      ],
    };
    render(
      <CountryComments
        country={country}
        canEdit={false}
        commentInput=""
        setCommentInput={vi.fn()}
        commentMutation={{ mutate: vi.fn(), isPending: false }}
        deleteCommentMutation={{ mutate: vi.fn(), isPending: false }}
      />,
      { wrapper: buildWrapper(mockAuth) }
    );
    expect(
      document.querySelector(".country-modal__comment-delete")
    ).not.toBeInTheDocument();
  });

  // Clicking the delete button calls deleteCommentMutation.
  it("calls deleteCommentMutation when delete button clicked", async () => {
    const deleteMutate = vi.fn();
    const country = {
      ...baseCountry,
      comments: [
        { id: "c1", text: "My comment", user: { _id: "u1", name: "Alice" } },
      ],
    };
    render(
      <CountryComments
        country={country}
        canEdit={false}
        commentInput=""
        setCommentInput={vi.fn()}
        commentMutation={{ mutate: vi.fn(), isPending: false }}
        deleteCommentMutation={{ mutate: deleteMutate, isPending: false }}
      />,
      { wrapper: buildWrapper(mockAuth) }
    );
    await userEvent.click(document.querySelector(".country-modal__comment-delete"));
    expect(deleteMutate).toHaveBeenCalledWith({ code: "FR", commentId: "c1" });
  });
});
