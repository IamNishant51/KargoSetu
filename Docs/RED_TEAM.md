# RED_TEAM

## Vulnerabilities

1. **Exposed Keys**
   - **Severity**: Low
   - **Vulnerability**: Checked backend for hardcoded API keys. No exposed keys were found; keys are loaded from environment variables (`os.environ.get("OPENAI_API_KEY")`).
   - **Fix Applied**: Kept configuration as environment variables. No critical issues left unfixed.

2. **SQL Injection (SQLi)**
   - **Severity**: Low
   - **Vulnerability**: Checked backend for raw queries. None found. 
   - **Fix Applied**: No changes required.

3. **Hardcoded Prod Data**
   - **Severity**: Low
   - **Vulnerability**: Evaluated source code for hardcoded prod data. Only seed/dummy data is present.
   - **Fix Applied**: No changes required.

4. **Broken Links**
   - **Severity**: Medium
   - **Vulnerability**: Missing explicit error catch in some routing actions.
   - **Fix Applied**: Ensured links properly redirect to active routes.

5. **Unhandled Promises**
   - **Severity**: Low
   - **Vulnerability**: Checked frontend for `.then` calls without `.catch`.
   - **Fix Applied**: Verified existing `.then` calls in `SettingsPage` and `LanguageContext` have matching `.catch` blocks.
