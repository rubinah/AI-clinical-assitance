// components/chat/PatientContextPanel.tsx
// Side panel showing the patient context the AI has access to

import { PatientContext } from "../../types";

export function PatientContextPanel({ patient }: { patient: PatientContext }) {
  return (
    <aside
      aria-label="Patient context loaded into AI"
      className="w-72 bg-card border-l border-border overflow-y-auto flex-shrink-0 p-4 space-y-4"
    >
      <div>
        <h2 className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
          AI Context — {patient.name}
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The AI has been loaded with this patient's record as context for all responses.
        </p>
      </div>

      {/* Patient info */}
      <section aria-label="Patient details">
        <h3 className="text-xs font-semibold text-foreground mb-2">Patient</h3>
        <dl className="space-y-1">
          {[
            { term: "ID",        detail: patient.id },
            { term: "Age",       detail: `${patient.age} years` },
            { term: "Diagnosis", detail: patient.primaryDiagnosis },
            { term: "Ward",      detail: patient.ward },
            { term: "Physician", detail: patient.attendingPhysician },
          ].map(item => (
            <div key={item.term} className="flex gap-2 text-xs">
              <dt className="text-muted-foreground w-20 flex-shrink-0">{item.term}</dt>
              <dd className="text-foreground">{item.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Vitals */}
      <section aria-label="Current vitals in AI context">
        <h3 className="text-xs font-semibold text-foreground mb-2">Vitals</h3>
        <div className="space-y-1">
          {Object.entries(patient.currentVitals).map(([key, value]) => {
            const isAbnormal = value.includes("ELEVATED") || value.includes("LOW") || value.includes("HIGH");
            return (
              <div key={key} className={`text-xs px-2 py-1 rounded ${isAbnormal ? "bg-destructive/10 text-destructive" : "text-muted-foreground"}`}>
                {value}
              </div>
            );
          })}
        </div>
      </section>

      {/* Medications */}
      <section aria-label="Medications in AI context">
        <h3 className="text-xs font-semibold text-foreground mb-2">Medications</h3>
        <ul className="space-y-1">
          {patient.medications.map(med => (
            <li key={med} className="text-xs text-muted-foreground">· {med}</li>
          ))}
        </ul>
      </section>

      {/* Alerts */}
      {patient.recentAlerts.length > 0 && (
        <section aria-label="Active alerts in AI context">
          <h3 className="text-xs font-semibold text-amber-400 mb-2">Active Alerts</h3>
          <ul className="space-y-1">
            {patient.recentAlerts.map(alert => (
              <li key={alert} className="text-xs text-amber-300">⚠ {alert}</li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}
