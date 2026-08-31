# MODULE 6: DATABASE SCHEMAS & ENTITY-RELATIONSHIP ARCHITECTURE

**Engine:** PostgreSQL 16 + PostGIS.

```sql
-- Enable Spatial Extensions
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. PORTS TABLE
CREATE TABLE ports (
    port_code VARCHAR(10) PRIMARY KEY,
    port_name VARCHAR(100) NOT NULL,
    country VARCHAR(50),
    geom GEOMETRY(Point, 4326),
    permissible_draft_m DECIMAL(5,2) NOT NULL,
    tide_variance_m DECIMAL(4,2) DEFAULT 0.0,
    ukc_requirement_m DECIMAL(4,2) NOT NULL
);

-- 2. BERTHS TABLE
CREATE TABLE berths (
    berth_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    port_code VARCHAR(10) REFERENCES ports(port_code),
    max_loa_m DECIMAL(6,2),
    max_beam_m DECIMAL(5,2),
    discharge_rate_mt_pd INTEGER
);

-- 3. VESSELS TABLE
CREATE TABLE vessels (
    imo_number VARCHAR(15) PRIMARY KEY,
    vessel_name VARCHAR(100) NOT NULL,
    vessel_class VARCHAR(50) CHECK (vessel_class IN ('Capesize', 'Panamax', 'Supramax', 'Handysize')),
    dwt_mt INTEGER NOT NULL,
    laden_draft_m DECIMAL(5,2) NOT NULL,
    loa_m DECIMAL(6,2),
    beam_m DECIMAL(5,2),
    fuel_cons_laden_tpd DECIMAL(5,2)
);

-- 4. REQUISITIONS TABLE
CREATE TABLE requisitions (
    cargo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commodity VARCHAR(50) NOT NULL,
    volume_mt INTEGER NOT NULL,
    origin_port VARCHAR(10) REFERENCES ports(port_code),
    dest_port VARCHAR(10) REFERENCES ports(port_code),
    laycan_start DATE NOT NULL,
    laycan_end DATE NOT NULL,
    target_price_usd DECIMAL(10,2)
);

-- 5. CHARTER RECOMMENDATIONS (Audit / Logs)
CREATE TABLE charter_recommendations (
    rec_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cargo_id UUID REFERENCES requisitions(cargo_id),
    optimal_charter_date DATE,
    recommended_class VARCHAR(50),
    split_count INTEGER DEFAULT 1,
    forecasted_rate DECIMAL(10,2),
    demurrage_risk_score DECIMAL(3,2)
);

-- SPATIAL INDEXING
CREATE INDEX idx_ports_geom ON ports USING GIST (geom);
```
