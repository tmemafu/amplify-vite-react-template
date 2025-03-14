import { useState, useEffect, useCallback } from 'react';
import { Storage } from '@aws-amplify/storage';
import { useDropzone } from 'react-dropzone';


function App() {
  const [fileList, setFileList] = useState<{ key: string }[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // Fetch files from S3
  const fetchFiles = async (): Promise<void> => {
    try {
      const result = await Storage.list('');
      setFileList(result);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  // Upload File to S3
  const uploadFile = async (file: File): Promise<void> => {
    setUploading(true);
    setProgress(0);
    try {
      await Storage.put(file.name, file, {
        contentType: file.type,
        progressCallback: (progress: { loaded: number; total: number }) => {
          setProgress(Math.round((progress.loaded / progress.total) * 100));
        },
      });
      alert(`${file.name} uploaded successfully!`);
      setProgress(0);
      setUploading(false);
      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploading(false);
    }
  };
  

  // Drag & Drop Handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => uploadFile(file));
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // Download file from S3
  const downloadFile = async (fileName: string): Promise<void> => {
    try {
      const signedURL = await Storage.get(fileName, { download: true });
      window.open(signedURL);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: 'auto' }}>
      <h2>User File Upload & Download</h2>

      <div
        {...getRootProps()}
        style={{
          border: '2px dashed #aaa',
          padding: 20,
          textAlign: 'center',
          cursor: 'pointer',
          background: '#f9f9f9',
          marginBottom: 20,
        }}
      >
        <input {...getInputProps()} />
        <p>Drag & drop files here, or click to select files</p>
      </div>

      {uploading && (
        <div style={{ marginBottom: 10 }}>
          <p>Uploading... {progress}%</p>
          <progress value={progress} max="100"></progress>
        </div>
      )}

      <h3>Uploaded Files:</h3>
      <ul>
        {fileList.map((item) => (
          <li key={item.key} style={{ display: 'flex', justifyContent: 'space-between' }}>
            {item.key}
            <button onClick={() => downloadFile(item.key)}>Download</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
