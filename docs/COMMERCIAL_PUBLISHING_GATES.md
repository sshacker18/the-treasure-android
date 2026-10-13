# RELIC Commercial Publishing & Asset Gate

**Status: NOT CLEARED FOR PRODUCTION.** This checklist is a release control, not legal advice or a claim that every asset has already been independently cleared. A release owner must verify each item and retain evidence.

## 1. Release governance

- [ ] Keep development, UAT, and production lanes separate.
- [ ] Review each change through a pull request; do not publish directly from a prototype branch.
- [ ] Require automated tests and a successful build for the exact commit selected for UAT.
- [ ] Promote the same tested artifact; record commit SHA, artifact SHA-256, application ID, version name/code, and signing-certificate fingerprint.
- [ ] Manual device verification is required on the POCO M2 Pro (Android 15 / LineageOS) and at least one additional supported Android configuration before production approval.
- [ ] The project owner gives explicit production approval. A green CI run alone is not approval.

## 2. Copyright, trademarks, and asset provenance

Every shipped non-trivial asset must have an entry in an asset register with its exact file/path, creator or source, acquisition URL/date, applicable license/version, attribution requirements, modifications, and evidence saved with the project.

| Asset/source | Current intended use | Clearance status / action |
|---|---|---|
| RELIC V2 Canvas hero and scene art | Original in-repository prototype code/art | Review diffs and retain commit history; confirm no copied third-party artwork |
| Kokoro ONNX runtime (kokoro-onnx) | Build-time dialogue WAV generation only | Re-check the exact release license and dependency licenses before release |
| Kokoro-82M model and voice data | Build-time generated dialogue | Verify the exact model/voice files, license notices, voice terms, and source checksums; preserve notices |
| Kenney Mini Characters (CC0) | Candidate for later block-out only | Not included by virtue of being listed here; record the downloaded asset and license if adopted |
| Quaternius assets | Candidate for later block-out only | Not included by virtue of being listed here; verify the current license for the specific asset if adopted |
| Third-party character likeness, photos, logos, music, sound effects, fonts | None authorized by this checklist | Do not ship without documented permission/license and trademark review |

### Human likeness and voice

Do not ship a recognizable real person's likeness, portfolio photo, cloned voice, or implied endorsement without written permission covering commercial use, territories, platforms, edits/derivatives, and duration. Permission to use a photo and permission to use the subject's likeness are separate questions; confirm who owns the photograph. Current prototype dialogue uses generic synthetic voices and does not intentionally clone a real person's voice.

### AI-assisted content

AI assistance is not itself a blanket prohibition on commercial publication. It also does not guarantee exclusive copyright protection, non-infringement, or that an output is unique. Retain human-authored design decisions, reviews, modifications, prompts/asset provenance where practical, and evidence of third-party clearances. Do not market AI-generated assets as human-made.

## 3. Google Play and Android release checks

- [ ] Confirm the Play Console developer identity and account status are fully verified.
- [ ] Check current Play Console policies at submission time; do not rely on an old policy snapshot.
- [ ] Verify package name, versioning, target API level, signing key ownership/backups, and release artifact integrity.
- [ ] Complete accurate content rating, Data safety, privacy policy, ads declaration, app access, and target-audience declarations.
- [ ] If analytics, advertising, crash reporting, or other SDKs are added, inventory their data collection/sharing and update the disclosures before enabling them.
- [ ] Test consent, opt-out/child-directed requirements where applicable, ad placement, deep links, offline behavior, and policy compliance.
- [ ] Use test ad units during development. Never click live ads or encourage invalid traffic.
- [ ] Do not show interstitial ads during active gameplay, jumps, combat, or critical narrative beats. Prefer clearly optional rewarded ads for a player-requested hint/revive/reward, with a no-ad path.
- [ ] Confirm privacy, support/contact, and deletion/request handling are appropriate for any collected personal data.

## 4. Monetization integrity

The goal is sustainable, policy-compliant revenue—not guaranteed income. Do not buy fake installs, incentivize ad clicks, misrepresent gameplay, copy a competitor's brand/assets, or use misleading reward claims. Measure retention, stage completion, crashes, and player feedback alongside revenue. Validate that ads do not make the game frustrating or block essential progress.

## 5. Release decision

A release is **NO-GO** while any required test is failing, the selected artifact is not the tested artifact, asset/license evidence is missing, Play Console declarations are incomplete, or physical-device validation is pending. Record the evidence and explicit owner approval in the release PR before publishing.

This checklist is an engineering control. It does not replace qualified legal, tax, privacy, or platform-policy advice for a specific release.
