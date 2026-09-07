# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are
currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| > 1.0.x | :white_check_mark: |
| < 1.0.x | :x:                |

## Reporting a Vulnerability

Please do not open a public issue for security vulnerabilities. Instead, report any security vulnerabilities via email to our designated security contact at **security@kargosetu.example.com**.

We will acknowledge receipt of your vulnerability report and strive to send you regular updates about our progress. If a vulnerability is accepted, we will coordinate a public disclosure with you once a patch has been released.

---

### Potential Judge Questions

Based on the provided `SECURITY.md` excerpt, here are 10 thoughtful, probing questions to evaluate the team's security posture and incident response readiness:

1. **Version Ambiguity:** Your supported versions table explicitly lists `> 1.0.x` as supported and `< 1.0.x` as unsupported. What is the exact security support status for version `1.0.x` itself, and how do you plan to clarify this edge case for your users?
2. **Secure Communication:** You request that vulnerabilities be reported via standard email to `security@kargosetu.example.com`. Do you have a public PGP/GPG key available so that security researchers can encrypt sensitive exploit details before sending them over email?
3. **Acknowledgment SLAs:** Your policy states you will "acknowledge receipt" of vulnerability reports. Do you have a strict internal Service Level Agreement (SLA)—such as 24 or 48 hours—for this initial response to assure researchers that the report hasn't been missed?
4. **Update Frequency:** You mention that you will "strive to send regular updates" regarding progress. In the context of critical vulnerabilities, how do you define "regular," and what is your internal timeline for keeping reporters informed?
5. **Acceptance Criteria:** The document says, "If a vulnerability is accepted...". What is your internal triage process for evaluating these emails, and what specific criteria determine whether a reported vulnerability is accepted or rejected?
6. **Embargo and Disclosure Deadlines:** When coordinating public disclosure, do you enforce a standard embargo period (e.g., 90 days) for researchers, and what is your protocol if a researcher threatens to publish the exploit before your patch is ready?
7. **Public Notification Mechanism:** Once a patch is released and you move to public disclosure, what specific channels (e.g., GitHub Security Advisories, CVE assignments, mailing lists) will you use to ensure all users of `> 1.0.x` are immediately notified to update?
8. **Legacy System Upgrades:** Since versions `< 1.0.x` receive no security updates, do you have a migration plan or active warning system in place to alert users of older versions that they are operating a potentially vulnerable, unsupported deployment?
9. **Inbox Management & Contingency:** Who specifically on your team is designated to monitor the `security@kargosetu...` inbox, and what is your contingency plan if that primary security contact is on leave or unavailable during a zero-day crisis?
10. **Secure Patching Pipeline:** Once an email report is accepted, what steps do you take in your development environment to ensure the patch is built, tested, and staged securely without accidentally leaking the vulnerability details in public commit histories prior to the coordinated release?
