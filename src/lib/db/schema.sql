-- OpenWatch: Anthropic Job Monitoring Schema

CREATE TABLE IF NOT EXISTS jobs (
  id                    BIGINT PRIMARY KEY,
  title                 TEXT NOT NULL,
  department_name       TEXT,
  location_name         TEXT,
  absolute_url          TEXT,
  content_html          TEXT,
  status                TEXT NOT NULL DEFAULT 'active',
  first_seen_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at             TIMESTAMPTZ,
  greenhouse_updated_at TIMESTAMPTZ,
  insight_strategic     TEXT,
  insight_financial     TEXT,
  insight_ai_replacement TEXT,
  insight_generated_at  TIMESTAMPTZ,
  insight_model         TEXT
);

CREATE TABLE IF NOT EXISTS department_snapshots (
  id              SERIAL PRIMARY KEY,
  snapshot_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  department_name TEXT NOT NULL,
  active_count    INT NOT NULL DEFAULT 0,
  new_count       INT NOT NULL DEFAULT 0,
  closed_count    INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sync_runs (
  id            SERIAL PRIMARY KEY,
  ran_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  jobs_fetched  INT,
  new_jobs      INT,
  closed_jobs   INT,
  insights_done INT,
  error_message TEXT,
  duration_ms   INT
);

CREATE INDEX IF NOT EXISTS idx_jobs_status       ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_department   ON jobs(department_name);
CREATE INDEX IF NOT EXISTS idx_jobs_first_seen   ON jobs(first_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_closed_at    ON jobs(closed_at DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_at      ON department_snapshots(snapshot_at DESC);
