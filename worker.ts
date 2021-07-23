import pg from 'pg';
export async function worker(){
    let client = new pg.Client({
        connectionString: process.env.DATABASE_URI,
        ssl: {
            rejectUnauthorized: false
        }
    });
    client.connect();
    try {
        let results = await client.query('select public.ordergrouping();')
    } catch (error) {
        console.error(error.message);
    }
}