import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Container, Typography, Button, List, ListItem, ListItemIcon, ListItemText, CircularProgress, Snackbar } from '@mui/material';
import { DescriptionOutlined as FileIcon } from '@mui/icons-material';
import { backend } from 'declarations/backend';

interface FileInfo {
  id: bigint;
  name: string;
  size: bigint;
  uploadTime: bigint;
}

function App() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit } = useForm();

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const fetchedFiles = await backend.getFiles();
      setFiles(fetchedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to fetch files. Please try again.');
    }
  };

  const onSubmit = async (data: { file: FileList }) => {
    if (data.file.length > 0) {
      setIsUploading(true);
      const file = data.file[0];
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer]);

      try {
        await backend.uploadFile(file.name, blob);
        await fetchFiles();
      } catch (error) {
        console.error('Error uploading file:', error);
        setError('Failed to upload file. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const formatFileSize = (size: bigint) => {
    const sizeInBytes = Number(size);
    if (sizeInBytes < 1024) return sizeInBytes + ' B';
    if (sizeInBytes < 1048576) return (sizeInBytes / 1024).toFixed(2) + ' KB';
    return (sizeInBytes / 1048576).toFixed(2) + ' MB';
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Container maxWidth="md" className="py-8">
      <Typography variant="h4" component="h1" gutterBottom>
        Modern Dropbox Clone
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
        <input
          type="file"
          {...register('file')}
          className="hidden"
          id="file-input"
        />
        <label htmlFor="file-input">
          <Button
            variant="contained"
            component="span"
            disabled={isUploading}
          >
            {isUploading ? <CircularProgress size={24} /> : 'Upload File'}
          </Button>
        </label>
      </form>

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-8 text-center"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1519849968456-c4918b53e694?ixid=M3w2MzIxNTd8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MjU0NjQ3ODZ8&ixlib=rb-4.0.3)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Typography variant="h6" component="p" className="text-white">
          Drag and drop files here or click the Upload button
        </Typography>
      </div>

      <List>
        {files.map((file) => (
          <ListItem key={file.id.toString()}>
            <ListItemIcon>
              <FileIcon />
            </ListItemIcon>
            <ListItemText
              primary={file.name}
              secondary={`Size: ${formatFileSize(file.size)} | Uploaded: ${new Date(Number(file.uploadTime) / 1000000).toLocaleString()}`}
            />
          </ListItem>
        ))}
      </List>

      <Snackbar
        open={error !== null}
        autoHideDuration={6000}
        onClose={handleCloseError}
        message={error}
      />
    </Container>
  );
}

export default App;
