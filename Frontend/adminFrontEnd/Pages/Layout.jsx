import React, { useState } from 'react';
import AdminElementEditor from '../Components/scanner';

const Layout = () => {
  const [selectedElement, setSelectedElement] = useState(null);

  const handleSelectElement = (elementId) => {
    setSelectedElement(elementId);
  };

  return (
    <div>
      <h1>Layout Dashboard</h1>
      <iframe
        src="http://localhost:4001" // URL of the user app
        style={{ width: '100vw', height: '80vh', border: 'none', position:'fixed', top:'20%', left:'0' }}
        onLoad={(e) => {
          const iframe = e.target;
          const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
          iframeDocument.addEventListener('click', (event) => {
            const targetElementId = event.target.getAttribute('data-element-id');
            if (targetElementId) {
              handleSelectElement(targetElementId);
            }
          });
        }}
      ></iframe>
      {selectedElement && <AdminElementEditor elementId={selectedElement} />}
    </div>
  );
};

export default Layout;
