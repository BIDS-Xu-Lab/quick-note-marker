/**
 * Format a string with placeholders replaced by values
 * 
 * For example, if the input string is "Hello, {name}!", and the args object is
 * { name: "World" }, the output will be "Hello, World!"
 * 
 * @param {String} str A template string with placeholders
 * @param {Object} args Values to replace the placeholders in the template string
 * @returns String with placeholders replaced by values
 */
export const formatString = function(str, args) {
    for (let key in args) {
        str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
    }

    return str;
}

/**
 * Get the current date and time in the format of YYYY-MM-DD HH:MM:SS
 * @returns current date and time in the format of YYYY-MM-DD HH:MM:SS
 */
export const now = function() {
    // format the date as YYYY-MM-DD HH:MM:SS
    let d = new Date();
    let year = d.getFullYear();
    let month = d.getMonth() + 1;
    let day = d.getDate();
    let hour = d.getHours();
    let minute = d.getMinutes();
    let second = d.getSeconds();

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

/**
 * Get the label from a given string
 * 
 * @param {string} str the label string
 * @returns real label part
 */
export const getLabel = function(str) {
    if (typeof(str) == 'undefined') {
        return "";
    }
    if (str == null) {
        return "";
    }
    let _str = str.trim();
    let parts = _str.split(" ");

    if (parts.length == 1) {
        return _str;
    }

    // get the first part
    let num = parts[0];
    if (num.match(/^\d+(\.\d+)*$/)) {
        // this line has number, remove it
        return _str.replace(/^\d+(\.\d+)*\s*/, "");
    } else {
        // this line does not have number
        return _str;
    }
}

/**
 * Extract a JSON object from a text
 * 
 * @param {string} s a text having json object
 * @returns json object
 */
export const extractJson = function(s) {
    // Find the first occurrence of "{"
    const jsonStart = s.indexOf("{");
    // Find the last occurrence of "}"
    const jsonEnd = s.lastIndexOf("}");
    
    // If valid JSON boundaries are found, slice and parse the JSON
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonStart < jsonEnd) {
        const jsonString = s.slice(jsonStart, jsonEnd + 1);
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            return null;
        }
    }
    
    return null;
}
