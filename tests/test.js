/**
* This is a test file for client-dev-interface that conducts tests
* from the client by sending HTTP requests. Responses are compared
* to the expected outcome and deemed correct or incorrect.
*
* All HTTP requests must be made in sequence with Promise chains
* because they are handled asynchronously on the server.
*/

'use strict';

const DONE_STATE = 4; // when the HTTP request is completely finished, including response

/**
 * compareAndPrintResults compares the HTTP response body to the expected response
 * body, evaluating whether the test was successful, and creates a new HTML element
 * in the DOM containing success/failure info, test name, and HTTP response received.
 * 
 * If desired (`compHeaders === true`), this function compares response headers with expected.
 * 
 * @param {string} testName the name of this test
 * @param {XMLHttpRequest} response the HTTP request
 * @param {string} expectedResponse the expected HTTP response body
 * @param {object} expectedHeaders javascript object of expected HTTP response headers
 * @param {boolean} compHeaders true if comparison of headers is desired, false otherwise
 */
const compareAndPrintResults = (testName, response, expectedResponse, expectedHeaders, compHeaders) => {
    const curElem = document.createElement("div");

    // first, check that response body is as expected
    let success = response.response === expectedResponse;
    let seenHeaders = {}; // these are going to be the response headers we are looking for

    // compare response headers with expected
    if (compHeaders) {
        Object.keys(expectedHeaders).forEach(header => {
            if (expectedHeaders[header] != response.getResponseHeader(header)) {
                success = false; // some header didn't match
            }
            seenHeaders[header] = response.getResponseHeader(header); // populate object of headers w/ response
        });
    }

    // formatted information about the test that is displayed
    curElem.innerText = 'Test '
    + (success ? 'Success' : 'Failure')
    + '. ' + testName + ': ' + response.response
    + (compHeaders ? '  |  ' + JSON.stringify(seenHeaders) : ''); // last line is response headers

    curElem.style.color = (success ? 'green' : 'red');

    document.body.appendChild(curElem);
}

/**
 * This is a generic function that carries out a full single test. This has a lot
 * of parameters, so wrapper functions are created below for each dev module.
 * However, this gives us some flexibility to create some extra tests for a dev
 * module that don't fit the typical mold. This function returns a Promise.
 *
 * Note to caller: if parameter body is JSON, it must already be stringified.
 * parameter headers is a JavaScript object with request headers as key-value pairs.
 * 
 * This even more generic version of the genericTest function will compare response
 * headers with a given javascript object.
 *
 * @param {string} method 
 * @param {string} devModule 
 * @param {JavaScript Object} headers 
 * @param {JavaScript Object} body 
 * @param {string} testName 
 * @param {string} expectedResult 
 * @param {object} expectedHeaders
 * @param {boolean} compareHeaders
 * @returns {Promise} Promise resolved on end of test
 */
const genericTestWithHeaders = (method, devModule, headers, body, testName, expectedResult, expectedHeaders, compareHeaders) => {
    return new Promise(resolve => {
        const request = new XMLHttpRequest();

        // when we get the entire HTTP response back from the server
        request.onreadystatechange = () => {
            if (request.readyState === DONE_STATE) {
                compareAndPrintResults(testName, request, expectedResult,
                                        expectedHeaders, compareHeaders);
                resolve();
            }
        }

        // devModule has no file extension
        request.open(method, 'http://localhost:8080/client-dev-interface/' + devModule);
        
        // handles a JavaScript object containing request header key-value pairs
        for (const header in headers) {
            request.setRequestHeader(header, headers[header]);
        }

        request.send(body);
    });
}

/**
 * This is a generic function that carries out a full single test. This has a lot
 * of parameters, so wrapper functions are created below for each dev module.
 * However, this gives us some flexibility to create some extra tests for a dev
 * module that don't fit the typical mold. This function returns a Promise.
 *
 * Note to caller: if parameter body is JSON, it must already be stringified.
 * parameter headers is a JavaScript object with request headers as key-value pairs.
 *
 * @param {string} method 
 * @param {string} devModule 
 * @param {JavaScript Object} headers 
 * @param {JavaScript Object} body 
 * @param {string} testName 
 * @param {string} expectedResult 
 */
