import type { Dictionary } from "@/i18n";
import { waLink } from "@/lib/whatsapp";
import { ArrowIcon, ShieldIcon } from "./Icons";
import ScanBox from "./ScanBox";
import SplitWords from "./SplitWords";

export default function Security({ t, waText }: { t: Dictionary["security"]; waText: string }) {
  return (
    <section className="navy" id="seguranca">
      <div className="wrap secgrid">
        <div className="rv">
          <span className="kicker mono full"><b>03</b>{t.kicker}</span>
          <SplitWords text={t.title} />
          <p className="lead">{t.sub}</p>
          <ul className="chk">
            {t.list.map((x) => <li key={x}><ShieldIcon />{x}</li>)}
          </ul>
          {/* "Sem promessa milagrosa": texto de proteção legal/comercial — não alterar sem revisar. */}
          <div className="note"><b>{t.noteTitle}</b><p>{t.note}</p></div>
          <a className="btn btn-l" href={waLink(waText)} target="_blank" rel="noopener noreferrer">{t.cta}<ArrowIcon /></a>
        </div>
        <ScanBox title={t.scanTitle} items={t.scan} done={t.scanDone} scanning={t.scanning} />
      </div>
    </section>
  );
}
