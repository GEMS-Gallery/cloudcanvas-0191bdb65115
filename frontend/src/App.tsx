import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Container, Typography, Button, List, ListItem, ListItemIcon, ListItemText, CircularProgress, Snackbar, Grid, Card, CardContent, CardActions, IconButton, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { DescriptionOutlined as FileIcon, ViewList, ViewModule, Delete } from '@mui/icons-material';
import { backend } from 'declarations/backend';

interface FileInfo {
  id: bigint;
  name: string;
  size: bigint;
  uploadTime: bigint;
}

function FileCard({ file, onDelete }: { file: FileInfo; onDelete: (id: bigint) => void }) {
  const formatFileSize = (size: bigint) => {
    const sizeInBytes = Number(size);
    if (sizeInBytes < 1024) return sizeInBytes + ' B';
    if (sizeInBytes < 1048576) return (sizeInBytes / 1024).toFixed(2) + ' KB';
    return (sizeInBytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="div">
          {file.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Size: {formatFileSize(file.size)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Uploaded: {new Date(Number(file.uploadTime) / 1000000).toLocaleString()}
        </Typography>
      </CardContent>
      <CardActions>
        <IconButton onClick={() => onDelete(file.id)}>
          <Delete />
        </IconButton>
      </CardActions>
    </Card>
  );
}

function App() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const { register, handleSubmit } = useForm();

  const fetchFiles = useCallback(async () => {
    try {
      const fetchedFiles = await backend.getFiles();
      console.log('Fetched files:', fetchedFiles);
      setFiles(fetchedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to fetch files. Please try again.');
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const onSubmit = async (data: { file: FileList }) => {
    if (data.file.length > 0) {
      setIsUploading(true);
      const file = data.file[0];
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer]);

      try {
        console.log('Uploading file:', file.name);
        const result = await backend.uploadFile(file.name, blob);
        console.log('Upload result:', result);
        await fetchFiles();
      } catch (error) {
        console.error('Error uploading file:', error);
        setError('Failed to upload file. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDeleteFile = async (fileId: bigint) => {
    try {
      console.log('Deleting file:', fileId);
      await backend.deleteFile(fileId);
      await fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Failed to delete file. Please try again.');
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newMode: 'list' | 'grid' | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
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

      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={handleViewModeChange}
        aria-label="view mode"
        className="mb-4"
      >
        <ToggleButton value="list" aria-label="list view">
          <ViewList />
        </ToggleButton>
        <ToggleButton value="grid" aria-label="grid view">
          <ViewModule />
        </ToggleButton>
      </ToggleButtonGroup>

      {viewMode === 'list' ? (
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
              <IconButton onClick={() => handleDeleteFile(file.id)}>
                <Delete />
              </IconButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Grid container spacing={3}>
          {files.map((file) => (
            <Grid item xs={12} sm={6} md={4} key={file.id.toString()}>
              <FileCard file={file} onDelete={handleDeleteFile} />
            </Grid>
          ))}
        </Grid>
      )}

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