const genericTest = async (method, devModule, headers, body, testName, expectedResult) => {
    return await genericTestWithHeaders(method, devModule, headers, body, testName, expectedResult,
                                        {}, false);
}

/**
 * createTest uses genericTest to make one test for the create dev module.
 * 
 * @param {string} dir filepath of the directory in which to create a file
 * @param {string} filename name of the object to create
 * @param {boolean} isDir true if object is a directory, false otherwise
 * @param {string} testName the name of this specific test
 * @param {string} expectedResult the expected HTTP response body text
 * @return {Promise} resolved when test completes
 */
const createTest = async (filepath, isDir, testName, expectedResult) => {
    // HTTP request headers
    const headers = {'Content-Type': 'application/json'};
    // HTTP request body, a JSON string encoding of Javascript Object
    const body = JSON.stringify({'Filepath' : filepath, 'isDirectory': isDir});
    return await genericTest('PUT', 'create', headers, body, testName, expectedResult);
}

/**
 * moveTest uses genericTest to make one test for the move dev module.
 * 
 * @param {string} oldPath path of the object to move
 * @param {string} newPath path to move the object to
 * @param {string} testName name of this test
 * @param {string} expectedResult the expected HTTP response body text
 * @return {Promise} resolved when test completes
 */
const moveTest = async (oldPath, newPath, testName, expectedResult) => {
    // HTTP request headers
    const headers = {'Content-Type': 'application/json'};
    // HTTP request body
    const body = JSON.stringify({'oldPath': oldPath, 'newPath': newPath});
    return await genericTest('PATCH', 'move', headers, body, testName, expectedResult);
}

/**
 * dirSnapshotTest uses genericTest to make one test for the dir-snapshot dev module.
 * 
 * @param {string} dirPath path to the directory to take snapshot of
 * @param {string} testName name of this test
 * @param {string} expectedResult the expected HTTP response body text
 * @return {Promise} resolved when test completes
 */
const dirSnapshotTest = async (dirPath, testName, expectedResult) => {
    return await genericTest('GET', 'dir-snapshot?Directory=' + dirPath, {}, '', testName, expectedResult);
}

// put saveTest here

/**
 * editTest uses genericTestWithHeaders to make one test for the edit dev module.
 * 
 * @param {string} fileath path to the file to get contents of
 * @param {string} testName name of this test
 * @param {string} expectedResult the expected HTTP response body text
 * @param {object} expectedHeaders the expected HTTP response headers
 * @return {Promise} resolved when test completes
 */
const editTest = async (filepath, testName, expectedResult, expectedHeaders) => {
    return await genericTestWithHeaders('GET', 'edit?Filepath=' + filepath, {}, '', testName,
                                        expectedResult, expectedHeaders, true);
}

/**
 * saveTest uses genericTest to make one test for the save dev module.
 * 
 * @param {string} filepath path to the file to write to
 * @param {string} data data to write to file
 * @param {object} headers HTTP request headers
 * @param {string} testName name of this test
 * @param {string} expectedResult the expected HTTP response body text
 * @return {Promise} resolved when test completes
 */
const saveTest = async (filepath, data, headers, testName, expectedResult) => {
    return await genericTest('PUT', 'save?Filepath=' + filepath, headers, data, testName, expectedResult);
}

/**
 * existsTest uses genericTest to make one test for the exists dev module.
 * 
 * @param {string} filepath path to the file to check
 * @param {string} testName name of this test
 * @param {string} expectedResult the expected HTTP response body text
 * @return {Promise} resolved when test completes
 */
const existsTest = async (filepath, testName, expectedResult) => {
    return await genericTest('GET', 'exists?Filepath=' + filepath,  {}, {}, testName, expectedResult);
}

/**
 * deleteTest uses genericTest to make one test for the delete dev module.
 * 
 * @param {string} filepath path of the object to delete
 * @param {boolean} isDir true if object to delete is a directory, false otherwise
 * @param {string} testName name of this test
 * @param {string} expectedResult the expected HTTP response body text
 * @return {Promise} resolved when test completes
 */
