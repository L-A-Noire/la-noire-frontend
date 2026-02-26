import { useAuthStore } from "@/stores/auth.store";

const mockSession = {
  access: "eyJhbGciOiJIUzI1NiJ9.mock-access-token",
  refresh: "eyJhbGciOiJIUzI1NiJ9.mock-refresh-token",
  user: {
    id: 1,
    username: "cole_phelps",
    email: "cole@lapd.com",
    phone: "09121234567",
    first_name: "Cole",
    last_name: "Phelps",
    national_id: "0012345678",
    role: 2,
    role_title: "Detective",
  },
};

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({ session: null });
  });

  it("should have null session initially", () => {
    const { session } = useAuthStore.getState();
    expect(session).toBeNull();
  });

  it("should set session correctly", () => {
    useAuthStore.getState().setSession(mockSession as any);

    const { session } = useAuthStore.getState();
    expect(session).toEqual(mockSession);
  });

  it("should return access token from session", () => {
    useAuthStore.getState().setSession(mockSession as any);

    const token = useAuthStore.getState().accessToken();
    expect(token).toBe(mockSession.access);
  });

  it("should return undefined access token when no session", () => {
    const token = useAuthStore.getState().accessToken();
    expect(token).toBeUndefined();
  });

  it("should clear session correctly", () => {
    useAuthStore.getState().setSession(mockSession as any);
    expect(useAuthStore.getState().session).not.toBeNull();

    useAuthStore.getState().clearSession();
    expect(useAuthStore.getState().session).toBeNull();
  });

  it("should return undefined access token after clearing session", () => {
    useAuthStore.getState().setSession(mockSession as any);
    useAuthStore.getState().clearSession();

    const token = useAuthStore.getState().accessToken();
    expect(token).toBeUndefined();
  });
});
