import { demoCv } from "@/lib/demo-data";

export function SampleDocument({ scan = false }: { scan?: boolean }) {
  return (
    <div className="cv-paper">
      <div className="cv-head">
        <span className="cv-monogram">KA</span>
        <div>
          <span className="cv-kicker">ÖNÉLETRAJZ</span>
          <h2>{demoCv.name}</h2>
          <p>{demoCv.role}</p>
        </div>
      </div>
      <div className="cv-contact">
        <span>{demoCv.email}</span>
        <span>{demoCv.location}</span>
      </div>
      <div className="cv-body">
        <div className="cv-main">
          <div className="cv-section">
            <h3>Röviden rólam</h3>
            <p>
              Marketingkoordinátor közösségimédia-kezelési és kampányriportálási
              tapasztalattal.
            </p>
          </div>
          <div className="cv-section recognized">
            <h3>Tapasztalat</h3>
            <strong>{demoCv.role}</strong>
            <p className="cv-company">{demoCv.employer}</p>
            <span className="cv-date">{demoCv.period}</span>
            <p>{demoCv.original}</p>
            <span className="recognition-corner corner-tl" />
            <span className="recognition-corner corner-br" />
          </div>
          <div className="cv-section">
            <h3>Tanulmányok</h3>
            <strong>{demoCv.education}</strong>
            <p>{demoCv.degree}</p>
          </div>
          <div className="cv-section cv-tasks">
            <h3>A munkám része</h3>
            <p>Heti bejegyzések · Facebook, Instagram</p>
            <p>Havi kampányriportok · Excel</p>
          </div>
        </div>
        <aside className="cv-sidebar">
          <div className="cv-section cv-skills">
            <h3>Ismeretek</h3>
            <div>
              {demoCv.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </div>
          <div className="cv-section">
            <h3>Nyelvtudás</h3>
            <strong>Angol</strong>
            <p>Kommunikációképes</p>
            <span className="cv-level-line" />
          </div>
          <div className="cv-section">
            <h3>Munkavégzés</h3>
            <p>{demoCv.location}</p>
          </div>
        </aside>
      </div>
      <div className="cv-bottom">
        <span>KOVÁCS ANNA · FIKTÍV MINTA</span>
        <span>01 / 01</span>
      </div>
      {scan && <div className="scan-light" aria-hidden="true" />}
    </div>
  );
}
