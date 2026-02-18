# Testing Strategy (V1)

- Unit tests are required for all economy and auth domain behavior before UI wiring.
- The root coverage gate enforces at least 80% lines and branches.
- API commands must be idempotent and validated by tests.
- Rolling 24-hour ledger logic must be verified with boundary tests.
- Base-1000 segmented number math must be covered by deterministic cases.
