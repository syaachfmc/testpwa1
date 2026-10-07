/**
 * Memanggil GAS Web API dan mereturn result object ter-wrapper dengan method .get().
 *
 * @param {string} webAppUrl - URL Web App yang dideploy dari Apps Script.
 * @param {string} gsheetID - Spreadsheet ID.
 * @param {string} sheetName - Nama tab.
 * @param {number} columnRow - Nomor baris header.
 * @param {string} columnTypeRow - Nomor baris tipe kolom.
 * @param {string} dataRange - Format range data.
 * @returns {Promise<Object>} Object dengan status, error, columnHeaders, columnTypeRow, data, dan method get().
 */
async function fetchGSheetData(webAppUrl, gsheetID, sheetName, columnRow, columnTypeRow, dataRange) {
    const url = new URL(webAppUrl);
    url.searchParams.append("GSheetID", gsheetID);
    url.searchParams.append("sheetName", sheetName);
    url.searchParams.append("columnRow", columnRow);
    url.searchParams.append("columnTypeRow", columnTypeRow);
    url.searchParams.append("dataRange", dataRange);

    try {
      // Tambahkan mode: "cors" dan redirect: "follow"
      const response = await fetch(url.toString(), {
        method: "GET",
        mode: "cors",
        redirect: "follow"
      });
      
      if (!response.ok) {
        return attachClientWrapper({
          status: "error",
          error: `HTTP Error ${response.status}: ${response.statusText}`,
          columnHeaders: [],
          columnTypes: [],
          data: []
        });
      }
  
      const rawResult = await response.json();
      return attachClientWrapper(rawResult);
  
    } catch (err) {
      return attachClientWrapper({
        status: "error",
        error: "Gagal terhubung ke API: " + err.message,
        columnHeaders: [],
        columnTypes: [],
        data: []
      });
    }
  }
  
  /**
   * Menambahkan method .get(rowIndex, colIndex) secara non-enumerable pada objek client-side.
   */
  function attachClientWrapper(obj) {
    const safeObj = {
      status: obj && obj.status ? obj.status : "error",
      error: obj && obj.error !== undefined ? obj.error : "Unknown client error",
      columnHeaders: Array.isArray(obj && obj.columnHeaders) ? obj.columnHeaders : [],
      columnTypes: Array.isArray(obj && obj.columnTypes) ? obj.columnTypes : [],      
      data: Array.isArray(obj && obj.data) ? obj.data : []
    };
  
    // Menggunakan Object.defineProperty agar method 'get' bersifat non-enumerable 
    // (tidak muncul pada Object.keys() atau iterasi for...in)
    Object.defineProperty(safeObj, 'get', {
      value: function(rowIndex, colIndex) {
        if (
          Array.isArray(this.data) &&
          rowIndex >= 0 &&
          rowIndex < this.data.length &&
          Array.isArray(this.data[rowIndex]) &&
          colIndex >= 0 &&
          colIndex < this.data[rowIndex].length
        ) {
          return this.data[rowIndex][colIndex];
        }
        return null;
      },
      writable: false,
      configurable: true,
      enumerable: false
    });
  
    return safeObj;
  }

  