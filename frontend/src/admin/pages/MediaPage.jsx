import { useState } from 'react';
import ImageDropzone from '../components/ImageDropzone';
import { toastError, toastSuccess } from '../utils/alerts';

function MediaPage() {
  const [files, setFiles] = useState([]);

  const onUpload = () => {
    if (!files.length) {
      toastError('Please select at least one image');
      return;
    }
    toastSuccess(`${files.length} image(s) ready for upload`);
  };

  return (
    <div className="admin-media-wrap">
      <ImageDropzone files={files} setFiles={setFiles} />
      <div className="admin-card">
        <div className="admin-card-head">
          <h2>Upload Action</h2>
        </div>
        <p className="mb-3">Connect this button with API when you start dynamic integration.</p>
        <button type="button" className="btn btn-primary" onClick={onUpload}>
          Upload Selected Images
        </button>
      </div>
    </div>
  );
}

export default MediaPage;
