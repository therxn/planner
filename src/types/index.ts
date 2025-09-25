// Grundlegende Typen für das Monteurplanner-Projekt

export interface Wohnung {
  id: string;
  adresse: string;
  anzahlBetten: number;
  ausstattung: string[];
  preis: number;
  beschreibung?: string;
  aktiv: boolean;
  erstelltAm: Date;
  aktualisiertAm: Date;
}

export interface Mieter {
  id: string;
  name: string;
  firma?: string;
  email: string;
  telefon: string;
  adresse?: string;
  erstelltAm: Date;
}

export interface Buchung {
  id: string;
  wohnungId: string;
  mieterId: string;
  startDatum: Date;
  endDatum: Date;
  status: 'bestätigt' | 'ausstehend' | 'storniert';
  preis: number;
  bemerkungen?: string;
  rechnungsdaten?: Rechnungsdaten;
  erstelltAm: Date;
  aktualisiertAm: Date;
}

export interface Rechnungsdaten {
  rechnungsnummer?: string;
  rechnungsdatum?: Date;
  bezahlt: boolean;
  bezahldatum?: Date;
  zahlungsart?: 'überweisung' | 'bar' | 'karte';
}

export interface KalenderEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps: {
    buchungId: string;
    wohnungId: string;
    mieterName: string;
    status: string;
  };
}

export interface DashboardStats {
  gesamtWohnungen: number;
  aktiveWohnungen: number;
  aktuelleBuchungen: number;
  monatlicherUmsatz: number;
  belegungsgrad: number;
}