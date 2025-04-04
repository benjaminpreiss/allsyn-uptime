# Support Domain Uptime Testing on Allsyn

This issue outlines the details of the pull-request to support domain uptime testing on allsyn (name of the platform I am building).

Allsyn allows users to monitor and display the uptime of an arbitrary endpoint. This implies that the front end of allsyn can retrieve the time_series data for a custom time_period.

## Database Changes

Based on our discussions, we'll implement a normalized schema with separate tables for check definitions and measurements. This approach optimizes for query performance while maintaining flexibility.

### Schema Design

```sql
-- Create extension for TimescaleDB
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Create the subnet_checks table to store check definitions
CREATE TABLE subnet_checks (
    id SERIAL PRIMARY KEY,
    subnet TEXT NOT NULL,
    check_subject TEXT NOT NULL,
    UNIQUE (subnet, check_subject)
);

-- Create table for measurements that can be averaged
CREATE TABLE measurements_for_avg (
    time TIMESTAMPTZ NOT NULL,
    subnet_check_id INTEGER REFERENCES subnet_checks(id),
    check_key TEXT NOT NULL,
    success BOOLEAN NOT NULL,
    result INTEGER NOT NULL,
    PRIMARY KEY (time, subnet_check_id, check_key)
);

-- Create table for discrete measurements
CREATE TABLE measurements_discrete (
    time TIMESTAMPTZ NOT NULL,
    subnet_check_id INTEGER REFERENCES subnet_checks(id),
    check_key TEXT NOT NULL,
    success BOOLEAN NOT NULL,
    result TEXT NOT NULL,
    PRIMARY KEY (time, subnet_check_id, check_key)
);

-- Convert to hypertables
SELECT create_hypertable('measurements_for_avg', 'time');
SELECT create_hypertable('measurements_discrete', 'time');

-- Create indexes
CREATE INDEX ON measurements_for_avg (subnet_check_id, check_key, time DESC);
CREATE INDEX ON measurements_discrete (subnet_check_id, check_key, time DESC);
```

## TimescaleDB Configuration

```sql
-- Create a continuous aggregate for minute-level data
CREATE MATERIALIZED VIEW minute_stats
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 minute', time) AS bucket_time,
    subnet_check_id,
    check_key,
    COUNT(*) AS total_checks,
    SUM(success::int) AS successful_checks,
    AVG(success::int)::float AS success_rate,
    AVG(result)::float AS avg_result
FROM
    measurements_for_avg
GROUP BY
    bucket_time,
    subnet_check_id,
    check_key;

-- Set refresh policy to keep minute stats updated
SELECT add_continuous_aggregate_policy('minute_stats',
    start_offset => INTERVAL '30 days',
    end_offset => INTERVAL '1 minute',
    schedule_interval => INTERVAL '1 minute');

-- Add compression policies
SELECT add_compression_policy('measurements_for_avg', INTERVAL '7 days');
SELECT add_compression_policy('measurements_discrete', INTERVAL '7 days');
```

## Routes

### POST Endpoint

