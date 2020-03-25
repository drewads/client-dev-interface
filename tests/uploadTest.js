/**
 * This file contains the client-side javascript for testing the
 * upload dev module.
 */

const DONE_STATE = 4; // when the HTTP request is completely finished, including response
const PORT = 8000;  // port the test server is listening to

 /**
  * uploadFiles sends an HTTP request with multipart/form-data body
  * to the upload client-dev-interface module. It will send multiple
  * files in the body of the single request if multiple files are
  * selected. In the multipart/form-data body, the key for each file
  * is the filepath it should be saved at on the server.
  * 
  * @param files files from an input element
  * @param {string} dir the directory on the server to save the files to
  * @param {string} requestMethod the HTTP request method
  * @return {Promise} a Promise that is resolved when HTTP response is received
  */
const uploadFiles = (files, dir, requestMethod, altBody = null) => {
    return new Promise(resolve => {
        const uploadForm = new FormData();

        for (const file of files) {
            uploadForm.append(dir + file.name, file);
        }

        const upload = new XMLHttpRequest();

        // when we get the entire HTTP response back from the server
        upload.onreadystatechange = () => {
            if (upload.readyState === DONE_STATE) {
                resolve(upload.response);
            }
        }

        upload.open(requestMethod, `http://localhost:${PORT}/client-dev-interface/upload`);
        upload.send((altBody ? altBody : uploadForm));
    });
}

/**
 * This function adds test results to the document.
 * 
 * @param {string} response HTTP response body
 * @param {string} expected expected HTTP response body
 * @param {number} testNumber number of this test
 */
const printResults = (response, expected, testNumber) => {
    const elem = document.createElement("div");
    
    if (expected) {
        elem.innerText = 'Upload Test ' + testNumber + '. '
                    + (response === expected ? 'success' : 'failure')
                    + ': ' + response;
        elem.style.color = (response === expected ? 'green' : 'red');
    } else {
        elem.innerText = 'Upload Test ' + testNumber + ': ' + response
                        + '\nWARNING: make sure to delete files that ended up in temporary directory!';
    }
    
    document.body.appendChild(elem);
}

// trigger uploadFiles() when files are selected with the filepicker input element
document.getElementById('upload').addEventListener('change', () => {
    const files = document.getElementById('upload').files;
    uploadFiles(files, '/', 'PUT')
    .then((response) => {printResults(response, 'file(s) successfully uploaded', 0);})
    // add test that has directory that is above filesystem to get isDescendantOf error
    // the following tests save files to temporary directory and then doesn't move them - watch out
    .then(() => uploadFiles(files, '/../../', 'PUT'))
    .then((response) => printResults(response, null, -1))
    // could use test to make rename not work - maybe incorrect dir
    .then(() => uploadFiles(files, '/this/doesnt/exist', 'PUT'))
    .then((response) => printResults(response, null, -2))
    .catch((error) => alert('problem with negatively numbered Upload Tests.\n' + error));
});

// test with incorrect method
uploadFiles([], '/', 'DELETE')
.then((response) => printResults(response, 'method not allowed', 1))
// add test with incorrect multipart/form-data body - will now get 'request body has incorrect format'
.then(() => uploadFiles([], '/', 'PUT', 'hello'))
.then((response) => printResults(response, 'request body has incorrect format', 3))
.catch((error) => alert('problem with positively numbered Upload Tests.\n' + error));