/**
 * demonstrate a canvas tool
 */
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

}
/**
* given an array of .gs file names, it will get the source and return them concatenated for insertion into htmlservice
* like this you can share the same code between client and server side, and use the Apps Script IDE to manage your js code
* @param {string[]} scripts the names of all the scripts needed
* @return {string} the code inside script tags
*/

function requireGs (scripts) {
    return '<script>\n' + scripts.map (function (d) {
        return ScriptApp.getResource(d).getDataAsString();
    })
    .join('\n\n') + '</script>\n';
}