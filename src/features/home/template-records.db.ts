import Dexie, { type Table } from "dexie";
import type { TemplateRecord } from "./template-records";
import {
  templateRecordsSeed,
  templateRecordsSeedVersion,
} from "./template-records.seed";

type SeedMeta = {
  key: string;
  version: string;
  rowCount: number;
  seededAt: string;
};

class TemplateRecordsDatabase extends Dexie {
  templateRecords!: Table<TemplateRecord, string>;
  seedMeta!: Table<SeedMeta, string>;

  constructor() {
    super("data-boilerplate-template-records");

    this.version(1).stores({
      seedMeta: "key",
      templateRecords:
        "id, project, owner, status, priority, category, impactScore, updatedAt",
    });
  }
}

let templateRecordsDatabase: TemplateRecordsDatabase | undefined;
let seedPromise: Promise<void> | undefined;

function getTemplateRecordsDatabase() {
  templateRecordsDatabase ??= new TemplateRecordsDatabase();

  return templateRecordsDatabase;
}

async function seedTemplateRecords(database: TemplateRecordsDatabase) {
  const seedKey = "templateRecords";
  const existingSeed = await database.seedMeta.get(seedKey);

  if (existingSeed?.version === templateRecordsSeedVersion) {
    return;
  }

  await database.transaction(
    "rw",
    database.templateRecords,
    database.seedMeta,
    async () => {
      await database.templateRecords.clear();
      await database.templateRecords.bulkPut(templateRecordsSeed);
      await database.seedMeta.put({
        key: seedKey,
        version: templateRecordsSeedVersion,
        rowCount: templateRecordsSeed.length,
        seededAt: new Date().toISOString(),
      });
    },
  );
}

export async function getSeededTemplateRecordsDatabase() {
  if (typeof indexedDB === "undefined") {
    throw new Error(
      "Dexie requires IndexedDB and can only run in the browser.",
    );
  }

  const database = getTemplateRecordsDatabase();
  seedPromise ??= seedTemplateRecords(database).catch((error: unknown) => {
    seedPromise = undefined;
    throw error;
  });
  await seedPromise;

  return database;
}
