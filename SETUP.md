# CMS-Einrichtung – Metzgerei Hinderer

## Was ist `/admin`?

Unter `/admin` befindet sich ein kleines Redaktionssystem (Sveltia CMS), mit dem Werner Hinderer
Texte, Angebote und Kontaktdaten auf der Website selbst ändern kann – ganz ohne Programmierkenntnisse.
Alle Inhalte liegen als JSON-Dateien im Ordner `/content/` und werden dort direkt von der Website
eingelesen.

> **Login bereits eingerichtet:** Diese Website hat ihr **eigenes** Login, komplett getrennt von
> den anderen Kundenwebsites – kein GitHub-Account nötig, nur E-Mail + Passwort. Technisch läuft
> das über einen eigenen, nur für diese Website zuständigen Cloudflare-Worker
> (`cms-auth-metzgerei-hinderer`), der die Anmeldung prüft und im Hintergrund die Commits macht.
> Zugangsdaten hat Michael Ehmann. Passwort ändern: `wrangler secret put AUTH_PASSWORD_HASH` im
> Ordner `cms-auth-workers/metzgerei-hinderer` (Hash mit `node generate-credentials.js <neues-passwort>`
> erzeugen).

---

## Was der Kunde jetzt selbst bearbeiten kann

| Bereich im CMS | Was ändert sich auf der Website |
|---|---|
| 📢 Aktuelles & Angebote | Wochenangebote/Aktionskarten hinzufügen, entfernen oder anpassen (Badge, Titel, Text, Button) |
| 🥩 Produkte | Die 5 Produktkategorien: Bild-Link, Kategorie-Etikett, Titel, Text und Stichpunkte |
| 🎉 Partyservice | Die 4 Leistungspunkte ("Was wir bieten") sowie die Liste der Anlässe (Geburtstage, Hochzeiten, …) |
| 🏛 Über uns | Die drei Textabsätze, die 3 Werte-Kacheln und die 3 Zeitleisten-Einträge |
| ⚙️ Startseite | Überschrift und Untertitel des Willkommensbereichs (Hero) |
| ⚙️ Kontakt & Öffnungszeiten | Adresse, Telefon, E-Mail, Social-Media-Links, Kartenlinks und alle 7 Öffnungszeiten-Zeilen |
| ⚙️ Allgemeine Seiteninfos | Seitentitel (Browser-Tab) und Suchmaschinen-Beschreibung |

---

## Workflow für den Kunden

```
1. hinderer-domain.de/admin öffnen
2. Mit E-Mail + Passwort anmelden
3. Inhalt bearbeiten & speichern
4. → Im Hintergrund wird automatisch ein Commit erstellt
5. → Die Website baut & veröffentlicht die Änderung innerhalb weniger Minuten
```

**Bilder/Dateien:** Dieser Durchgang enthält noch keine Bild-Upload-Felder (die Produktfotos werden
weiterhin über eine Bild-URL eingetragen). Der Ordner `/uploads/` ist aber bereits als
Medien-Ordner in `admin/config.yml` hinterlegt (`media_folder: uploads`) – für später hinzukommende
Foto-Upload-Felder muss dort nichts mehr eingerichtet werden.

---

## Kontaktformular (Partyservice-Anfrage)

Das Formular verschickt echte E-Mails über einen eigenen Cloudflare-Worker
(`contact-form-metzgerei-hinderer`) + [Resend](https://resend.com).

> ⚠️ **Vor Übergabe an den echten Kunden unbedingt ändern:** Anfragen landen
> aktuell testweise bei `ehmann.hannes07@gmail.com`, nicht bei der Metzgerei.
> Umstellen auf die echte Adresse (z.B. `info@hinderer.de`):
> ```bash
> cd contact-form-workers/metzgerei-hinderer
> echo -n "info@hinderer.de" | npx wrangler secret put TO_EMAIL
> ```
> Details (Absenderadresse/Domain-Verifizierung) siehe `contact-form-workers/README.md`.

---

## Troubleshooting

| Problem | Lösung |
|---|---|
| E-Mail/Passwort falsch | Zugangsdaten bei Michael Ehmann erfragen; Passwort kann jederzeit neu gesetzt werden (siehe oben) |
| "Zu viele Anmeldeversuche" | Kurz warten (unter einer Minute) und erneut versuchen |
| Änderungen erscheinen nicht | 1–3 Minuten warten (Build/Deploy); Browser-Cache leeren |

---

*Für Fragen: Michael Ehmann*
