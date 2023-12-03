const express = require("express");
const app = express();
const path = require("path");
const fileUpload = require("express-fileupload");
const moment = require("moment");
const fs = require("fs");
const counter = require("./lib/counter");
const serverInfo = require("./lib/info");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// function public mode
function saveToDatabase(data, host) {
  const databasePath = path.join(__dirname, "database", "database.json");

  try {
    const rawData = fs.readFileSync(databasePath, "utf-8");
    const existingData = JSON.parse(rawData);

    if (!existingData.image) {
      existingData.image = [];
    }

    existingData.image.push({
      ...data,
      link: `http://${host}/file/${data.fileName}`,
    });

    fs.writeFileSync(databasePath, JSON.stringify(existingData, null, 2));
  } catch (error) {
    console.error("Error reading or writing to database:", error.message);
  }
}

// function Format Size
function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  } else if (bytes >= 1024) {
    return (bytes / 1024).toFixed(2) + " KB";
  } else {
    return bytes + " bytes";
  }
}

// static page
app.use(fileUpload());
app.use("/file", express.static(path.join(__dirname, "file")));
app.use("/src", express.static(path.join(__dirname, "views/src")));
app.use("/database", express.static(path.join(__dirname, "database")));

// Page utama
app.get("/", (req, res) => {
  counter.incrementVisitorCount();
  res.render("index");
});

// coba api handle
app.get("/api/server-info", (req, res) => {
  const info = serverInfo.getServerInfo();
  res.json(info);
});

// page dashboard
app.get("/dashboard", async (req, res) => {
  const filesInFolder = counter.countFilesInFolder("./file");

  const formattedVisitorCount = counter.formatVisitorCount(
    counter.getVisitorCount()
  );

  res.render("dashboard", {
    formattedVisitorCount,
    filesInFolder,
  });
});

// Handle Upload
app.get("/upload", (req, res) => {
  res.render("upload");
});

app.post("/upload", (req, res) => {
  const uploadedFile = req.files && req.files.file;
  const selectedMode = req.body.mode;

  if (!uploadedFile) {
    return res.status(400).json({ error: "No file selected." });
  }

  const randomId = String.fromCharCode(97 + Math.floor(Math.random() * 26));
  const currentDate = moment().format("DD-MM");
  const uniqueFileName = `${randomId}-${currentDate}-${uploadedFile.name}`;
  const filePath = path.join(__dirname, "file", uniqueFileName);

  uploadedFile.mv(filePath, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const fileSize = uploadedFile.size;
    const fileExtension = path.extname(uniqueFileName).substring(1);

    if (selectedMode === "public") {
      const data = {
        fileName: uniqueFileName,
        uploadTime: moment().format(),
        size: fileSize,
        extension: fileExtension,
      };

      saveToDatabase(data, req.get("host"));
    }

    res.status(200).json({
      success: true,
      redirectUrl: `/success?fileName=${uniqueFileName}&fileSize=${fileSize}&fileExtension=${fileExtension}`,
    });
  });
});

// Page success
app.get("/success", (req, res) => {
  const { fileName, fileSize, fileExtension } = req.query;

  if (!fileName || !fileSize || !fileExtension) {
    return res.redirect("/");
  }

  res.render("success", {
    fileName,
    host: req.get("host"),
    fileSize,
    fileExtension,
    formatFileSize,
  });
});

// 404
app.use((req, res) => {
  res.status(404).render("notfound");
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
  console.log(`Jangan lupa ngopi ^_~`);
});
