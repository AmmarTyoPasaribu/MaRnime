/**
 * Re-mounts on every navigation, replaying a short slide-up page transition.
 * Pure CSS (fill-mode: backwards) so server HTML is visible immediately and no
 * transform lingers afterwards (which would break position: fixed children).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
