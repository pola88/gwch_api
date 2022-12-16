import sqlite3 from 'sqlite3';
import csvtojsonV2 from 'csvtojson';

const creatingDb = process.env.CREATING_DB;
const dbRoot = creatingDb ? 'guidwheel.db' : 'build/guidwheel.db';
export const db = new sqlite3.Database(dbRoot, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Getting error ' + err);
    throw err
  }
});

export const findDevice = (deviceName) => {
  const selectDevice = `SELECT id from devices where name = ?;`
  return execSelect(selectDevice, [deviceName]);
};

export const execSelect = (query, params = []) => {
  return new Promise( (resolve, reject) => {
    db.get(query, params, (err, rows) => {
      if (err) { return reject(err) }
      resolve(rows);
    });
  });
}

export const execAll = (query, params = []) => {
  return new Promise( (resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) { return reject(err) }
      resolve(rows);
    });
  });
}

const execRun = (query, params = []) => {
  return new Promise( (resolve, reject) => {
    db.run(query, params,(err, rows) => {
      if (err) { return reject(err) }
      resolve(rows);
    });
  });
}

export const loadData = () => {
  console.log('Loading data');
  return new Promise( (resolve) => {
    db.serialize(async () => {
      // Create a table
      await execRun("CREATE TABLE IF NOT EXISTS devices (id INTEGER PRIMARY KEY, name TEXT)");
      await execRun(`CREATE TABLE IF NOT EXISTS metrics
        (
          id INTEGER PRIMARY KEY,
          device_id INTEGER NOT NULL,
          metric_name STRING,
          fromts DATETIME,
          tots DATETIME,
          avg FLOAT,
          max FLOAT,
          min FLOAT,
          CONSTRAINT fk_device_id
            FOREIGN KEY (device_id)
            REFERENCES devices(id)
            ON DELETE CASCADE
        )
      `);
      const rows = await csvtojsonV2().fromFile('demoPumpDayData.csv');
      console.log(`Adding ${rows.length} rows`);
      for(let row of rows) {
        const { deviceid, metrics, fromts, tots } = row; 
        let device = await findDevice(deviceid);
        if (!device) {
          await execRun("INSERT INTO devices (name) VALUES (?)", [deviceid]);
          device = await findDevice(deviceid);
        }
        const parsedMetrics = JSON.parse(metrics);
        for (let metric in parsedMetrics) {
          const { avgvalue, maxvalue, minvalue } = parsedMetrics[metric];
          const values = [
            device.id,
            metric,
            new Date(Number(fromts)).toISOString(),
            new Date(Number(tots)).toISOString(),
            avgvalue,
            maxvalue,
            minvalue
          ];
          await execRun("INSERT INTO metrics (device_id, metric_name, fromts, tots, avg, max, min) VALUES (?, ?, ?, ?, ?, ?, ?)", values);
        }
      }
      resolve();
    });
  });
}
