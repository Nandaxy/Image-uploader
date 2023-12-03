const fs = require("fs");

function readData() {
  try {
    const data = fs.readFileSync("database/database.json", "utf8");
    return JSON.parse(data);
  } catch (error) {
    return { views: 0 };
  }
}

function writeData(data) {
  fs.writeFileSync(
    "database/database.json",
    JSON.stringify(data, null, 2),
    "utf8"
  );
}

function getVisitorCount() {
  const data = readData();
  return data.views;
}

function incrementVisitorCount() {
  const data = readData();
  data.views += 1;
  writeData(data);
}

function formatVisitorCount(count) {
  return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function countFilesInFolder(folderPath) {
  try {
    const files = fs.readdirSync(folderPath);
    return files.length;
  } catch (error) {
    return 0;
  }
}

module.exports = {
  getVisitorCount,
  incrementVisitorCount,
  formatVisitorCount,
  countFilesInFolder,
};
