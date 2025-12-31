import React from "react";
import { useDropzone, Accept } from "react-dropzone";
import { Box, Typography, Paper } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export type DropzoneAreaProps = {
  maxFileSize?: number;
  filesLimit?: number;
  acceptedFiles?: string[];
  onDrop: (files: File[]) => void | Promise<void>;
  showPreviewsInDropzone?: boolean;
};

export function DropzoneArea({
  maxFileSize = 5000000,
  filesLimit = 10,
  acceptedFiles = [],
  onDrop,
}: DropzoneAreaProps) {
  // Convert acceptedFiles array to Accept object for react-dropzone
  const accept: Accept = acceptedFiles.reduce((acc, mimeType) => {
    acc[mimeType] = [];
    return acc;
  }, {} as Accept);

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      accept,
      maxSize: maxFileSize,
      maxFiles: filesLimit,
      onDrop,
    });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i)) + " " + sizes[i];
  };

  return (
    <Box>
      <Paper
        {...getRootProps()}
        sx={{
          border: "3px dashed",
          borderColor: isDragActive ? "primary.main" : "#C8C8C8",
          backgroundColor: isDragActive ? "action.hover" : "#F0F0F0",
          padding: 3,
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s ease-in-out",
          minHeight: 250,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          "&:hover": {
            borderColor: "primary.main",
            backgroundColor: "action.hover",
          },
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon
          sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
        />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? "Drop files here" : "Drag & drop files here"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          or click to browse
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
          Max {filesLimit} files, {formatFileSize(maxFileSize)} each
        </Typography>
        {acceptedFiles.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            Accepted: {acceptedFiles.join(", ")}
          </Typography>
        )}
      </Paper>
      {fileRejections.length > 0 && (
        <Box sx={{ mt: 1 }}>
          {fileRejections.map(({ file, errors }) => (
            <Typography
              key={file.name}
              variant="caption"
              color="error"
              display="block"
            >
              {file.name} - {errors.map((e) => e.message).join(", ")}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
}
