import { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Storage } from 'aws-amplify';
import FileTable from './components/FileTable';
import { UploadedFile } from './types/fileTypes';

function App() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user, signOut } = useAuthenticator();

  useEffect(() => {
    fetchFiles();
  }, []);

  async function fetchFiles() {
    try {
      const result = await Storage.list('', { level: 'protected' });
      const fileList = result.map(item => ({
        id: item.key!,
        name: item.key!.split('/').pop() || item.key!,
        key: item.key!,
        size: item.size || 0,
        type: item.contentType || 'unknown',
        createdAt: item.lastModified?.toISOString() || new Date().toISOString()
      }));
      setFiles(fileList);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files?.length) return;
    
    const file = event.target.files[0];
    const fileName = `${user.userId}/${Date.now()}-${file.name}`;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      await Storage.put(fileName, file, {
        level: 'protected',
        contentType: file.type,
        progressCallback: (progress) => {
          setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
        },
      });
      
      setFiles(prev => [...prev, {
        id: fileName,
        name: file.name,
        key: fileName,
        size: file.size,
        type: file.type,
        createdAt: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      event.target.value = ''; // Reset input
    }
  }

  async function deleteFile(key: string) {
    try {
      await Storage.remove(key, { level: 'protected' });
      setFiles(prev => prev.filter(file => file.key !== key));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  async function getFileUrl(key: string) {
    try {
      return await Storage.get(key, { level: 'protected', download: false });
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>{user?.signInDetails?.loginId}'s File Dashboard</h1>
        <button className="sign-out-btn" onClick={signOut}>Sign out</button>
      </header>
      
      <div className={`upload-area ${isUploading ? 'uploading' : ''}`}>
        <input 
          type="file" 
          id="file-upload"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        <label htmlFor="file-upload">
          {isUploading ? (
            <div className="upload-progress">
              <p>Uploading... {uploadProgress}%</p>
              <progress value={uploadProgress} max="100" />
            </div>
          ) : (
            <div className="upload-prompt">
              <p>Click or drag files to upload</p>
              <small>Files will be stored in your protected S3 folder</small>
            </div>
          )}
        </label>
      </div>
      
      <div className="file-list-container">
        <h2>Your Files ({files.length})</h2>
        <FileTable 
          files={files} 
          onDelete={deleteFile} 
          onView={getFileUrl} 
        />
      </div>
    </div>
  );
}

export default App;