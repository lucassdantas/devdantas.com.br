import { site } from "@/config/site";

export default function Clients({ label }: { label: string }) {
  return (
    <section className="clients" aria-label={label}>
      <p>{label}</p>
      <div className="marq">
        <div className="track">
          {site.clients.map((c) => <span key={c}>{c}</span>)}
          {site.clients.map((c) => <span key={"dup-" + c} aria-hidden="true">{c}</span>)}
        </div>
      </div>
    </section>
  );
}
