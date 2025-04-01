'use client';

import { useEffect, useState } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const [db, setDb] = useState<any>(null);
  const [query, setQuery] = useState('SELECT * FROM test_data LIMIT 10;');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const initDB = async () => {
      const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
      const logger = new duckdb.ConsoleLogger();
      const worker = new Worker(JSDELIVR_BUNDLES.mainWorker);
      const dbInst = new duckdb.AsyncDuckDB(logger, worker);

      await dbInst.instantiate(JSDELIVR_BUNDLES.mainModule, JSDELIVR_BUNDLES.pthreadWorker);
      const conn = await dbInst.connect();

      await conn.query(\`
        CREATE TABLE test_data (id INTEGER, name TEXT);
        INSERT INTO test_data VALUES (1, 'Alice'), (2, 'Bob'), (3, 'Carol');
      \`);

      setDb(conn);
    };

    initDB();
  }, []);

  const runQuery = async () => {
    if (!db) return;
    const result = await db.query(query);
    setResults(result.toArray());
  };

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">DuckDB PWA Demo</h1>

      <div className="flex gap-2">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1" />
        <Button onClick={runQuery}>執行查詢</Button>
      </div>

      <Card>
        <CardContent className="p-2">
          <pre className="overflow-auto text-sm">{JSON.stringify(results, null, 2)}</pre>
        </CardContent>
      </Card>
    </main>
  );
}
