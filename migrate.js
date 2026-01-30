import { Sequelize } from "sequelize";
import { Umzug, SequelizeStorage } from "umzug";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: join(__dirname, "goodnews.db"),
  logging: false,
});

function parseMigrationsSql() {
  const path = join(__dirname, "migrations.sql");
  const content = readFileSync(path, "utf-8");
  const migrations = [];

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(/^--\s*\[([^\]]+)\]\s*(.+)$/);
    if (!match) continue;

    const [, date, sql] = match;
    const name = `${date}|${sql}`;

    migrations.push({
      name,
      async up({ context: client }) {
        await client.query(sql);
      },
    });
  }

  return migrations;
}

const umzug = new Umzug({
  migrations: parseMigrationsSql(),
  context: sequelize,
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

export { umzug };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  umzug.runAsCLI();
}
