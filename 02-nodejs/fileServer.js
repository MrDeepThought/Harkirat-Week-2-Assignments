/**
  You need to create an express HTTP server in Node.js which will handle the logic of a file server.
  - Use built in Node.js `fs` module

  The expected API endpoints are defined below,
  1. GET /files - Returns a list of files present in `./files/` directory
    Response: 200 OK with an array of file names in JSON format.
    Example: GET http://localhost:3000/files

  2. GET /file/:filename - Returns content of given file by name
     Description: Use the filename from the request path parameter to read the file from `./files/` directory
     Response: 200 OK with the file content as the response body if found, or 404 Not Found if not found. Should return `File not found` as text if file is not found
     Example: GET http://localhost:3000/file/example.txt

    - For any other route not defined in the server return 404

    Testing the server - run `npm run test-fileServer` command in terminal
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// global constants and variables
const DIRPATH = path.resolve("files");

// app middlewares

// app handler functions
function getFiles(req,res){
  fs.readdir(DIRPATH, (err,files) => {
    if (err){
      res.status(500).send("Internal Sever Error!: \n" + err);
    }
    res.status(200).json(files);
  })
  
}

function getFile(req,res){
  let filename = req.params.filename;
  
  fs.readdir(DIRPATH, (err,files) => {
    let ind = files.indexOf(filename);
    if (ind !== -1){
      fs.readFile(path.join(DIRPATH,filename),'utf-8', (err,contents) => {
        if (err){
          console.log(err);
          res.send(500).send("Internal Server Error. Can't open the file!");
        }
        res.status(200).send(contents);
      });
    }
    else res.status(404).send("File not found");
  });
}

// app routes
app.get("/files", getFiles);
app.get("/file/:filename", getFile);

// checking if the HTTP server is working on the given port or not
// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// });
app.use((req, res, next) => {
  res.status(404).send("Route not found")
})
// This is how you can handle routes that are not present in the app : https://expressjs.com/en/starter/faq.html#:~:text=How%20do%20I%20handle%20404,middleware%20will%20not%20capture%20them.
module.exports = app;