```typescript
// POST /:subnet/:check_subject/:check_key/measurement/:type
app.post(
  '/:subnet/:check_subject/:check_key/measurement/:type',
  {
    schema: {
      params: {
        type: 'object',
        properties: {
          subnet: { type: 'string' },
          check_subject: { type: 'string' },
          check_key: { type: 'string' },
          type: { type: 'string', enum: ['avg', 'discrete'] }
        },
        required: ['subnet', 'check_subject', 'check_key', 'type']
      },
      body: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          result: { oneOf: [{ type: 'number' }, { type: 'string' }] }
        },
        required: ['success', 'result']
      }
    }
  },
  async (req, res) => {
    try {
      const client = await pool.connect();
      const { subnet, check_subject, check_key, type } = req.params;
      const { success, result } = req.body;
      const time = new Date();

      try {
        await client.query('BEGIN');

        // Get or create subnet_check_id (now only needs subnet and check_subject)
        const { rows: [check] } = await client.query(
          `INSERT INTO subnet_checks (subnet, check_subject)
           VALUES ($1, $2)
           ON CONFLICT (subnet, check_subject) DO UPDATE
           SET subnet = EXCLUDED.subnet
           RETURNING id`,
          [subnet, check_subject]
        );

        // Insert into appropriate table based on type parameter
        if (type === 'avg') {
          if (typeof result !== 'number') {
            throw new Error('Result must be a number for avg measurements');
          }

          await client.query(
            `INSERT INTO measurements_for_avg (
                time,
                subnet_check_id,
                check_key,
                success,
                result
              )
              VALUES ($1, $2, $3, $4, $5)`,
            [time, check.id, check_key, success, result]
          );
        } else { // type === 'discrete'
          await client.query(
            `INSERT INTO measurements_discrete (
                time,
                subnet_check_id,
                check_key,
                success,
                result
              )
              VALUES ($1, $2, $3, $4, $5)`,
            [time, check.id, check_key, success, result.toString()]
          );
        }

        await client.query('COMMIT');
        res.status(200).json({ success: true });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Error during measurement insertion:', err);
      res.status(500).json({ error: 'Failed to record measurement' });
    }
  }
);
```

### GET Endpoints

```typescript
app.get(
  '/:subnet/:check_subject/success-rate/:check_key',
  {
    schema: {
      params: {
        type: 'object',
        properties: {
          subnet: { type: 'string' },
          check_subject: { type: 'string' },
          check_key: { type: 'string' }
        },
        required: ['subnet', 'check_subject', 'check_key']
      },
      querystring: {
        type: 'object',
        properties: {
          from: { type: 'string', format: 'date-time' },
          to: { type: 'string', format: 'date-time' }
        }
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              bucket_time: { type: 'string', format: 'date-time' },
              total_checks: { type: 'integer' },
              successful_checks: { type: 'integer' },
              success_rate: { type: 'number' },
              avg_result: { type: 'number' }
            }
          }
        }
      }
    }
  },
  async (request, reply) => {
    const client = await app.pg.connect();
    const from = request.query.from || new Date(Date.now() - 86400000).toISOString();
    const to = request.query.to || new Date().toISOString();

    try {
      // First get the subnet_check_id (now only needs subnet and check_subject)
      const { rows: [check] } = await client.query(
        `SELECT id FROM subnet_checks
         WHERE subnet = $1
         AND check_subject = $2`,
        [request.params.subnet, request.params.check_subject]
      );

      if (!check) {
        reply.code(404).send({ error: 'Check not found' });
        return;
      }

      // Then get the stats using subnet_check_id and check_key
      const { rows } = await client.query(
        `SELECT
          bucket_time,
          total_checks,
          successful_checks,
          success_rate,
          avg_result
        FROM
          minute_stats
        WHERE
          subnet_check_id = $1
          AND check_key = $2
          AND bucket_time >= $3
          AND bucket_time <= $4
        ORDER BY
          bucket_time`,
        [check.id, request.params.check_key, from, to]
      );

      reply.send(rows);
    } finally {
      client.release();
    }
  }
);
```

## Advantages of This Approach

1. **Query Performance**: Using subnet_check_id eliminates the need for joins
2. **Data Separation**: Clear separation between averageable and discrete measurements
3. **Simplicity**: Clear data model that's easy to understand and extend
4. **Efficient Aggregation**: TimescaleDB can efficiently compute and store aggregates
5. **Flexible Check Types**: Moving check_key to measurement tables allows different check types per subject
6. **Storage Efficiency**: Subnet and check_subject stored once per check instead of with every measurement

The storage overhead of maintaining separate tables is outweighed by the query performance benefits and cleaner data organization, especially for time-series visualizations and dashboards where response time is critical.
