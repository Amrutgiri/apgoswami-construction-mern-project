import { useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';

function ImageDropzone({ files, setFiles, maxFiles = 6 }) {
  const onDrop = (acceptedFiles) => {
    setFiles((prev) => {
      const incoming = acceptedFiles.map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file) }),
      );
      return [...prev, ...incoming].slice(0, maxFiles);
    });
  };

  const previews = useMemo(
    () =>
      files.map((file, index) => (
        <div key={`${file.name}-${index}`} className="dz-preview">
          <img src={file.preview} alt={file.name} />
          <button
            type="button"
            className="btn btn-sm btn-danger"
            onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== index))}
          >
            Remove
          </button>
        </div>
      )),
    [files, setFiles],
  );

  useEffect(
    () => () => {
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    },
    [files],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    onDrop,
    multiple: true,
  });

  return (
    <section className="admin-card">
      <div className="admin-card-head">
        <h2>Image Dropzone</h2>
      </div>
      <div {...getRootProps()} className={`admin-dropzone${isDragActive ? ' active' : ''}`}>
        <input {...getInputProps()} />
        <p>Drag and drop images here, or click to select files.</p>
        <small>Maximum files: {maxFiles}</small>
      </div>

      {files.length > 0 && <div className="dz-grid">{previews}</div>}
    </section>
  );
}

export default ImageDropzone;
