// Helper function to search for a sequence of bytes in an ArrayBuffer
function findSequence(buffer, sequence) {
    const arr = new Uint8Array(buffer);
    const seqLength = sequence.length;
    for (let i = 0; i <= arr.length - seqLength; i++) {
      let match = true;
      for (let j = 0; j < seqLength; j++) {
        if (arr[i + j] !== sequence[j]) {
          match = false;
          break;
        }
      }
      if (match) {
        return i;
      }
    }
    return -1;
  }

  document.getElementById('processButton').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');

    if (fileInput.files.length === 0) {
      console.error('No file selected.');
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
      // Get the file's contents as an ArrayBuffer
      const arrayBuffer = event.target.result;

      // Define the PNG header sequence: 89 50 4E 47 in hexadecimal
      const pngHeader = [0x89, 0x50, 0x4E, 0x47];

      // Find the index of the PNG header sequence
      const index = findSequence(arrayBuffer, pngHeader);
      if (index === -1) {
        console.error('PNG header not found in the file.');
        return;
      }

      // Create a new ArrayBuffer starting from the PNG header
      const trimmedBuffer = arrayBuffer.slice(index);

      // Create a new Blob from the trimmed buffer.
      // Use the original file's MIME type if available.
      const blob = new Blob([trimmedBuffer], { type: file.type || 'application/octet-stream' });

      // Create a temporary download link
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);

      // Generate a new file name by appending '_trimmed' before the extension
      const dotIndex = file.name.lastIndexOf('.');
      let newName;
      if (dotIndex !== -1) {
        newName = file.name.substring(0, dotIndex) + '_trimmed' + file.name.substring(dotIndex);
      } else {
        newName = file.name + '_trimmed';
      }
      downloadLink.download = newName;

      // Append the link to the document, trigger the download, then remove the link
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadLink.href);

      console.log(`Processed file saved as ${newName}`);
    };

    reader.onerror = function(e) {
      console.error('Error reading the file:', e);
    };

    // Read the file as an ArrayBuffer to work with binary data
    reader.readAsArrayBuffer(file);
  });
