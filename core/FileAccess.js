export class FileAccess {

  /** Check is file reading is supported */
  static get isSupported(){
    return !!(window.File && window.FileReader && window.FormData);
  }

  /**
	 * Read file blob from fileField.files[0]
	 * @param {File} fileBlob 
	 */
  static ReadFile(fileBlob) {
    /**
		 * 
		 * @param {function(FileReader):any} readerCallback 
		 */
    function getReaderPromise(readerCallback){
      return new Promise(function (resolve, reject){
        var reader = new FileReader();
			
        reader.onloadend = function () {
          // @ts-ignore
          resolve(reader.result);
        };
			
        reader.onerror = function (err) {
          reject(err);
        };
			
        readerCallback(reader);
      });
    }

    return {
      /**
			 * @returns {Promise<string>}
			 */
      DataURL(){
        return getReaderPromise((reader)=>{reader.readAsDataURL(fileBlob);});
      },
      /**
			 * @returns {Promise<ArrayBuffer>}
			 */
      ArrayBuffer(){
        return getReaderPromise((reader)=>{reader.readAsArrayBuffer(fileBlob);});
      },
      /**
			 * @returns {Promise<string>}
			 */
      BinaryString(){
        return getReaderPromise((reader)=>{reader.readAsBinaryString(fileBlob);});
      },
      /**
			 * @returns {Promise<string>}
			 */
      Text(){
        return getReaderPromise((reader)=>{reader.readAsText(fileBlob);});
      }
    };
  }
}