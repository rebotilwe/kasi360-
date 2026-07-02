const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

const pool = {
  query: async (text, params = []) => {
    const result = await sql.query(text, params);
    return { rows: result.rows ?? result };
  },
  connect: async () => ({
    query: async (text, params = []) => {
      const result = await sql.query(text, params);
      return { rows: result.rows ?? result };
    },
    release: () => {},
    query: async (text, params = []) => {
      const result = await sql.query(text, params);
      return { rows: result.rows ?? result };
    },
  }),
};

module.exports = pool;