const deleteTest = async (filepath, isDir, testName, expectedResult) => {
    // HTTP request headers
    const headers = {'Content-Type': 'application/json'};
    // HTTP request body
    const body = JSON.stringify({'Filepath': filepath, 'isDirectory': isDir});
    return await genericTest('DELETE', 'delete', headers, body, testName, expectedResult);
}

/**************************************** Tests ****************************************/

/******************** Testing for Create Module ********************/
createTest('/hihi', true, 'Create Test -1', 'directory successfully created')
.then(() => createTest('/hihi/hello/', true, 'Create Test 0',
                        'directory successfully created'))
.then(() => createTest('/hihi/toDelete.txt', false, 'Create Test 1',
                        'file successfully created'))
.then(() => createTest('/hihi/hello', true, 'Create Test 2',
                        'directory already exists in filesystem'))
.then(() => createTest('/hihi/toDelete.txt', false, 'Create Test 3',
                        'file already exists in filesystem'))
.then(() => genericTest('GET', 'create', {'Content-Type': 'application/json'},
                        JSON.stringify({'Filepath' : '/hihi/toDelete.txt',
                                        'isDirectory' : false}),
                        'Create Test 4', 'method not allowed'))
.then(() => genericTest('PUT', 'create', {'Content-Type': 'application/json'},
                        {'isDirectory' : false}, 'Create Test 5',
                        'request body could not be parsed as JSON'))
.then(() => genericTest('PUT', 'create', {'Content-Type': 'application/json'},
                        JSON.stringify({'isDirectory' : false}), 'Create Test 6',
                        'request body has incorrect content type/format'))
.then(() => createTest('/hihi/more', true, 'Create Test 7',
                        'directory successfully created'))
.then(() => createTest('/hihi/hello/subhello', true, 'Create Test 8',
                        'directory successfully created'))
.then(() => createTest('/hihi/hello/helloChild2', true, 'Create Test 8a',
                        'directory successfully created'))
.then(() => createTest('/hihi/hello/helloChild3', true, 'Create Test 8c',
                        'directory successfully created'))
.then(() => createTest('/hihi/hello/index.html', false, 'Create Test 9',
                        'file successfully created'))
.then(() => createTest('/hihi/hello/styles.css', false, 'Create Test 10',
                        'file successfully created'))
.then(() => createTest('/hihi/hello/script.js', false, 'Create Test 11',
                        'file successfully created'))
.then(() => createTest('/hihi/more/insideMore', true, 'Create Test 12',
                        'directory successfully created'))
.then(() => createTest('/hihi/more/moreFile', false, 'Create Test 13',
                        'file successfully created'))
.then(() => createTest('/hihi/toBeInsideMore', true, 'Create Test 14',
                        'directory successfully created'))
.then(() => createTest('/hihi/index.html', false, 'Create Test 15',
                        'file successfully created'))
.then(() => createTest('/hihi/styles.css', false, 'Create Test 16',
                        'file successfully created'))
.then(() => createTest('/hihi/script.js', false, 'Create Test 17',
                        'file successfully created'))
.then(() => createTest('/hihi/helloChild3', true, 'Create Test 18',
                        'directory successfully created'))
.then(() => createTest('/../gotcha.txt', false, 'Create Test 19',
                        'invalid filepath'))
.catch(error => alert('Something went wrong with Create tests.'))
.then(() => document.body.appendChild(document.createElement('br')))

/******************** Testing for Move Module ********************/
.then(() => moveTest('/hihi/index.html', '/hihi/toBeInsideMore/index.html',
        'Move Test 1', 'move successful'))
.then(() => moveTest('/hihi/toBeInsideMore', '/hihi/more/toBeInsideMore',
                    'Move Test 2', 'move successful'))
.then(() => moveTest('/hihi/toDelete.txt',
                    '/hihi/hello/helloChild2/toDelete.txt',
                    'Move Test 3', 'move successful'))
