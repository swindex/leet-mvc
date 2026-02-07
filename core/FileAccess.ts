export class FileAccess {

  /** Check if file reading is supported */
  static get isSupported(): boolean {
    return !!(window.File && window.FileReader && window.FormData);
  }

  /**
   * Read file blob from fileField.files[0]
   */
  static ReadFile(fileBlob: File) {
    function getReaderPromise<T>(readerCallback: (reader: FileReader) => void): Promise<T> {
      return new Promise(function (resolve, reject) {
        const reader = new FileReader();

        reader.onloadend = function () {
          resolve(reader.result as T);
        };

        reader.onerror = function (err) {
          reject(err);
        };

        readerCallback(reader);
      });
    }

    return {
      DataURL(): Promise<string> {
        return getReaderPromise<string>((reader) => { reader.readAsDataURL(fileBlob); });
      },

      ArrayBuffer(): Promise<ArrayBuffer> {
        return getReaderPromise<ArrayBuffer>((reader) => { reader.readAsArrayBuffer(fileBlob); });
      },

      BinaryString(): Promise<string> {
        return getReaderPromise<string>((reader) => { reader.readAsBinaryString(fileBlob); });
      },

      Text(): Promise<string> {
        return getReaderPromise<string>((reader) => { reader.readAsText(fileBlob); });
      }
    };
  }
}