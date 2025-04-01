import * as duckdb from './duckdb/duckdb-wasm.js';

const bundle = {
  mainModule: '/duckdb/duckdb-browser-mvp.wasm',
  mainWorker: '/duckdb/duckdb-browser-mvp.worker.js'
};

const worker = new Worker(bundle.mainWorker, { type: 'module' });
const db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker);
await db.instantiate(bundle.mainModule);

// 使用 persistent storage
await db.registerFileText('mydb.duckdb', '');
await db.open({ path: 'mydb.duckdb' });

const conn = await db.connect();

log('✅ DuckDB 初始化完成');

document.getElementById('csvFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const text = await file.text();
  await conn.execute(`CREATE TABLE IF NOT EXISTS data AS SELECT * FROM read_csv_auto('${file.name}', AUTO_DETECT=TRUE)`, {
    [`${file.name}`]: new Blob([text], { type: 'text/csv' })
  });

  log('✅ CSV 已匯入資料庫！');
});

async function exportDB() {
  const blob = await db.exportFile('mydb.duckdb');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mydb.duckdb';
  a.click();
}

function log(msg) {
  const el = document.getElementById('log');
  el.textContent += '\n' + msg;
}

window.exportDB = exportDB;