.then(() => moveTest('/hihi/script.js', '/hihi/more/script.js',
                    'Move Test 4', 'move successful'))
.then(() => moveTest('/hihi/hello/script.js', '/hihi/script.js',
                    'Move Test 5', 'move successful'))
.then(() => moveTest('/hihi/hello/styles.css',
                    '/hihi/hello/subhello/styles.css',
                    'Move Test 6', 'move successful'))
.then(() => moveTest('/hihi/hello/subhello', '/hihi/more/subhello',
                    'Move Test 7', 'move successful'))
.then(() => moveTest('/hihi/styles.css', '/hihi/more/subhello/styles.css',
                    'Move Test 8', 'move successful'))
.then(() => moveTest('/hihi/hello/index.html',
                    '/hihi/more/toBeInsideMore/index.html',
                    'Move Test 9', 'move successful'))
.then(() => moveTest('/hihi/helloChild3', '/hihi/hello/helloChild3',
                    'Move Test 10', 'move successful'))
.then(() => moveTest('/hihi/hello/helloChild3', '/hihi/more',
                    'Move Test 11', 'attempted move to existing nonempty directory'))
.then(() => moveTest('/hihi/goodbye', '/hihi/goodday',
                    'Move Test 12', 'filesystem entry does not exist'))
.then(() => moveTest('/hihi/goodday.txt', '/hihi/goodday.html',
                    'Move Test 13', 'filesystem entry does not exist'))
.then(() => genericTest('POST', 'move', {'Content-Type': 'application/json'},
                        {'oldPath': '/hihi/hello', 'newPath': '/hihi/hi'},
                        'Move Test 14', 'method not allowed'))
.then(() => genericTest('PATCH', 'move', {'Content-Type': 'text/plain'}, 'hi', 'Move Test 15',
                        'request body could not be parsed as JSON'))
.then(() => genericTest('PATCH', 'move', {'Content-Type': 'application/json'},
                        JSON.stringify({'oldPath': '/hihi/hello', 'nonewPath': 'hi'}),
                        'Move Test 16', 'request body has incorrect content type/format'))
.then(() => moveTest('/../thisIsAboveRoot/hello/gday.html', '/hihi/goodday.html',
                        'Move Test 17', 'invalid filepath'))
.then(() => moveTest('/hihi/goodday.txt', '/../../aboveRoot/test/hihi/goodday.html',
                    'Move Test 18', 'invalid filepath'))
.catch(error => alert('Something went wrong with move tests.'))
.then(() => document.body.appendChild(document.createElement('br')))

/******************** Testing for Dir-Snapshot Module ********************/
.then(() => dirSnapshotTest('/hihi/&RandoGarbage=37', 'DirSnapshot Test 1',
                            JSON.stringify([{'name': 'hello', 'isDir': true},
                            {'name': 'more', 'isDir': true}, {'name': 'script.js', 'isDir': false}])))
.then(() => dirSnapshotTest('/hihi/hello/helloChild3', 'DirSnapshot Test 2',
                            JSON.stringify([])))
.then(() => dirSnapshotTest('/hihi/more', 'DirSnapshot Test 3',
                            JSON.stringify([{'name': 'insideMore', 'isDir': true},
                            {'name': 'moreFile', 'isDir': false},
                            {'name': 'script.js', 'isDir': false}, {'name': 'subhello', 'isDir': true},
                            {'name': 'toBeInsideMore', 'isDir': true}])))
.then(() => dirSnapshotTest('/hihi/more/toBeInsideMore/', 'DirSnapshot Test 4',
                            JSON.stringify([{'name': 'index.html', 'isDir': false}])))
.then(() => dirSnapshotTest('/hihi/thisDontexist/', 'DirSnapshot Test 5',
                            'directory does not exist'))
.then(() => dirSnapshotTest('/hihi/script.js', 'DirSnapshot Test 6',
                            'filesystem entry is not a directory'))
.then(() => genericTest('POST', 'dir-snapshot?Directory=', {}, '', 'DirSnapshot Test 7',
                        'method not allowed'))
