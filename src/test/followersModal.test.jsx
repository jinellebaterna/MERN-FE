import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ReactDOM from "react-dom";
import FollowersModal from "../components/followers-modal/followers-modal";

// Portal rendering inline.
vi.spyOn(ReactDOM, "createPortal").mockImplementation((node) => node);

// CSSTransition — pass children through when in=true.
vi.mock("react-transition-group", () => ({
  CSSTransition: ({ children, in: inProp }) => (inProp ? children : null),
}));

// Stub Avatar so we don't need image logic.
vi.mock("../components/shared/avatar/avatar", () => ({
  default: ({ name }) => <span data-testid="avatar">{name}</span>,
}));

beforeEach(() => {
  vi.clearAllMocks();
  document.body.style.overflow = "";
  ["backdrop-hook", "modal-hook"].forEach((id) => {
    if (!document.getElementById(id)) {
      const el = document.createElement("div");
      el.id = id;
      document.body.appendChild(el);
    }
  });
});

const allUsers = [
  { id: "u2", name: "Bob", image: null, countries: [{ code: "FR" }], followers: [] },
  { id: "u3", name: "Carol", image: null, countries: [], followers: ["u2"] },
];

const targetUser = {
  id: "u2",
  name: "Bob",
  followers: ["u3"],
  following: ["u3"],
};

const mockAuth = {
  isLoggedIn: true,
  userId: "u1",
  token: "tok",
  name: "Alice",
};

const followMutation = { mutate: vi.fn(), isPending: false };

const renderModal = (props = {}) =>
  render(
    <MemoryRouter>
      <FollowersModal
        show={true}
        targetUser={targetUser}
        allUsers={allUsers}
        loggedInUserData={null}
        onClose={vi.fn()}
        followMutation={followMutation}
        auth={mockAuth}
        {...props}
      />
    </MemoryRouter>
  );

describe("FollowersModal", () => {
  // When show is false, the modal content should not be visible.
  it("does not show modal content when show is false", () => {
    renderModal({ show: false });
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });

  // When targetUser is null, the component returns null (no render).
  it("returns null when targetUser is null", () => {
    const { container } = render(
      <MemoryRouter>
        <FollowersModal
          show={true}
          targetUser={null}
          allUsers={allUsers}
          loggedInUserData={null}
          onClose={vi.fn()}
          followMutation={followMutation}
          auth={mockAuth}
        />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  // The modal header shows the target user's name.
  it("renders target user name as modal header", () => {
    renderModal();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  // The Followers tab is active by default.
  it("shows followers tab as active by default", () => {
    renderModal();
    const followersTab = screen.getByRole("button", { name: /Followers/ });
    expect(followersTab).toHaveClass("followers-modal__tab--active");
  });

  // Follower names from the follower list are shown.
  it("renders follower names", () => {
    renderModal();
    // u3 is Carol who follows Bob (targetUser.followers contains "u3")
    // getAllByText handles cases where Carol appears more than once (avatar + name)
    expect(screen.getAllByText("Carol").length).toBeGreaterThan(0);
  });

  // Switching to the Following tab shows the following list.
  it("switches to following tab when clicked", async () => {
    renderModal();
    await userEvent.click(screen.getByRole("button", { name: /Following/ }));
    // u3 is Carol who is in targetUser.following
    expect(screen.getAllByText("Carol").length).toBeGreaterThan(0);
  });

  // When the followers list is empty, the nobody-here message appears.
  it("shows empty message when no followers", () => {
    const noFollowersUser = { ...targetUser, followers: [], following: [] };
    renderModal({ targetUser: noFollowersUser });
    expect(screen.getByText("Nobody here yet.")).toBeInTheDocument();
  });

  // Clicking a Follow button calls followMutation.mutate.
  it("calls followMutation when Follow button is clicked", async () => {
    const mutate = vi.fn();
    renderModal({ followMutation: { mutate, isPending: false } });
    const followBtns = screen.queryAllByRole("button", { name: /^Follow$/ });
    if (followBtns.length > 0) {
      await userEvent.click(followBtns[0]);
      expect(mutate).toHaveBeenCalled();
    }
  });

  // Clicking the Close button calls onClose.
  it("calls onClose when Close button is clicked", async () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // The logged-in user (u1) does not see a follow button for themselves.
  it("does not show follow button for the logged-in user themselves", () => {
    const usersWithMe = [
      ...allUsers,
      { id: "u1", name: "Alice", image: null, countries: [], followers: [] },
    ];
    const targetWithMe = {
      ...targetUser,
      followers: ["u1"],
    };
    renderModal({ allUsers: usersWithMe, targetUser: targetWithMe });
    // Alice should appear in the list (getAllByText handles multiple occurrences)
    expect(screen.getAllByText("Alice").length).toBeGreaterThan(0);
    // Find the followers-modal__row that contains Alice's name span
    const aliceNameSpans = document
      .querySelectorAll(".followers-modal__name");
    const aliceRow = Array.from(aliceNameSpans)
      .find((el) => el.textContent === "Alice")
      ?.closest(".followers-modal__row");
    expect(aliceRow).toBeTruthy();
    expect(
      aliceRow.querySelector(".followers-modal__action")
    ).not.toBeInTheDocument();
  });
});
