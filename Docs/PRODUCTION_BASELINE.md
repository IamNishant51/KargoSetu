# Phase 1 - Production Baseline

## Overview
This document outlines the changes made during Phase 1 - Production Baseline of the KargoSetu upgrade process.

## Files Changed
- `.gitignore`: Added `KargoSetu_SIH26006_Production_Upgrade_Playbook.md`.
- `backend/app/main.py`: Updated the `lifespan` event to skip ML model warmup when `pytest` is running.
- `frontend/tests/home.spec.ts`: Updated hero text assertions to match the new text: "Haldia can't take a Capesize." and "We know first."
- `backend/app/api/routers/commodities.py` and 29 other Python files: Formatted using `black`.

## Legacy Files Deleted
- `backend/index.js`
- `backend/routes/`
- `backend/models/`
- `backend/middleware/`

## Tests Added/Fixed
- Fixed Playwright frontend test failures in `frontend/tests/home.spec.ts` caused by outdated hero section text.
- Resolved pytest blocking issue by disabling the ML model startup tasks during testing.

## Commands Executed
- PowerShell commands to remove legacy Node.js files: `Remove-Item` for `backend/index.js`, `routes`, `models`, `middleware`.
- Added playbook to `.gitignore` using `Add-Content`.
- Formatted backend Python files: `python -m black .`
- Executed backend tests: `pytest`
- Executed frontend tests: `npx playwright test`

## Remaining Warnings
- None at this stage. Both `pytest` and `playwright` suites are passing.