.then(() => genericTest('GET', 'dir-snapshot?Direcory=/hihi/&RandoGarbage=37', {}, '',
                        'DirSnapshot Test 8', 'incorrect querystring'))
.then(() => dirSnapshotTest('/../thisIsAboveRoot/hi', 'DirSnapshot Test 9', 'invalid filepath'))
.catch(error => alert('Something went wrong with dir-snapshot tests.'))
.then(() => document.body.appendChild(document.createElement('br')))

/******************** Testing for Save Module ********************/
.then(() => saveTest('/hihi/newFile.txt', 'hi', {'Content-Type': 'text/plain'},
                    'Save Test 1', 'file successfully saved'))
.then(() => saveTest('/hihi/hello/helloChild3', 'bye', {'Content-Type': 'text/plain'},
                    'Save Test 2', 'filesystem entry is a directory'))
.then(() => genericTest('GET', 'save?Filepath=/hihi/text.txt',
                        {'Content-Type': 'text/plain'}, 'hello', 'Save Test 3', 'method not allowed'))
.then(() => genericTest('PUT', 'save?Filpath=/hihi/text.txt', {'Content-Type': 'text/plain'},
                        'hello', 'Save Test 4', 'incorrect querystring'))
.then(() => saveTest('/../../WayAboveRoot/thisDoesntExist.txt', 'hi', {'Content-Type': 'text/plain'},
                    'Save Test 5', 'invalid filepath'))
.then(() => saveTest('/hihi/script.js', '//this is inner text of script.js', {'Content-Type': 'text/javascript'},
                    'Save Test 6', 'file successfully saved'))
.then(() => saveTest('/hihi/more/moreFile', 'this is inside moreFile\n wow', {'Content-Type': null},
                    'Save Test 7', 'file successfully saved'))
.then(() => saveTest('/hihi/more/toBeInsideMore/index.html', '<!DOCTYPE html>', {'Content-Type': 'text/html'},
                    'Save Test 8', 'file successfully saved'))
.catch(error => alert('Something went wrong with save tests.\n' + error))
.then(() => document.body.appendChild(document.createElement('br')))

/******************** Testing for Edit Module ********************/
.then(() => editTest('/hihi/hello/helloChild3', 'Edit Test 1',
                    'filesystem entry is a directory', {}))
.then(() => editTest('/hihi/thisDoesntExist.txt', 'Edit Test 2',
                    'file does not exist', {}))
.then(() => genericTest('POST', 'edit?Filepath=/hihi/text.txt', {}, '',
                    'Edit Test 3', 'method not allowed'))
.then(() => genericTest('GET', 'edit?Filpath=/hihi/text.txt', {}, '',
                    'Edit Test 4', 'incorrect querystring'))
.then(() => editTest('/../../WayAboveRoot/thisDoesntExist.txt', 'Edit Test 5',
                    'invalid filepath', {}))
.then(() => editTest('/hihi/script.js', 'Edit Test 6',
                        '//this is inner text of script.js', {'Content-Type': 'application/javascript'}))
.then(() => editTest('/hihi/more/moreFile', 'Edit Test 7',
                        'this is inside moreFile\n wow', {'Content-Type': 'null'}))
.then(() => editTest('/hihi/more/toBeInsideMore/index.html', 'Edit Test 8',
                        '<!DOCTYPE html>', {'Content-Type': 'text/html'}))
.catch(error => alert('Something went wrong with edit tests.\n' + error))
.then(() => document.body.appendChild(document.createElement('br')))

/******************** Testing for Exists Module ********************/
.then(() => genericTest('POST', 'exists?Filepath=/hihi', {}, '', 'Exists Test 1',
                        'method not allowed'))
.then(() => genericTest('GET', 'exists?Fiepat=/hihi', {}, '', 'Exists Test 2',
                        'incorrect querystring'))
.then(() => existsTest('/../above/../../root', 'Exists Test 3', 'invalid filepath'))
.then(() => existsTest('/hihi/script.js', 'Exists Test 4', 'filesystem entry exists'))
.then(() => existsTest('/hihi/nonExistent.txt', 'Exists Test 5',
                        'filesystem entry does not exist'))
