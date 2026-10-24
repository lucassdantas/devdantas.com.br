import { site } from "@/config/site";

export default function Logo({ href = "#top" }: { href?: string }) {
  return (
    <a className="logo" href={href} aria-label={site.brand}>
      <span className="wm">dantas<i></i></span><span className="wsub">studio</span>
    </a>
  );
}
