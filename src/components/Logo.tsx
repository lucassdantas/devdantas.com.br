import { site } from "@/config/site";

export default function Logo() {
  return (
    <a className="logo" href="#top" aria-label={site.brand}>
      <span className="wm">dantas<i></i></span><span className="wsub">studio</span>
    </a>
  );
}
