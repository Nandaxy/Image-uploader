const os = require("os");
const fs = require("fs");
const path = require("path");

function getServerInfo() {
  const runtime = process.uptime();
  const totalRam = os.totalmem() / (1024 * 1024 * 1024);
  const freeRam = os.freemem() / (1024 * 1024 * 1024);
  const ramUsage = totalRam - freeRam;
  const ramUsagePercentage = (ramUsage / totalRam) * 100;

  const storageUsage = getStorageUsage("./file");
  const totalStorage = 10; // Total 10 GB
  const freeStorage = totalStorage - storageUsage;
  const storageUsagePercentage = (storageUsage / totalStorage) * 100;

  const formattedRuntime = formatRuntime(runtime);

  return {
    runtime,
    ramUsage,
    totalRam,
    freeRam,
    ramUsagePercentage,
    storageUsage,
    totalStorage,
    freeStorage,
    storageUsagePercentage,
    formattedRuntime,
  };
}

function getStorageUsage(directory) {
  try {
    const files = fs.readdirSync(directory);
    const fileSizeSum = files.reduce((sum, file) => {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      return sum + stats.size;
    }, 0);
    return fileSizeSum / (1024 * 1024 * 1024);
  } catch (error) {
    return 0;
  }
}

function formatRuntime(runtime) {
  const days = Math.floor(runtime / (24 * 60 * 60));
  const hours = Math.floor((runtime % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((runtime % (60 * 60)) / 60);
  const seconds = Math.floor(runtime % 60);

  let formattedTime = "";

  if (days > 0) {
    formattedTime += `${days} hari `;
  }

  if (hours > 0 || days > 0) {
    formattedTime += `${hours} jam `;
  }

  if (minutes > 0 || hours > 0 || days > 0) {
    formattedTime += `${minutes} menit `;
  }

  if (seconds > 0 || minutes > 0 || hours > 0 || days > 0) {
    formattedTime += `${seconds} detik`;
  }

  return formattedTime.trim();
}

module.exports = {
  getServerInfo,
  formatRuntime,
};
