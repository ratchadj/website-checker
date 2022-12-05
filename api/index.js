import express from "express";
import fileupload from "express-fileupload";
import cors from "cors";
import * as Utils from "./utils/index.js";

const app = express();

app.use(
  fileupload({
    createParentPath: true,
  })
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Read CSV files data and call to check
 * If url return status 200 is Up
 * Otherwise is Down
 * 
 * @param {file} req.files
 * @returns {json} chunked json
 */
app.post("/upload-file", async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: "failed",
        message: "No file uploaded",
      });
    } else {
      // setHeader
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Transfer-Encoding", "chunked");

      // get URL from CSV data
      let file = req.files.file;
      const csvData = Utils.bufferToString(file.data);
      const urls = Utils.CSVToArray(csvData);

      // define variables
      let up = 0;
      let down = 0;
      let total = urls.length;
      let currentChecked = 0;

      const request = Promise.all(
        urls.map((url) =>
          Utils.websiteChecker(url)
            .then((data) => {
              // up with status 200
              up++;
              currentChecked++;

              // calculate progress
              const progress = Math.floor((currentChecked / total) * 100);

              // chunked response
              res.write(
                JSON.stringify({
                  data,
                  isUp: true,
                  progress,
                  name: file.name,
                  size: file.size,
                  up,
                  down,
                  total,
                })
              );
            })
            .catch((data) => {
              // down
              down++;
              currentChecked++;

              // calculate progress
              const progress = Math.floor((currentChecked / total) * 100);

              // chunked response
              res.write(
                JSON.stringify({
                  data,
                  isUp: false,
                  progress,
                  name: file.name,
                  size: file.size,
                  up,
                  down,
                  total,
                })
              );
            })
        )
      );

      request
        .then(() => {
          res.status(200).end();
        })
        .catch((e) => {
          res.status(500).end(e);
        });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`Server started on port ${port}`));