.catch(error => alert('Something went wrong with exists tests.\n' + error))
.then(() => document.body.appendChild(document.createElement('br')))

/******************** Testing for Delete Module ********************/
.then(() => deleteTest('/hihi/newFile.txt', false, 'Delete Test -3',
                        'file successfully deleted'))
.then(() => deleteTest('/hihi/hello/helloChild2/toDelete.txt', false, 'Delete Test -2',
                        'file successfully deleted'))
.then(() => deleteTest('/hihi/hello/helloChild2', true, 'Delete Test -2b',
                        'directory successfully deleted'))
.then(() => deleteTest('/hihi/hello/helloChild3', true, 'Delete Test -2c',
                        'directory successfully deleted'))
.then(() => deleteTest('/hihi/more/insideMore', true, 'Delete Test -1',
                        'directory successfully deleted'))
.then(() => deleteTest('/hihi/more/moreFile', false,
                        'Delete Test -1b', 'file successfully deleted'))
.then(() => deleteTest('/hihi/more/script.js', false,
                        'Delete Test -1c', 'file successfully deleted'))
.then(() => deleteTest('/hihi/more/subhello/styles.css', false,
                        'Delete Test -1d', 'file successfully deleted'))
.then(() => deleteTest('/hihi/more/subhello', true,
                        'Delete Test -1e', 'directory successfully deleted'))
.then(() => deleteTest('/hihi/more/toBeInsideMore/index.html', false,
                        'Delete Test -1f', 'file successfully deleted'))
.then(() => deleteTest('/hihi/more/toBeInsideMore', true,
                        'Delete Test -1h', 'directory successfully deleted'))
.then(() => deleteTest('/hihi/more', true, 'Delete Test -1',
                        'directory successfully deleted'))
.then(() => deleteTest('/hihi', true, 'Delete Test 0',
                        'directory not empty'))
.then(() => deleteTest('/hihi/script.js', true, 'Delete Test 1',
                        'directory could not be removed'))
.then(() => deleteTest('/hihi/hello/', false, 'Delete Test 2',
                        'file could not be removed'))
.then(() => deleteTest('/hihi/script.js', false, 'Delete Test 3',
                        'file successfully deleted'))
.then(() => deleteTest('/hihi/hello/', true, 'Delete Test 4',
                        'directory successfully deleted'))
.then(() => deleteTest('/hihi/hello', true, 'Delete Test 5',
                        'system object does not exist'))
.then(() => deleteTest('/hihi/hello/', false, 'Delete Test 6',
                        'system object does not exist'))
.then(() => genericTest('POST', 'delete', {'Content-Type': 'application/json'},
                        JSON.stringify({'Filepath': '/hihi/hello/',
                                        'isDirectory': true}), 'Delete Test 7', 'method not allowed'))
.then(() => genericTest('DELETE', 'delete', {'Content-Type': 'application/json'},
                        JSON.stringify({'Filepath': '/hihi/toDelete.txt',
                                        'someOtherAttribute': -1}), 'Delete Test 8',
                        'request body has incorrect content type/format'))
.then(() => genericTest('DELETE', 'delete', {'Content-Type': 'text/plain'},
                        'here is my request body', 'Delete Test 9',
                        'request body could not be parsed as JSON'))
.then(() => genericTest('DELETE', 'delete', {'Content-Type': 'application/json'},
                        'here is my request body', 'Delete Test 10',
                        'request body could not be parsed as JSON'))
.then(() => deleteTest('/hihi', true, 'Delete Test 11',
                        'directory successfully deleted'))
.then(() => deleteTest('/../thisIsAboveRoot', true, 'Delete Test 12',
                        'invalid filepath'))
.catch(error => alert('Something went wrong with Delete tests.'))
.then(() => document.body.appendChild(document.createElement('br')))

.then(() => {
    const finalElem = document.createElement('div');
    finalElem.innerText = 'End Tests.';
    document.body.appendChild(finalElem);
});
/**************************************** End Tests ****************************************/